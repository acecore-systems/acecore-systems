import {
  getSafeInternalUrl as getSafeInternalPath,
  getSafePublicPathname,
} from "./search-url-safety.ts";
import { isStrictUuid } from "./search-response-safety.ts";

type PagefindResultData = {
  url?: string;
  plain_excerpt?: string;
  meta?: {
    title?: string;
  };
  sub_results?: {
    url?: string;
    title?: string;
    plain_excerpt?: string;
  }[];
};

type PagefindModule = {
  init?: () => Promise<void>;
  search: (query: string) => Promise<{
    results: {
      data: () => Promise<PagefindResultData>;
    }[];
  }>;
};

type SemanticResult = {
  id: string;
  url: string;
  title: string;
  section?: string;
  excerpt?: string;
  contentType?: string;
  rank: number;
};

const NETWORK_SOURCE_SETTINGS = {
  acecore: {
    origin: "https://acecore.net",
    sourceLabel: "Acecore",
  },
  schools: {
    origin: "https://schools.acecore.net",
    sourceLabel: "Acecore Schools",
  },
  wiki: {
    origin: "https://asv-wiki.acecore.net",
    sourceLabel: "Aceserver WIKI",
  },
  portal: {
    origin: "https://asv.acecore.net",
    sourceLabel: "Aceserver Portal",
  },
  "world-foundation": {
    origin: "https://world-foundation.acecore.net",
    sourceLabel: "World Foundation",
  },
} as const;

type NetworkSource = keyof typeof NETWORK_SOURCE_SETTINGS;

type NetworkResult = {
  title: string;
  section: string;
  excerpt: string;
  url: string;
  source: NetworkSource;
  sourceLabel: string;
  rank: number;
};

type SemanticSearchOutcome = "results" | "empty" | "failed" | "cancelled";

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 160;
const PAGEFIND_RESULT_LIMIT = 8;
const SEMANTIC_TIMEOUT_MS = 8_000;
const NETWORK_TIMEOUT_MS = 8_000;
const NETWORK_RESULT_LIMIT = 3;
const PAGEFIND_PATH = "/pagefind/pagefind.js";
const NETWORK_SEARCH_ENDPOINT = "https://acecore.net/api/network-search";
const SEARCH_CLIENT_HEADER = "X-Acecore-Search-Client";
const SEARCH_CLIENT_STORAGE_KEY = "acecore-search-client-id";
const SEARCH_CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let pagefindPromise: Promise<PagefindModule> | null = null;
let pagefindSearchSequence = 0;
let semanticSearchSequence = 0;
let networkSearchSequence = 0;
let submittedSearchSequence = 0;
let semanticController: AbortController | null = null;
let networkController: AbortController | null = null;

function getPagefind() {
  if (!pagefindPromise) {
    pagefindPromise = import(
      /* @vite-ignore */
      PAGEFIND_PATH
    )
      .then(async (module) => {
        const pagefind = module as PagefindModule;
        await pagefind.init?.();
        return pagefind;
      })
      .catch((error: unknown) => {
        pagefindPromise = null;
        throw error;
      });
  }

  return pagefindPromise;
}

function normalizeQuery(value: string) {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

function getQueryLength(query: string) {
  return [...query].length;
}

function isValidQuery(query: string) {
  const length = getQueryLength(query);
  return length >= MIN_QUERY_LENGTH && length <= MAX_QUERY_LENGTH;
}

function getSearchClientId() {
  try {
    const existing = window.sessionStorage.getItem(SEARCH_CLIENT_STORAGE_KEY);

    if (existing && SEARCH_CLIENT_ID_PATTERN.test(existing)) return existing;
    if (typeof window.crypto.randomUUID !== "function") return null;

    const clientId = window.crypto.randomUUID();
    window.sessionStorage.setItem(SEARCH_CLIENT_STORAGE_KEY, clientId);
    return clientId;
  } catch {
    return null;
  }
}

export function getSafeInternalUrl(
  value: unknown,
  origin = window.location.origin,
) {
  return getSafeInternalPath(value, origin);
}

function isNetworkSource(value: unknown): value is NetworkSource {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(NETWORK_SOURCE_SETTINGS, value)
  );
}

function readSafeText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return null;

  const normalized = value.normalize("NFKC").replace(/\s+/gu, " ").trim();
  if (
    !normalized ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/u.test(normalized) ||
    /[\ud800-\udfff]/u.test(normalized)
  ) {
    return null;
  }

  return [...normalized].slice(0, maxLength).join("") || null;
}

export function getSafeNetworkUrl(value: unknown, source: unknown) {
  if (!isNetworkSource(source) || typeof value !== "string") return null;

  const rawUrl = value;
  if (
    !rawUrl ||
    [...rawUrl].length > 500 ||
    rawUrl.includes("\\") ||
    rawUrl.includes("?") ||
    rawUrl.includes("#") ||
    /[\s\u0000-\u001f\u007f]/u.test(rawUrl) ||
    /%(?:2f|5c)/iu.test(rawUrl)
  ) {
    return null;
  }

  const expectedOrigin = NETWORK_SOURCE_SETTINGS[source].origin;
  const rawPathname = readRawPathname(rawUrl, expectedOrigin);
  const pathname = rawPathname ? getSafePublicPathname(rawPathname) : null;
  if (!pathname) return null;

  try {
    const url = new URL(rawUrl);
    if (
      url.protocol !== "https:" ||
      url.origin !== expectedOrigin ||
      url.username ||
      url.password ||
      url.port ||
      url.search ||
      url.hash
    ) {
      return null;
    }

    if (
      (source === "wiki" && !pathname.startsWith("/article/")) ||
      (source === "portal" &&
        [
          "/vector-corpus.json",
          "/404",
          "/404/",
          "/404.html",
          "/404.html/",
        ].includes(pathname))
    ) {
      return null;
    }

    return new URL(pathname, expectedOrigin).href;
  } catch {
    return null;
  }
}

function readRawPathname(value: string, origin: string): string | null {
  if (value === origin) return "/";
  return value.startsWith(`${origin}/`) ? value.slice(origin.length) : null;
}

function normalizeNetworkResult(value: unknown): NetworkResult | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const result = value as Record<string, unknown>;
  if (result.source === "systems" || !isNetworkSource(result.source)) {
    return null;
  }

  const title = readSafeText(result.title, 240);
  const section = readSafeText(result.section, 240);
  const excerpt = readSafeText(result.excerpt, 500);
  const sourceLabel = readSafeText(result.sourceLabel, 120);
  const url = getSafeNetworkUrl(result.url, result.source);
  const rank = result.rank;
  if (
    !title ||
    !section ||
    !excerpt ||
    !sourceLabel ||
    sourceLabel !== NETWORK_SOURCE_SETTINGS[result.source].sourceLabel ||
    !url ||
    !Number.isInteger(rank) ||
    rank < 1 ||
    rank > NETWORK_RESULT_LIMIT
  ) {
    return null;
  }

  return {
    title,
    section,
    excerpt,
    url,
    source: result.source,
    sourceLabel,
    rank,
  };
}

export function normalizeNetworkResults(
  value: unknown,
): NetworkResult[] | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const payload = value as Record<string, unknown>;
  if (
    payload.ok !== true ||
    !isStrictUuid(payload.requestId) ||
    !Array.isArray(payload.results)
  ) {
    return null;
  }

  const results: NetworkResult[] = [];
  const seenUrls = new Set<string>();

  for (const value of payload.results) {
    const result = normalizeNetworkResult(value);
    if (!result || seenUrls.has(result.url)) continue;

    seenUrls.add(result.url);
    results.push(result);
  }

  return results
    .sort((left, right) => left.rank - right.rank)
    .slice(0, NETWORK_RESULT_LIMIT);
}

function clearResults(list: HTMLOListElement) {
  list.replaceChildren();
}

function createResultItem({
  excerpt,
  eyebrow,
  external = false,
  title,
  url,
}: {
  excerpt?: string;
  eyebrow?: string;
  external?: boolean;
  title: string;
  url: string;
}) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  const meta = document.createElement("p");
  const heading = document.createElement("h4");

  link.className = "search-result";
  link.href = url;
  if (external) {
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.referrerPolicy = "no-referrer";
  }
  meta.className = "search-result__meta";
  meta.textContent = eyebrow || "Acecore Systems";
  heading.textContent = title;

  link.append(meta, heading);

  if (excerpt) {
    const description = document.createElement("p");
    description.className = "search-result__excerpt";
    description.textContent = excerpt;
    link.append(description);
  }

  item.append(link);
  return item;
}

async function runPagefindSearch({
  list,
  query,
  section,
  status,
}: {
  list: HTMLOListElement;
  query: string;
  section: HTMLElement;
  status: HTMLElement;
}) {
  const sequence = ++pagefindSearchSequence;
  clearResults(list);

  if (!isValidQuery(query)) {
    section.hidden = true;
    section.removeAttribute("aria-busy");
    status.textContent = "";
    return;
  }

  section.hidden = false;
  section.setAttribute("aria-busy", "true");
  status.textContent = "キーワード検索を読み込んでいます…";

  try {
    const pagefind = await getPagefind();
    const response = await pagefind.search(query);
    const requestedResults = response.results.slice(0, PAGEFIND_RESULT_LIMIT);
    const settledResults = await Promise.allSettled(
      requestedResults.map((result) => result.data()),
    );
    const loadedResults = settledResults.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );

    if (requestedResults.length > 0 && loadedResults.length === 0) {
      throw new Error("Pagefind result data could not be loaded");
    }

    if (sequence !== pagefindSearchSequence) return;

    const fragment = document.createDocumentFragment();
    let renderedCount = 0;

    for (const result of loadedResults) {
      const subResult = result.sub_results?.[0];
      const url = getSafeInternalUrl(subResult?.url || result.url);

      if (!url) continue;

      const title =
        subResult?.title?.trim() ||
        result.meta?.title?.trim() ||
        "Acecore Systems";
      const excerpt =
        subResult?.plain_excerpt?.trim() || result.plain_excerpt?.trim();

      fragment.append(
        createResultItem({
          excerpt,
          eyebrow: "Pagefind / キーワード検索",
          title,
          url,
        }),
      );
      renderedCount += 1;
    }

    list.append(fragment);
    status.textContent =
      renderedCount > 0
        ? `${renderedCount}件の候補を表示しています。`
        : "キーワードに一致するページは見つかりませんでした。";
  } catch {
    if (sequence !== pagefindSearchSequence) return;

    status.textContent =
      "キーワード検索を読み込めませんでした。しばらくしてからもう一度お試しください。";
  } finally {
    if (sequence === pagefindSearchSequence) {
      section.removeAttribute("aria-busy");
    }
  }
}

async function runSemanticSearch({
  list,
  query,
  section,
  status,
}: {
  list: HTMLOListElement;
  query: string;
  section: HTMLElement;
  status: HTMLElement;
}): Promise<SemanticSearchOutcome> {
  semanticController?.abort();
  semanticController = new AbortController();

  const controller = semanticController;
  const sequence = ++semanticSearchSequence;
  let timedOut = false;
  const timeout = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, SEMANTIC_TIMEOUT_MS);

  section.hidden = false;
  section.setAttribute("aria-busy", "true");
  clearResults(list);
  status.textContent = "サイト内を検索しています…";

  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const clientId = getSearchClientId();

    if (clientId) headers[SEARCH_CLIENT_HEADER] = clientId;

    const response = await fetch("/api/search", {
      method: "POST",
      headers,
      body: JSON.stringify({ query, locale: "ja" }),
      signal: controller.signal,
    });

    const payload: unknown = await response.json();

    if (
      sequence !== semanticSearchSequence ||
      !response.ok ||
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      !("ok" in payload) ||
      payload.ok !== true ||
      !("requestId" in payload) ||
      !isStrictUuid(payload.requestId) ||
      !("results" in payload) ||
      !Array.isArray(payload.results)
    ) {
      if (sequence !== semanticSearchSequence) return "cancelled";
      throw new Error("Semantic search failed");
    }

    const fragment = document.createDocumentFragment();
    let renderedCount = 0;

    for (const result of payload.results) {
      const url = getSafeInternalUrl(result.url);

      if (!url || typeof result.title !== "string") continue;

      const detail = [result.contentType, result.section]
        .filter(
          (value): value is string =>
            typeof value === "string" && value.trim().length > 0,
        )
        .join(" / ");

      fragment.append(
        createResultItem({
          excerpt:
            typeof result.excerpt === "string"
              ? result.excerpt.trim()
              : undefined,
          eyebrow: detail || "Vectorize / サイト内",
          title: result.title,
          url,
        }),
      );
      renderedCount += 1;
    }

    list.append(fragment);
    if (renderedCount > 0) {
      status.textContent = `${renderedCount}件の候補を表示しています。`;
      return "results";
    }

    status.textContent =
      "意味が近い公開情報は見つかりませんでした。キーワード検索の候補を表示します。";
    return "empty";
  } catch {
    if (sequence !== semanticSearchSequence) return "cancelled";

    clearResults(list);
    status.textContent = timedOut
      ? "サイト内検索が時間内に完了しませんでした。キーワード検索の候補を表示します。"
      : "サイト内検索は現在利用できません。キーワード検索の候補を表示します。";
    return "failed";
  } finally {
    window.clearTimeout(timeout);

    if (sequence === semanticSearchSequence) {
      section.removeAttribute("aria-busy");
      semanticController = null;
    }
  }
}

async function runNetworkSearch({
  list,
  query,
  section,
  status,
}: {
  list: HTMLOListElement;
  query: string;
  section: HTMLElement;
  status: HTMLElement;
}) {
  networkController?.abort();
  networkController = new AbortController();

  const controller = networkController;
  const sequence = ++networkSearchSequence;
  const timeout = window.setTimeout(
    () => controller.abort(),
    NETWORK_TIMEOUT_MS,
  );

  section.hidden = false;
  section.setAttribute("aria-busy", "true");
  clearResults(list);
  status.textContent = "Acecore関連サイトを確認しています…";

  try {
    const response = await fetch(NETWORK_SEARCH_ENDPOINT, {
      method: "POST",
      credentials: "omit",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, locale: "ja" }),
      signal: controller.signal,
    });
    const payload: unknown = await response.json();
    const results = response.ok ? normalizeNetworkResults(payload) : null;

    if (sequence !== networkSearchSequence) return;
    if (!results || results.length === 0) {
      section.hidden = true;
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const result of results) {
      fragment.append(
        createResultItem({
          excerpt: result.excerpt,
          eyebrow: `${result.sourceLabel} / ${result.section}`,
          external: true,
          title: result.title,
          url: result.url,
        }),
      );
    }

    list.append(fragment);
    status.textContent = `${results.length}件の関連情報を表示しています。`;
  } catch {
    if (sequence !== networkSearchSequence) return;

    clearResults(list);
    section.hidden = true;
  } finally {
    window.clearTimeout(timeout);

    if (sequence === networkSearchSequence) {
      section.removeAttribute("aria-busy");
      networkController = null;
    }
  }
}

function initializeSearchModal() {
  const dialog = document.querySelector<HTMLDialogElement>(
    "[data-search-dialog]",
  );

  if (!dialog || dialog.dataset.initialized === "true") return;

  const form = dialog.querySelector<HTMLFormElement>("[data-search-form]");
  const input = dialog.querySelector<HTMLInputElement>("[data-search-input]");
  const pagefindSection = dialog.querySelector<HTMLElement>(
    "[data-pagefind-section]",
  );
  const pagefindStatus = dialog.querySelector<HTMLElement>(
    "[data-pagefind-status]",
  );
  const pagefindResults = dialog.querySelector<HTMLOListElement>(
    "[data-pagefind-results]",
  );
  const semanticSection = dialog.querySelector<HTMLElement>(
    "[data-semantic-section]",
  );
  const semanticStatus = dialog.querySelector<HTMLElement>(
    "[data-semantic-status]",
  );
  const semanticResults = dialog.querySelector<HTMLOListElement>(
    "[data-semantic-results]",
  );
  const networkSection = dialog.querySelector<HTMLElement>(
    "[data-network-section]",
  );
  const networkStatus = dialog.querySelector<HTMLElement>(
    "[data-network-status]",
  );
  const networkResults = dialog.querySelector<HTMLOListElement>(
    "[data-network-results]",
  );

  if (
    !form ||
    !input ||
    !pagefindSection ||
    !pagefindStatus ||
    !pagefindResults ||
    !semanticSection ||
    !semanticStatus ||
    !semanticResults ||
    !networkSection ||
    !networkStatus ||
    !networkResults
  ) {
    return;
  }

  dialog.dataset.initialized = "true";

  const clearSearchState = () => {
    submittedSearchSequence += 1;
    pagefindSearchSequence += 1;
    semanticSearchSequence += 1;
    networkSearchSequence += 1;
    semanticController?.abort();
    semanticController = null;
    networkController?.abort();
    networkController = null;

    for (const [section, status, results] of [
      [pagefindSection, pagefindStatus, pagefindResults],
      [semanticSection, semanticStatus, semanticResults],
      [networkSection, networkStatus, networkResults],
    ] as const) {
      section.hidden = true;
      section.removeAttribute("aria-busy");
      status.textContent = "";
      clearResults(results);
    }
  };

  for (const trigger of document.querySelectorAll<HTMLElement>(
    "[data-search-open]",
  )) {
    trigger.addEventListener("click", () => {
      trigger.closest("details")?.removeAttribute("open");

      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => input.focus(), 0);
    });
  }

  dialog
    .querySelector<HTMLElement>("[data-search-close]")
    ?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", clearSearchState);

  for (const results of [pagefindResults, semanticResults, networkResults]) {
    results.addEventListener("click", (event) => {
      if (
        event.target instanceof Element &&
        event.target.closest("a.search-result")
      ) {
        dialog.close();
      }
    });
  }

  input.addEventListener("input", () => {
    input.setCustomValidity("");
    clearSearchState();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = normalizeQuery(input.value);

    if (!isValidQuery(query)) {
      input.setCustomValidity(
        getQueryLength(query) < MIN_QUERY_LENGTH
          ? "検索語を2文字以上入力してください。"
          : "検索語は160文字以内で入力してください。",
      );
      input.reportValidity();
      return;
    }

    input.setCustomValidity("");
    input.value = query;
    clearSearchState();
    const searchSequence = ++submittedSearchSequence;

    void (async () => {
      const semanticOutcome = await runSemanticSearch({
        list: semanticResults,
        query,
        section: semanticSection,
        status: semanticStatus,
      });

      if (
        searchSequence !== submittedSearchSequence ||
        semanticOutcome === "cancelled"
      ) {
        return;
      }

      if (semanticOutcome !== "results") {
        await runPagefindSearch({
          list: pagefindResults,
          query,
          section: pagefindSection,
          status: pagefindStatus,
        });
      }

      if (searchSequence !== submittedSearchSequence) return;

      void runNetworkSearch({
        list: networkResults,
        query,
        section: networkSection,
        status: networkStatus,
      });
    })();
  });
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSearchModal, {
      once: true,
    });
  } else {
    initializeSearchModal();
  }
}

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
  preload?: (query: string) => Promise<void> | void;
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

type SemanticResponse =
  | {
      ok: true;
      requestId: string;
      results: SemanticResult[];
    }
  | {
      ok: false;
      requestId: string;
      error: {
        code: string;
      };
    };

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 160;
const PAGEFIND_RESULT_LIMIT = 8;
const SEMANTIC_TIMEOUT_MS = 8_000;
const PAGEFIND_PATH = "/pagefind/pagefind.js";
const SEARCH_CLIENT_HEADER = "X-Acecore-Search-Client";
const SEARCH_CLIENT_STORAGE_KEY = "acecore-search-client-id";
const SEARCH_CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let pagefindPromise: Promise<PagefindModule> | null = null;
let pagefindSearchSequence = 0;
let semanticSearchSequence = 0;
let semanticController: AbortController | null = null;

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

function getSafeInternalUrl(value: unknown) {
  if (typeof value !== "string" || value.length === 0) return null;

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) return null;

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

function clearResults(list: HTMLOListElement) {
  list.replaceChildren();
}

function createResultItem({
  excerpt,
  eyebrow,
  title,
  url,
}: {
  excerpt?: string;
  eyebrow?: string;
  title: string;
  url: string;
}) {
  const item = document.createElement("li");
  const link = document.createElement("a");
  const meta = document.createElement("p");
  const heading = document.createElement("h4");

  link.className = "search-result";
  link.href = url;
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
    section.removeAttribute("aria-busy");
    status.textContent = "2文字以上入力すると候補を表示します。";
    return;
  }

  section.setAttribute("aria-busy", "true");
  status.textContent = "サイト内を検索しています…";

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
          eyebrow: "Pagefind / サイト内",
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
        : "一致するページが見つかりませんでした。";
  } catch {
    if (sequence !== pagefindSearchSequence) return;

    status.textContent =
      "サイト内検索を読み込めませんでした。しばらくしてからもう一度お試しください。";
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
}) {
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
  status.textContent = "関連する内容を探しています…";

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

    const payload = (await response.json()) as SemanticResponse;

    if (
      sequence !== semanticSearchSequence ||
      !response.ok ||
      !payload.ok ||
      !Array.isArray(payload.results)
    ) {
      if (sequence !== semanticSearchSequence) return;
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
          eyebrow: detail || "Vectorize / 関連する内容",
          title: result.title,
          url,
        }),
      );
      renderedCount += 1;
    }

    list.append(fragment);
    status.textContent =
      renderedCount > 0
        ? `${renderedCount}件の関連候補を表示しています。`
        : "関連する内容は見つかりませんでした。サイト内検索結果をご利用ください。";
  } catch {
    if (sequence !== semanticSearchSequence) return;

    clearResults(list);
    status.textContent = timedOut
      ? "関連検索が時間内に完了しませんでした。サイト内検索結果をご利用ください。"
      : "関連検索は現在利用できません。サイト内検索結果をご利用ください。";
  } finally {
    window.clearTimeout(timeout);

    if (sequence === semanticSearchSequence) {
      section.removeAttribute("aria-busy");
      semanticController = null;
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

  if (
    !form ||
    !input ||
    !pagefindSection ||
    !pagefindStatus ||
    !pagefindResults ||
    !semanticSection ||
    !semanticStatus ||
    !semanticResults
  ) {
    return;
  }

  dialog.dataset.initialized = "true";
  let pagefindDebounce = 0;

  for (const trigger of document.querySelectorAll<HTMLElement>(
    "[data-search-open]",
  )) {
    trigger.addEventListener("click", () => {
      trigger.closest("details")?.removeAttribute("open");

      if (!dialog.open) dialog.showModal();
      window.setTimeout(() => input.focus(), 0);
      void getPagefind().catch(() => undefined);
    });
  }

  dialog
    .querySelector<HTMLElement>("[data-search-close]")
    ?.addEventListener("click", () => dialog.close());

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("close", () => {
    semanticController?.abort();
    semanticController = null;
    semanticSearchSequence += 1;
    semanticSection.hidden = true;
    semanticSection.removeAttribute("aria-busy");
  });

  for (const results of [pagefindResults, semanticResults]) {
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
    semanticController?.abort();
    semanticController = null;
    semanticSearchSequence += 1;
    semanticSection.hidden = true;
    semanticSection.removeAttribute("aria-busy");
    clearResults(semanticResults);
    window.clearTimeout(pagefindDebounce);

    const query = normalizeQuery(input.value);

    if (getQueryLength(query) < MIN_QUERY_LENGTH) {
      pagefindSearchSequence += 1;
      clearResults(pagefindResults);
      pagefindStatus.textContent = "2文字以上入力すると候補を表示します。";
      pagefindSection.removeAttribute("aria-busy");
      return;
    }

    void getPagefind()
      .then((pagefind) => pagefind.preload?.(query))
      .catch(() => undefined);

    pagefindDebounce = window.setTimeout(() => {
      void runPagefindSearch({
        list: pagefindResults,
        query,
        section: pagefindSection,
        status: pagefindStatus,
      });
    }, 220);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    window.clearTimeout(pagefindDebounce);

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

    void runPagefindSearch({
      list: pagefindResults,
      query,
      section: pagefindSection,
      status: pagefindStatus,
    });
    void runSemanticSearch({
      list: semanticResults,
      query,
      section: semanticSection,
      status: semanticStatus,
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeSearchModal, {
    once: true,
  });
} else {
  initializeSearchModal();
}

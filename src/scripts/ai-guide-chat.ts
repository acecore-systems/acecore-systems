export type AiGuideMessage = {
  role: "user" | "assistant";
  content: string;
};

export const AI_GUIDE_API_URL = "https://acecore.net/api/ai-contact";
export const AI_GUIDE_CLIENT_HEADER = "X-Acecore-AI-Client";
export const AI_GUIDE_TIMEOUT_MS = 25_000;
export const AI_GUIDE_MAX_QUESTION_LENGTH = 800;
export const AI_GUIDE_MAX_HISTORY_MESSAGES = 8;
export const AI_GUIDE_MAX_HISTORY_LENGTH = 2_400;

const SYSTEMS_ORIGIN = "https://systems.acecore.net";
const ALLOWED_HTTPS_ORIGINS = new Set([
  "https://acecore.net",
  SYSTEMS_ORIGIN,
  "https://schools.acecore.net",
  "https://asv.acecore.net",
  "https://asv-wiki.acecore.net",
  "https://world-foundation.acecore.net",
]);
const LINE_URL = "https://lin.ee/DjIrdqj";
const EMAIL_URL = "mailto:info@acecore.net";
const PHONE_URL = "tel:05088902788";
const CLIENT_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const INLINE_MARKDOWN_PATTERN =
  /(\[([^\]\n]{1,240})\]\(([^)\s]{1,1000})\)|\*\*([^*\n]{1,500})\*\*|`([^`\n]{1,200})`|\*([^*\n]{1,500})\*)/gu;

let stableClientId: string | null = null;

export function normalizeAiGuideQuestion(value: string): string {
  return value.normalize("NFKC").replace(/\s+/gu, " ").trim();
}

export function trimAiGuideHistory(
  messages: readonly AiGuideMessage[],
): AiGuideMessage[] {
  const normalized = messages
    .filter(
      (message): message is AiGuideMessage =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim().length > 0,
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, AI_GUIDE_MAX_QUESTION_LENGTH),
    }))
    .slice(-AI_GUIDE_MAX_HISTORY_MESSAGES);
  const selected: AiGuideMessage[] = [];
  let remainingLength = AI_GUIDE_MAX_HISTORY_LENGTH;

  for (let index = normalized.length - 1; index >= 0; index -= 1) {
    const message = normalized[index];
    if (!message || remainingLength <= 0) break;

    const content =
      message.content.length <= remainingLength
        ? message.content
        : message.content.slice(message.content.length - remainingLength);
    if (!content) break;

    selected.unshift({ role: message.role, content });
    remainingLength -= content.length;
  }

  return selected;
}

export function isSafeAiGuideHref(
  value: unknown,
  currentOrigin = SYSTEMS_ORIGIN,
): boolean {
  if (typeof value !== "string") return false;

  const href = value.trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href.toLowerCase() === EMAIL_URL) return true;
  if (href === PHONE_URL) return true;

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;

      const url = new URL(href, currentOrigin);
      return (
        url.origin === new URL(currentOrigin).origin &&
        !url.username &&
        !url.password
      );
    }

    const url = new URL(href);
    if (url.username || url.password) return false;
    if (url.href === LINE_URL) return true;

    return (
      url.protocol === "https:" &&
      !url.port &&
      ALLOWED_HTTPS_ORIGINS.has(url.origin)
    );
  } catch {
    return false;
  }
}

export function createAiGuideClientId(
  cryptoSource: Crypto | undefined = globalThis.crypto,
): string | null {
  if (!cryptoSource) return null;

  try {
    if (typeof cryptoSource.randomUUID === "function") {
      const id = cryptoSource.randomUUID();
      if (CLIENT_ID_PATTERN.test(id)) return id.toLowerCase();
    }
  } catch {
    // Fall through to getRandomValues for older secure contexts.
  }

  try {
    const bytes = cryptoSource.getRandomValues(new Uint8Array(16));
    bytes[6] = ((bytes[6] ?? 0) & 0x0f) | 0x40;
    bytes[8] = ((bytes[8] ?? 0) & 0x3f) | 0x80;
    const hex = Array.from(bytes, (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const id = [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");

    return CLIENT_ID_PATTERN.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function getStableAiGuideClientId(): string | null {
  if (!stableClientId) stableClientId = createAiGuideClientId();
  return stableClientId;
}

export function shouldDiscardAiGuideResponse({
  panelHidden,
  requestAborted,
}: {
  panelHidden: boolean;
  requestAborted: boolean;
}): boolean {
  return panelHidden || requestAborted;
}

function appendInlineMarkdown(parent: HTMLElement, text: string): void {
  INLINE_MARKDOWN_PATTERN.lastIndex = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE_MARKDOWN_PATTERN)) {
    const matchIndex = match.index;
    if (matchIndex > index) {
      parent.append(document.createTextNode(text.slice(index, matchIndex)));
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      const label = match[2];
      const href = match[3].trim();

      if (isSafeAiGuideHref(href, window.location.origin)) {
        const link = document.createElement("a");
        link.textContent = label;
        link.setAttribute("href", href);

        try {
          const url = new URL(href, window.location.href);
          if (
            url.protocol === "https:" &&
            url.origin !== window.location.origin
          ) {
            link.target = "_blank";
            link.rel = "noopener noreferrer";
          }
        } catch {
          // The allow-list check above already rejected malformed URLs.
        }

        parent.append(link);
      } else {
        parent.append(document.createTextNode(label));
      }
    } else if (match[4] !== undefined) {
      const strong = document.createElement("strong");
      strong.textContent = match[4];
      parent.append(strong);
    } else if (match[5] !== undefined) {
      const code = document.createElement("code");
      code.textContent = match[5];
      parent.append(code);
    } else if (match[6] !== undefined) {
      const emphasis = document.createElement("em");
      emphasis.textContent = match[6];
      parent.append(emphasis);
    }

    index = matchIndex + match[0].length;
  }

  if (index < text.length) {
    parent.append(document.createTextNode(text.slice(index)));
  }
}

function appendMarkdownContent(container: HTMLElement, content: string): void {
  const lines = content.replace(/\r\n?/gu, "\n").split("\n");
  let activeList: HTMLOListElement | HTMLUListElement | null = null;
  let activeListType: "ol" | "ul" | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      activeList = null;
      activeListType = null;
      continue;
    }

    const unordered = line.match(/^[-*]\s+(.+)$/u);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/u);
    const listType = unordered ? "ul" : ordered ? "ol" : null;

    if (listType) {
      if (!activeList || activeListType !== listType) {
        activeList = document.createElement(listType);
        activeListType = listType;
        container.append(activeList);
      }

      const item = document.createElement("li");
      appendInlineMarkdown(item, (unordered?.[1] || ordered?.[1] || "").trim());
      activeList.append(item);
      continue;
    }

    activeList = null;
    activeListType = null;
    const paragraph = document.createElement("p");
    appendInlineMarkdown(paragraph, line);
    container.append(paragraph);
  }
}

function createMessageElement({
  assistantLabel,
  content,
  error = false,
  role,
  visitorLabel,
}: {
  assistantLabel: string;
  content: string;
  error?: boolean;
  role: AiGuideMessage["role"];
  visitorLabel: string;
}): HTMLElement {
  const message = document.createElement("article");
  const label = document.createElement("p");
  const body = document.createElement("div");

  message.className = `ai-guide__message ai-guide__message--${role}`;
  if (error) message.classList.add("ai-guide__message--error");
  label.className = "ai-guide__message-label";
  label.textContent = role === "assistant" ? assistantLabel : visitorLabel;
  body.className = "ai-guide__message-body";
  appendMarkdownContent(body, content);
  message.append(label, body);

  return message;
}

function createLoadingElement(
  assistantLabel: string,
  loadingText: string,
): HTMLElement {
  const message = document.createElement("article");
  const label = document.createElement("p");
  const body = document.createElement("div");

  message.className =
    "ai-guide__message ai-guide__message--assistant ai-guide__message--loading";
  message.setAttribute("aria-hidden", "true");
  label.className = "ai-guide__message-label";
  label.textContent = assistantLabel;
  body.className = "ai-guide__typing";
  body.title = loadingText;

  for (let index = 0; index < 3; index += 1) {
    body.append(document.createElement("span"));
  }

  message.append(label, body);
  return message;
}

function initializeAiGuideChat(): void {
  const root = document.querySelector<HTMLElement>("[data-ai-guide]");
  if (!root || root.dataset.initialized === "true") return;

  const panel = root.querySelector<HTMLElement>("[data-ai-guide-panel]");
  const toggle = root.querySelector<HTMLButtonElement>(
    "[data-ai-guide-toggle]",
  );
  const close = root.querySelector<HTMLButtonElement>("[data-ai-guide-close]");
  const messages = root.querySelector<HTMLElement>("[data-ai-guide-messages]");
  const form = root.querySelector<HTMLFormElement>("[data-ai-guide-form]");
  const input = root.querySelector<HTMLTextAreaElement>(
    "[data-ai-guide-input]",
  );
  const submit = root.querySelector<HTMLButtonElement>(
    "[data-ai-guide-submit]",
  );
  const status = root.querySelector<HTMLElement>("[data-ai-guide-status]");

  if (
    !panel ||
    !toggle ||
    !close ||
    !messages ||
    !form ||
    !input ||
    !submit ||
    !status
  ) {
    return;
  }

  const copy = {
    assistantLabel: root.dataset.assistantLabel || "Systems AI guide",
    visitorLabel: root.dataset.visitorLabel || "You",
    emptyError: root.dataset.emptyError || "Please enter a question.",
    tooLongError:
      root.dataset.tooLongError ||
      "Please keep the question within 800 characters.",
    timeoutError:
      root.dataset.timeoutError ||
      "The answer took too long. Please try again.",
    genericError:
      root.dataset.genericError ||
      "The AI guide is currently unavailable. Please use the contact form.",
    sending: root.dataset.sending || "Preparing an answer…",
  };
  const apiUrl = root.dataset.apiUrl || AI_GUIDE_API_URL;
  const locale = root.dataset.locale || "ja";
  let conversation: AiGuideMessage[] = [];
  let requestController: AbortController | null = null;
  let lastFocusedElement: HTMLElement | null = null;

  root.dataset.initialized = "true";

  const scrollToLatest = () => {
    messages.scrollTop = messages.scrollHeight;
  };

  const renderMessage = (
    role: AiGuideMessage["role"],
    content: string,
    error = false,
  ) => {
    const element = createMessageElement({
      assistantLabel: copy.assistantLabel,
      content,
      error,
      role,
      visitorLabel: copy.visitorLabel,
    });
    messages.append(element);
    scrollToLatest();
    return element;
  };

  const openPanel = () => {
    lastFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : toggle;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");
    root.classList.add("is-open");
    window.setTimeout(() => input.focus(), 0);
    scrollToLatest();
  };

  const closePanel = () => {
    if (panel.hidden) return;

    requestController?.abort();
    panel.hidden = true;
    toggle.setAttribute("aria-expanded", "false");
    root.classList.remove("is-open");
    (lastFocusedElement || toggle).focus();
  };

  toggle.addEventListener("click", () => {
    if (panel.hidden) openPanel();
    else closePanel();
  });
  close.addEventListener("click", closePanel);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      closePanel();
    }
  });

  input.addEventListener("input", () => {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
    status.textContent = "";
  });

  for (const prompt of root.querySelectorAll<HTMLButtonElement>(
    "[data-ai-guide-prompt]",
  )) {
    prompt.addEventListener("click", () => {
      if (requestController) return;
      input.value = prompt.dataset.aiGuidePrompt || prompt.textContent || "";
      form.requestSubmit();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (requestController) return;

    const question = normalizeAiGuideQuestion(input.value);
    if (!question || question.length > AI_GUIDE_MAX_QUESTION_LENGTH) {
      const validationMessage = question ? copy.tooLongError : copy.emptyError;
      input.setCustomValidity(validationMessage);
      input.setAttribute("aria-invalid", "true");
      status.textContent = validationMessage;
      input.reportValidity();
      return;
    }

    const clientId = getStableAiGuideClientId();
    if (!clientId) {
      renderMessage("assistant", copy.genericError, true);
      status.textContent = copy.genericError;
      return;
    }

    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
    input.value = "";
    conversation = trimAiGuideHistory([
      ...conversation,
      { role: "user", content: question },
    ]);
    renderMessage("user", question);

    const loading = createLoadingElement(copy.assistantLabel, copy.sending);
    messages.append(loading);
    scrollToLatest();
    messages.setAttribute("aria-busy", "true");
    status.textContent = copy.sending;
    submit.disabled = true;
    input.disabled = true;

    requestController = new AbortController();
    const activeController = requestController;
    let timedOut = false;
    const timeout = window.setTimeout(() => {
      timedOut = true;
      activeController.abort();
    }, AI_GUIDE_TIMEOUT_MS);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          [AI_GUIDE_CLIENT_HEADER]: clientId,
        },
        body: JSON.stringify({
          locale,
          messages: conversation,
          question,
        }),
        signal: activeController.signal,
      });
      const payload = (await response.json()) as {
        ok?: unknown;
        answer?: unknown;
      };
      const answer =
        typeof payload.answer === "string" ? payload.answer.trim() : "";

      if (
        shouldDiscardAiGuideResponse({
          panelHidden: panel.hidden,
          requestAborted: activeController.signal.aborted,
        })
      ) {
        return;
      }

      if (!response.ok || payload.ok !== true || !answer) {
        const errorAnswer = answer || copy.genericError;
        renderMessage("assistant", errorAnswer, true);
        status.textContent = errorAnswer;
        return;
      }

      conversation = trimAiGuideHistory([
        ...conversation,
        { role: "assistant", content: answer },
      ]);
      renderMessage("assistant", answer);
      status.textContent = "";
    } catch (error) {
      if (
        shouldDiscardAiGuideResponse({
          panelHidden: panel.hidden,
          requestAborted: activeController.signal.aborted && !timedOut,
        })
      ) {
        return;
      }

      const errorMessage = timedOut ? copy.timeoutError : copy.genericError;
      renderMessage("assistant", errorMessage, true);
      status.textContent = errorMessage;
    } finally {
      window.clearTimeout(timeout);
      loading.remove();

      if (requestController === activeController) {
        requestController = null;
        messages.removeAttribute("aria-busy");
        submit.disabled = false;
        input.disabled = false;
        if (!panel.hidden) input.focus();
      }
    }
  });

  window.addEventListener(
    "pagehide",
    () => {
      requestController?.abort();
    },
    { once: true },
  );
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAiGuideChat, {
      once: true,
    });
  } else {
    initializeAiGuideChat();
  }
}

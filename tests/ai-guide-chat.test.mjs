import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { aiGuideChatCopy } from "../src/i18n/ai-guide-chat.ts";
import { locales } from "../src/i18n/config.ts";
import {
  AI_GUIDE_API_URL,
  AI_GUIDE_CLIENT_HEADER,
  AI_GUIDE_MAX_HISTORY_LENGTH,
  AI_GUIDE_MAX_HISTORY_MESSAGES,
  AI_GUIDE_MAX_QUESTION_LENGTH,
  AI_GUIDE_TIMEOUT_MS,
  createAiGuideClientId,
  getStableAiGuideClientId,
  isSafeAiGuideHref,
  normalizeAiGuideQuestion,
  shouldDiscardAiGuideResponse,
  trimAiGuideHistory,
} from "../src/scripts/ai-guide-chat.ts";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

test("9言語のチャット文言と3つの質問候補を揃える", () => {
  assert.deepEqual(Object.keys(aiGuideChatCopy).sort(), [...locales].sort());

  for (const locale of locales) {
    const copy = aiGuideChatCopy[locale];
    assert.equal(copy.quickPrompts.length, 3, locale);

    for (const [key, value] of Object.entries(copy)) {
      if (Array.isArray(value)) {
        assert.equal(
          value.every((item) => item.trim().length > 0),
          true,
          key,
        );
      } else {
        assert.equal(value.trim().length > 0, true, `${locale}.${key}`);
      }
    }
  }
});

test("質問を正規化し、上限を800文字として公開する", () => {
  assert.equal(
    normalizeAiGuideQuestion("  社内　申請を   Web化したい  "),
    "社内 申請を Web化したい",
  );
  assert.equal(AI_GUIDE_MAX_QUESTION_LENGTH, 800);
});

test("履歴を直近8件かつ2400文字以内へ制限する", () => {
  const source = Array.from({ length: 12 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `${index}:${"x".repeat(390)}`,
  }));
  const trimmed = trimAiGuideHistory(source);

  assert.equal(trimmed.length <= AI_GUIDE_MAX_HISTORY_MESSAGES, true);
  assert.equal(trimmed.at(-1)?.content.startsWith("11:"), true);
  assert.equal(
    trimmed.reduce((total, message) => total + message.content.length, 0) <=
      AI_GUIDE_MAX_HISTORY_LENGTH,
    true,
  );
  assert.equal(source.length, 12);
});

test("MarkdownリンクをAcecore公式URLと固定連絡先に限定する", () => {
  for (const href of [
    "/pricing/",
    "/en/contact/?from=ai#form",
    "https://acecore.net/contact/",
    "https://systems.acecore.net/pricing/",
    "https://schools.acecore.net/en/",
    "https://asv.acecore.net/",
    "https://asv-wiki.acecore.net/rules/",
    "https://world-foundation.acecore.net/",
    "https://lin.ee/DjIrdqj",
    "mailto:info@acecore.net",
    "tel:05088902788",
  ]) {
    assert.equal(isSafeAiGuideHref(href), true, href);
  }

  for (const href of [
    "//evil.example/path",
    "javascript:alert(1)",
    "data:text/html,hello",
    "https://acecore.net.evil.example/",
    "https://user@acecore.net/",
    "http://acecore.net/",
    "https://lin.ee/DjIrdqj?redirect=evil",
    "mailto:other@example.com",
    "tel:0123456789",
    "/safe\\evil",
  ]) {
    assert.equal(isSafeAiGuideHref(href), false, href);
  }
});

test("クライアントIDを保存領域なしで安定したUUIDとして生成する", () => {
  const fromRandomUuid = createAiGuideClientId({
    randomUUID: () => "018f7e5a-7b4d-7c6a-8e9f-0123456789ab",
    getRandomValues: () => {
      throw new Error("fallback must not run");
    },
  });
  assert.equal(fromRandomUuid, "018f7e5a-7b4d-7c6a-8e9f-0123456789ab");

  const fallback = createAiGuideClientId({
    randomUUID: () => "invalid",
    getRandomValues: (bytes) => {
      bytes.fill(0);
      return bytes;
    },
  });
  assert.match(fallback, UUID_PATTERN);

  const first = getStableAiGuideClientId();
  const second = getStableAiGuideClientId();
  assert.match(first, UUID_PATTERN);
  assert.equal(second, first);
});

test("閉じたpanelまたはabort済みrequestの応答を破棄する", () => {
  assert.equal(
    shouldDiscardAiGuideResponse({
      panelHidden: false,
      requestAborted: false,
    }),
    false,
  );
  assert.equal(
    shouldDiscardAiGuideResponse({
      panelHidden: true,
      requestAborted: false,
    }),
    true,
  );
  assert.equal(
    shouldDiscardAiGuideResponse({
      panelHidden: false,
      requestAborted: true,
    }),
    true,
  );
});

test("中央API、25秒timeout、安全なDOM描画を実装する", () => {
  assert.equal(AI_GUIDE_API_URL, "/api/ai-chat");
  assert.equal(AI_GUIDE_CLIENT_HEADER, "X-Acecore-AI-Client");
  assert.equal(AI_GUIDE_TIMEOUT_MS, 25_000);

  const script = readFileSync(
    new URL("../src/scripts/ai-guide-chat.ts", import.meta.url),
    "utf8",
  );
  const component = readFileSync(
    new URL("../src/components/AiGuideChat.astro", import.meta.url),
    "utf8",
  );
  const layout = readFileSync(
    new URL("../src/layouts/BaseLayout.astro", import.meta.url),
    "utf8",
  );

  assert.match(script, /AbortController/u);
  assert.match(
    script,
    /const closePanel = \(\) => \{[\s\S]*?requestController\?\.abort\(\);/u,
  );
  assert.match(script, /shouldDiscardAiGuideResponse/u);
  assert.match(script, /credentials:\s*"omit"/u);
  assert.doesNotMatch(script, /(?:local|session)Storage/u);
  assert.doesNotMatch(script, /innerHTML|insertAdjacentHTML|eval\(/u);
  assert.match(component, /maxlength="800"/u);
  assert.match(component, /role="dialog"/u);
  assert.match(component, /role="log"/u);
  assert.match(layout, /<AiGuideChat locale=\{locale\} \/>/u);
});

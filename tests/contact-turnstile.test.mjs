import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const contactPage = await readFile(
  new URL("../src/pages/contact.astro", import.meta.url),
  "utf8",
);

test("期限切れの Turnstile トークンを自動的に再取得する", () => {
  assert.match(
    contactPage,
    /function resetTurnstile\(\) \{[\s\S]*?window\.turnstile\.reset\(widgetId\);/u,
  );
  assert.match(contactPage, /"expired-callback": resetTurnstile,/u);
});

test("トークン未取得時に再試行できるよう Turnstile をリセットする", () => {
  const noTokenBranch = contactPage.slice(
    contactPage.indexOf("if (!turnstileToken)"),
    contactPage.indexOf("if (status) status.hidden = true;"),
  );

  assert.match(
    noTokenBranch,
    /dispatchEvent\(new Event\("turnstile-reset"\)\)/u,
  );
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getConsultationSubject } from "../src/lib/contact-prefill.ts";

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

test("種別未選択の案内ラベルを相談件名へ転記しない", () => {
  assert.equal(
    getConsultationSubject({
      currentValue: "",
      categoryValue: "",
      selectedLabel: "選択してください",
      locale: "ja",
      suffix: "についての相談",
    }),
    "",
  );
});
test("選択サービスの件名は自然な日本語にし、編集済み件名を保持する", () => {
  const input = {
    currentValue: "",
    categoryValue: "website",
    selectedLabel: "ホームページ制作・更新について",
    locale: "ja",
    suffix: "についての相談",
  };
  assert.equal(
    getConsultationSubject(input),
    "ホームページ制作・更新についての相談",
  );
  assert.equal(
    getConsultationSubject({ ...input, currentValue: "既存の件名" }),
    "既存の件名",
  );
});
test("翻訳済みの選択ラベルと相談接尾辞を保持する", () => {
  assert.equal(
    getConsultationSubject({
      currentValue: "",
      categoryValue: "development",
      selectedLabel: "Business system development",
      locale: "en",
      suffix: "Consultation",
    }),
    "Business system development — Consultation",
  );
});

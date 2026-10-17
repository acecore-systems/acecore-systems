import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { getConsultationSubject } from "../src/lib/contact-prefill.ts";
import { getContactFormText } from "../src/i18n/contact-form.ts";

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

test("ホームページ相談は全言語で既存受付valueを保ち、表示ラベルと入力ヘルプを用意する", () => {
  const value = "ホームページ制作・更新について";
  for (const locale of [
    "ja",
    "en",
    "zh-cn",
    "es",
    "pt",
    "fr",
    "ko",
    "de",
    "ru",
  ]) {
    const copy = getContactFormText(locale);
    const options = copy.categoryOptions.filter(
      (option) => option.value === value,
    );
    assert.equal(
      options.length,
      1,
      `${locale}: website category must be unique`,
    );
    assert.ok(options[0].label.trim(), `${locale}: website label is required`);
    assert.ok(
      copy.messageHelp.trim(),
      `${locale}: persistent message help is required`,
    );
    if (locale !== "ja") {
      assert.doesNotMatch(
        options[0].label,
        /[ぁ-ゖァ-ヺ]/u,
        `${locale}: website label must be localized`,
      );
      assert.doesNotMatch(
        copy.messageHelp,
        /[ぁ-ゖァ-ヺ]/u,
        `${locale}: message help must be localized`,
      );
    }
  }
});

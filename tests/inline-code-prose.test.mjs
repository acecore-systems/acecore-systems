import assert from "node:assert/strict";
import test from "node:test";
import { withoutInlineCode } from "../scripts/inline-code-prose.mjs";

const japanese = /[\u3040-\u30ff\u3400-\u9fff]/u;

test("同じ長さの区切りで囲まれた実際のMarkdown例はコードとして除外する", () => {
  const example = "| `` `code` と [link]( /contact/ ) `` | rendered |";
  assert.equal(japanese.test(withoutInlineCode(example)), false);
  assert.equal(withoutInlineCode("Before `日本語` after"), "Before  after");
  assert.equal(withoutInlineCode("Before ```日本語``` after"), "Before  after");
});

test("コード外と閉じていない・長さが一致しない区切りの日本語は残す", () => {
  for (const value of [
    "日本語 `` `code` と [link]( /contact/ ) ``",
    "``日本語`",
    "`日本語``",
    "``日本語",
    "`日本語\n`",
    "\\`日本語`",
  ]) {
    assert.equal(japanese.test(withoutInlineCode(value)), true, value);
  }
});

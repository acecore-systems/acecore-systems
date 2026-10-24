import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  writeFileSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import {
  sourceDirectory,
  pendingPath,
  stageTranslation,
  translationBaseline,
  pendingSourceOverrides,
  hashText,
  loadPending,
} from "../scripts/stage-seo-translation.mjs";

test("Japanese revision preserves all translated bytes and leaves exact pending baselines until translation arrives", () => {
  const root = mkdtempSync(join(tmpdir(), "seo-pending-"));
  const source = sourceDirectory + "/example.md";
  const locales = ["en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"];
  const old = '---\ntitle: "Original"\n---\nOriginal body\n';
  const next = old + "\nNew supported reference.\n";
  const put = (path, value) => {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), value);
  };
  const git = (args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  try {
    put(source, old);
    for (const locale of locales)
      put(
        sourceDirectory + "/" + locale + "/example.md",
        "Translated " + locale,
      );
    git(["init", "-q"]);
    git(["add", "."]);
    git([
      "-c",
      "user.name=Test",
      "-c",
      "user.email=test@example.invalid",
      "-c",
      "commit.gpgsign=false",
      "commit",
      "-qm",
      "fixture",
    ]);
    const base = git(["rev-parse", "HEAD"]);
    put(source, next);
    stageTranslation(root, source, base);
    const entry = loadPending(root)[source];
    assert.equal(entry.sourceHash, hashText(next));
    assert.equal(entry.previousSourceHash, hashText(old));
    assert.equal(pendingSourceOverrides(root).get(source), old);
    for (const locale of locales) {
      const translated = readFileSync(
        join(root, sourceDirectory, locale, "example.md"),
        "utf8",
      );
      assert.equal(translated, "Translated " + locale);
      assert.equal(translationBaseline(root, source, locale, translated), old);
    }
    assert.throws(() => stageTranslation(root, source, base), /still pending/);
    assert.throws(
      () => stageTranslation(root, source, "0".repeat(40)),
      /base commit/,
    );
    put(source, next + "Unstaged change");
    assert.throws(
      () => translationBaseline(root, source, "en", "Translated en"),
      /source changed/,
    );
    put(source, next);
    for (const locale of locales)
      put(
        sourceDirectory + "/" + locale + "/example.md",
        "New translation " + locale,
      );
    assert.equal(pendingSourceOverrides(root).size, 0);
    assert.equal(
      translationBaseline(root, source, "en", "New translation en"),
      next,
    );
    const invalid = JSON.parse(readFileSync(join(root, pendingPath), "utf8"));
    invalid.revisions[source].previousSource += "tampered";
    put(pendingPath, JSON.stringify(invalid));
    assert.throws(() => loadPending(root));
  } finally {
    assert.ok(root.startsWith(join(tmpdir(), "seo-pending-")));
    rmSync(root, { recursive: true, force: true });
  }
});

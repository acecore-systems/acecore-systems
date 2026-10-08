import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { insightSlugs } from "../src/lib/insight-links.mjs";
import {
  calculateTranslationSourceHash,
  translatedLocales,
} from "./i18n-source-hash.mjs";

export function calculateInsightSourceHash(root, slug) {
  return createHash("sha256")
    .update(
      readFileSync(
        join(root, `src/content/insights/${slug}.md`),
        "utf8",
      ).replace(/\r\n/gu, "\n"),
    )
    .digest("hex");
}

function validatePendingDeclaration(pendingInsights) {
  assert.ok(
    pendingInsights &&
      typeof pendingInsights === "object" &&
      !Array.isArray(pendingInsights),
    "pendingInsights must be an object",
  );
  for (const [slug, pending] of Object.entries(pendingInsights)) {
    assert.ok(insightSlugs.includes(slug), `${slug}: unknown pending Insight`);
    assert.deepEqual(
      Object.keys(pending ?? {}).sort(),
      ["locales", "sourceHash"],
      `${slug}: pending Insight must declare sourceHash and locales only`,
    );
    assert.match(
      pending.sourceHash,
      /^[a-f0-9]{64}$/u,
      `${slug}: invalid sourceHash`,
    );
    assert.ok(
      Array.isArray(pending.locales) && pending.locales.length > 0,
      `${slug}: pending locales must be a nonempty array`,
    );
    assert.equal(
      new Set(pending.locales).size,
      pending.locales.length,
      `${slug}: duplicate pending locale`,
    );
    assert.ok(
      pending.locales.every((locale) => translatedLocales.includes(locale)),
      `${slug}: unsupported pending locale`,
    );
  }
}

export function validatePendingInsights(root, state) {
  const pendingInsights = state.pendingInsights ?? {};
  validatePendingDeclaration(pendingInsights);
  for (const [slug, pending] of Object.entries(pendingInsights)) {
    assert.equal(
      pending.sourceHash,
      calculateInsightSourceHash(root, slug),
      `${slug}: pending sourceHash is stale`,
    );
    for (const locale of pending.locales) {
      assert.equal(
        existsSync(join(root, `src/content/insights/${locale}/${slug}.md`)),
        false,
        `${slug}: ${locale} exists but is still declared pending`,
      );
    }
  }
  return pendingInsights;
}

export function createTranslationState(root, previousState) {
  const previousPending = previousState.pendingInsights ?? {};
  validatePendingDeclaration(previousPending);
  const pendingInsights = {};
  for (const [slug, pending] of Object.entries(previousPending)) {
    const locales = pending.locales.filter(
      (locale) =>
        !existsSync(join(root, `src/content/insights/${locale}/${slug}.md`)),
    );
    if (locales.length > 0) {
      pendingInsights[slug] = {
        sourceHash: calculateInsightSourceHash(root, slug),
        locales,
      };
    }
  }
  return {
    sourceHash: calculateTranslationSourceHash(root, {
      excludedInsightSlugs: Object.keys(pendingInsights),
    }),
    locales: translatedLocales,
    ...(Object.keys(pendingInsights).length > 0 ? { pendingInsights } : {}),
  };
}

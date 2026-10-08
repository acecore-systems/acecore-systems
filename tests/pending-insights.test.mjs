import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  calculateTranslationSourceHash,
  translatedLocales,
  translationSourcePaths,
} from "../scripts/i18n-source-hash.mjs";
import {
  calculateInsightSourceHash,
  createTranslationState,
  validatePendingInsights,
} from "../scripts/pending-insights.mjs";
import {
  getAvailableInsightLocales,
  getAvailableRouteLocales,
  getLocalizedInsightHref,
  insightSlugs,
} from "../src/lib/insight-links.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const slug = "ubuntu26-lts-upgrade-recovery";
const state = JSON.parse(
  readFileSync(join(root, "src/i18n/translation-state.json"), "utf8"),
);
const pendingState = {
  ...state,
  pendingInsights: {
    [slug]: {
      sourceHash: calculateInsightSourceHash(root, slug),
      locales: [...translatedLocales],
    },
  },
};

test("翻訳待ちの宣言はslug・locale・日本語版・未作成ファイルを照合する", () => {
  const fixtureRoot = mkdtempSync(
    join(tmpdir(), "systems-pending-declaration-"),
  );
  try {
    mkdirSync(join(fixtureRoot, "src/content/insights"), { recursive: true });
    cpSync(
      join(root, `src/content/insights/${slug}.md`),
      join(fixtureRoot, `src/content/insights/${slug}.md`),
    );
    assert.deepEqual(
      validatePendingInsights(fixtureRoot, pendingState),
      pendingState.pendingInsights,
    );
    for (const pending of [
      { ...pendingState.pendingInsights[slug], sourceHash: "0".repeat(64) },
      { ...pendingState.pendingInsights[slug], locales: ["ja"] },
      { ...pendingState.pendingInsights[slug], locales: ["en", "en"] },
      { ...pendingState.pendingInsights[slug], locales: [] },
      { ...pendingState.pendingInsights[slug], unexpected: true },
    ]) {
      assert.throws(() =>
        validatePendingInsights(fixtureRoot, {
          pendingInsights: { [slug]: pending },
        }),
      );
    }
    assert.throws(
      () =>
        validatePendingInsights(fixtureRoot, {
          pendingInsights: { "../unknown": pendingState.pendingInsights[slug] },
        }),
      /unknown pending Insight/u,
    );
    const existingSlug = insightSlugs.find((candidate) => candidate !== slug);
    cpSync(
      join(root, `src/content/insights/${existingSlug}.md`),
      join(fixtureRoot, `src/content/insights/${existingSlug}.md`),
    );
    mkdirSync(join(fixtureRoot, "src/content/insights/en"), {
      recursive: true,
    });
    writeFileSync(
      join(fixtureRoot, `src/content/insights/en/${existingSlug}.md`),
      "existing translation\n",
    );
    assert.throws(
      () =>
        validatePendingInsights(fixtureRoot, {
          pendingInsights: {
            [existingSlug]: {
              sourceHash: calculateInsightSourceHash(fixtureRoot, existingSlug),
              locales: ["en"],
            },
          },
        }),
      /exists but is still declared pending/u,
    );
  } finally {
    assert.equal(dirname(fixtureRoot), tmpdir());
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("日本語先行の記事は言語リンクを絞り、既存記事と固定ページは9言語のまま", () => {
  assert.deepEqual(
    getAvailableInsightLocales(slug, pendingState.pendingInsights),
    ["ja"],
  );
  assert.deepEqual(
    getAvailableRouteLocales(
      `/en/insights/${slug}/?q=test#section`,
      pendingState.pendingInsights,
    ),
    ["ja"],
  );
  assert.equal(
    getAvailableRouteLocales("/en/insights/", pendingState.pendingInsights)
      .length,
    9,
  );
  assert.equal(
    getAvailableRouteLocales("/en/services/", pendingState.pendingInsights)
      .length,
    9,
  );
  assert.equal(
    getAvailableInsightLocales(
      "restic-r2-backup-verification",
      pendingState.pendingInsights,
    ).length,
    9,
  );
  assert.equal(
    getLocalizedInsightHref(
      slug,
      "en",
      "#verify",
      pendingState.pendingInsights,
    ),
    `/insights/${slug}/#verify`,
  );
});

test("翻訳待ちから一部完成・全言語完成へ進むと、宣言とsourceHashが追従する", () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "systems-pending-insights-"));
  try {
    for (const relativePath of translationSourcePaths) {
      const target = join(fixtureRoot, relativePath);
      mkdirSync(dirname(target), { recursive: true });
      cpSync(join(root, relativePath), target);
    }
    const fullHash = calculateTranslationSourceHash(fixtureRoot);
    const initial = createTranslationState(fixtureRoot, pendingState);
    assert.equal(
      initial.sourceHash,
      calculateTranslationSourceHash(fixtureRoot, {
        excludedInsightSlugs: [slug],
      }),
    );
    assert.notEqual(initial.sourceHash, fullHash);
    const otherSource = join(
      fixtureRoot,
      "src/content/insights/restic-r2-backup-verification.md",
    );
    const original = readFileSync(otherSource, "utf8");
    writeFileSync(otherSource, `${original}\n変更\n`);
    assert.notEqual(
      calculateTranslationSourceHash(fixtureRoot, {
        excludedInsightSlugs: [slug],
      }),
      initial.sourceHash,
    );
    writeFileSync(otherSource, original);
    for (const locale of translatedLocales) {
      const target = join(
        fixtureRoot,
        `src/content/insights/${locale}/${slug}.md`,
      );
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, "translation fixture\n");
      const next = createTranslationState(fixtureRoot, initial);
      if (locale !== translatedLocales.at(-1)) {
        assert.ok(!next.pendingInsights[slug].locales.includes(locale));
        assert.notEqual(next.sourceHash, fullHash);
      } else {
        assert.equal(next.pendingInsights, undefined);
        assert.equal(next.sourceHash, fullHash);
        assert.equal(calculateTranslationSourceHash(fixtureRoot), fullHash);
      }
    }
  } finally {
    assert.equal(dirname(fixtureRoot), tmpdir());
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("新記事の待機宣言があっても、別の翻訳欠落はsource検証を通らない", () => {
  const fixtureRoot = mkdtempSync(
    join(tmpdir(), "systems-missing-translation-"),
  );
  try {
    for (const directory of [
      "scripts",
      "src/lib",
      "src/i18n",
      "src/data",
      "src/content/insights",
      "public/admin",
      ".github/workflows",
    ]) {
      cpSync(join(root, directory), join(fixtureRoot, directory), {
        recursive: true,
      });
    }
    mkdirSync(join(fixtureRoot, "public"), { recursive: true });
    cpSync(
      join(root, "public/_redirects"),
      join(fixtureRoot, "public/_redirects"),
    );
    for (const locale of translatedLocales) {
      rmSync(join(fixtureRoot, `src/content/insights/${locale}/${slug}.md`), {
        force: true,
      });
    }
    writeFileSync(
      join(fixtureRoot, "src/i18n/translation-state.json"),
      JSON.stringify(pendingState),
    );
    rmSync(
      join(
        fixtureRoot,
        "src/content/insights/en/restic-r2-backup-verification.md",
      ),
    );
    const result = spawnSync(
      process.execPath,
      [
        join(fixtureRoot, "scripts/validate-i18n.mjs"),
        "--articles-only",
        "--locale=en",
      ],
      { encoding: "utf8" },
    );
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /Insights set differs from declared available translations/u,
    );
  } finally {
    assert.equal(dirname(fixtureRoot), tmpdir());
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

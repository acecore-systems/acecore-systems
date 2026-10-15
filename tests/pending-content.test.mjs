import assert from "node:assert/strict";
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
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  applyBatchTranslations,
  createStructuredRequest,
} from "../scripts/openai-translation-batch.mjs";
import {
  calculateTranslationSourceHash,
  structuredTranslationTargets,
  translatedLocales,
} from "../scripts/i18n-source-hash.mjs";
import { createTranslationState } from "../scripts/pending-insights.mjs";
import {
  calculateContentNodeHash,
  createPendingContentState,
  getPendingContentSourcePaths,
  readStructuredSourceTree,
  validatePendingContent,
} from "../scripts/pending-content.mjs";
import {
  contentReleases,
  getAvailableContentRouteLocales,
  getContentNode,
  isContentUnavailable,
} from "../src/lib/pending-content.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const readJson = (base, path) =>
  JSON.parse(readFileSync(join(base, path), "utf8"));
const writeJson = (base, path, value) =>
  writeFileSync(join(base, path), `${JSON.stringify(value, null, 2)}\n`);
const locales = ["ja", ...translatedLocales];
const sourceTree = readStructuredSourceTree(root);
const state = {
  sourceHash: calculateTranslationSourceHash(root),
  locales: translatedLocales,
  pendingContent: Object.fromEntries(
    contentReleases.website.paths.map((pointer) => [
      pointer,
      {
        sourceHash: calculateContentNodeHash(
          getContentNode(sourceTree, pointer),
        ),
        locales: [...translatedLocales],
      },
    ]),
  ),
};
const websitePointer = "/serviceDetails/website";
const fixture = () => {
  const target = mkdtempSync(join(tmpdir(), "systems-pending-content-"));
  for (const path of ["src/data", "src/i18n/content", "src/content/insights"])
    cpSync(join(root, path), join(target, path), { recursive: true });
  // Start from an untranslated fixture even after the real Batch has completed.
  // The CI contract must stay valid for the eventual translation PR too.
  for (const locale of translatedLocales) {
    const path = `src/i18n/content/${locale}.json`;
    const overlay = readJson(target, path);
    for (const pointer of [...contentReleases.website.paths].sort((a, b) =>
      b.localeCompare(a, "en", { numeric: true }),
    )) {
      const segments = pointer.slice(1).split("/");
      const key = segments.pop();
      const parent = getContentNode(overlay, `/${segments.join("/")}`);
      if (Array.isArray(parent) && Number(key) < parent.length)
        parent.splice(Number(key), 1);
      else if (parent && typeof parent === "object") delete parent[key];
    }
    writeJson(target, path, overlay);
  }
  return target;
};
const removeFixture = (target) => {
  assert.equal(dirname(target), tmpdir());
  rmSync(target, { recursive: true, force: true });
};

// Mock translation transport only; fixtures never leave this process or alter live overlays.
function collectFixture(target, current, locale, sourcePaths) {
  const sourceHash = calculateTranslationSourceHash(target);
  const sources = new Map(
    sourcePaths.map((path) => [path, readJson(target, path)]),
  );
  const output = sourcePaths.map((sourcePath) => {
    const request = createStructuredRequest(
      { version: 1, kind: "content", locale, sourcePath, sourceHash },
      sources.get(sourcePath),
    );
    const entries = JSON.parse(request.body.input).entries;
    return {
      custom_id: request.custom_id,
      response: {
        status_code: 200,
        body: {
          output_text: JSON.stringify({
            translations: entries.map((entry) => ({
              id: entry.id,
              text: entry.source.replace(
                /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}々〆〤]+/gu,
                "Translation",
              ),
            })),
          }),
        },
      },
    };
  });
  applyBatchTranslations(output, sourceHash, {
    getSourceValue: (path) => sources.get(path),
    readFile: (path) => readFileSync(join(target, path), "utf8"),
    writeFile: (path, value) => {
      writeFileSync(join(target, path), value);
      return true;
    },
  });
  return createTranslationState(target, current);
}

test("明示した追加pathだけが、現在のsource hashと翻訳欠落に一致している", () => {
  const target = fixture();
  try {
    assert.equal(validatePendingContent(target, state), state.pendingContent);
  } finally {
    removeFixture(target);
  }
  const source = readStructuredSourceTree(root);
  assert.deepEqual(
    Object.keys(state.pendingContent).sort(),
    [...contentReleases.website.paths].sort(),
  );
  for (const [pointer, pending] of Object.entries(state.pendingContent)) {
    assert.equal(
      calculateContentNodeHash(getContentNode(source, pointer)),
      pending.sourceHash,
    );
    assert.deepEqual(pending.locales, translatedLocales);
  }
  assert.deepEqual(getPendingContentSourcePaths(state), [
    "src/data/contact.json",
    "src/data/home.json",
    "src/data/pricing.json",
    "src/data/service-details/website.json",
    "src/data/services.json",
  ]);
  assert.deepEqual(
    structuredTranslationTargets.get("src/data/service-details/website.json"),
    ["serviceDetails", "website"],
  );
});

test("未知path、古いhash、不正locale、型違い、部分翻訳は待機解除を通らない", () => {
  const target = fixture();
  try {
    for (const pending of [
      { sourceHash: "0".repeat(64), locales: ["en"] },
      { ...state.pendingContent[websitePointer], locales: ["ja"] },
      { ...state.pendingContent[websitePointer], locales: ["en", "en"] },
      { ...state.pendingContent[websitePointer], locales: [] },
      { ...state.pendingContent[websitePointer], extra: true },
    ])
      assert.throws(() =>
        validatePendingContent(target, {
          pendingContent: { [websitePointer]: pending },
        }),
      );
    assert.throws(
      () =>
        validatePendingContent(target, {
          pendingContent: {
            "/pricing/items/0": state.pendingContent[websitePointer],
          },
        }),
      /unknown pending content path/u,
    );
    const sourcePath = "src/data/service-details/website.json";
    writeJson(target, sourcePath, "wrong type");
    assert.throws(
      () => validatePendingContent(target, state),
      /pending source must be an object/u,
    );
    cpSync(join(root, sourcePath), join(target, sourcePath));
    for (const partial of [{ title: "Homepage" }, [], "Homepage"]) {
      const overlay = readJson(target, "src/i18n/content/en.json");
      overlay.serviceDetails.website = partial;
      writeJson(target, "src/i18n/content/en.json", overlay);
      assert.throws(
        () => validatePendingContent(target, state),
        /exists but is still declared pending/u,
      );
      assert.throws(
        () => createPendingContentState(target, state),
        /partial or has an invalid type/u,
      );
    }
  } finally {
    removeFixture(target);
  }
});

test("翻訳待ちの日本語を改訂したら古いhashを拒否し、状態更新後も未翻訳を公開しない", () => {
  const target = fixture();
  try {
    const path = "src/data/service-details/website.json";
    const website = readJson(target, path);
    website.heroLead += " 改訂した文章。";
    writeJson(target, path, website);
    assert.throws(
      () => validatePendingContent(target, state),
      /pending sourceHash is stale/u,
    );
    const next = createTranslationState(target, state);
    validatePendingContent(target, next);
    assert.notEqual(
      next.pendingContent[websitePointer].sourceHash,
      state.pendingContent[websitePointer].sourceHash,
    );
    assert.deepEqual(
      next.pendingContent[websitePointer].locales,
      translatedLocales,
    );
    assert.deepEqual(
      getAvailableContentRouteLocales(
        "/services/website/",
        locales,
        next.pendingContent,
      ),
      ["ja"],
    );
  } finally {
    removeFixture(target);
  }
});

test("Batchの模擬収集からpending解除まで進み、関連項目が揃った言語だけrouteが有効になる", () => {
  const target = fixture();
  try {
    let current = structuredClone(state);
    const allSources = getPendingContentSourcePaths(current);
    assert.deepEqual(
      getAvailableContentRouteLocales(
        "/services/website/",
        locales,
        current.pendingContent,
      ),
      ["ja"],
    );
    current = collectFixture(target, current, "en", ["src/data/services.json"]);
    assert.equal(
      current.pendingContent["/services/entryPoints/2"].locales.includes("en"),
      false,
    );
    assert.equal(
      isContentUnavailable(
        "/services/entryPoints/2",
        "en",
        current.pendingContent,
      ),
      true,
    );
    assert.deepEqual(
      getAvailableContentRouteLocales(
        "/services/website/",
        locales,
        current.pendingContent,
      ),
      ["ja"],
    );
    for (const locale of translatedLocales) {
      current = collectFixture(target, current, locale, allSources);
      validatePendingContent(target, current);
      assert.equal(
        getAvailableContentRouteLocales(
          "/services/website/",
          locales,
          current.pendingContent,
        ).includes(locale),
        true,
      );
      assert.equal(
        isContentUnavailable(
          "/pricing/items/27",
          locale,
          current.pendingContent,
        ),
        false,
      );
    }
    assert.equal(current.pendingContent, undefined);
    assert.equal(current.sourceHash, calculateTranslationSourceHash(target));
    assert.deepEqual(
      getAvailableContentRouteLocales(
        "/services/website/",
        locales,
        current.pendingContent,
      ),
      locales,
    );
  } finally {
    removeFixture(target);
  }
});

test("既存の料金・サービスは配列位置を保ち、英語のラベルと安定したkeyが対応する", () => {
  const tree = readStructuredSourceTree(root);
  const target = fixture();
  const en = readJson(target, "src/i18n/content/en.json");
  removeFixture(target);
  assert.equal(tree.pricing.items[0].key, "it-advisor-light");
  assert.match(en.pricing.items[0].label, /IT Advisory/iu);
  assert.equal(tree.pricing.items[0].price, "月額3万円〜");
  assert.equal(tree.services.entryPoints[0].id, "development");
  assert.equal(tree.services.entryPoints[1].id, "it-advisor");
  assert.equal(en.pricing.items.length, 27);
  assert.deepEqual(
    tree.pricing.items.slice(23, 27).map((item) => item.key),
    [
      "security-pre-release-review",
      "security-web-api-assessment",
      "security-remediation",
      "security-ongoing-support",
    ],
  );
  assert.deepEqual(
    en.pricing.items.slice(0, 27),
    readJson(root, "src/i18n/content/en.json").pricing.items.slice(0, 27),
  );
  assert.equal(tree.services.services[7].id, "security");
  assert.equal(tree.services.services[8].id, "website");
  assert.equal(
    isContentUnavailable("/pricing/items/23", "en", state.pendingContent),
    false,
  );
  assert.equal(
    isContentUnavailable("/pricing/items/27", "en", state.pendingContent),
    true,
  );
  assert.equal(en.services.entryPoints.length, 2);
  assert.equal(en.contact.faqs.length, 3);
  assert.equal(
    tree.pricing.items.slice(0, 27).every((item) => item.track !== "website"),
    true,
  );
  assert.equal(
    isContentUnavailable("/pricing/items/0", "en", state.pendingContent),
    false,
  );
});

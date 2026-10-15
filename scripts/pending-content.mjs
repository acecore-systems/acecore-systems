import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  contentReleases,
  getContentNode,
} from "../src/lib/pending-content.mjs";
import {
  structuredTranslationTargets,
  translatedLocales,
} from "./i18n-source-hash.mjs";

const allowedPaths = new Set(
  Object.values(contentReleases).flatMap((release) => release.paths),
);
const stableKeys = new Set([
  "accent",
  "contactFormAction",
  "consultationTrack",
  "detailUrl",
  "email",
  "externalUrl",
  "ga4Id",
  "href",
  "icon",
  "id",
  "image",
  "key",
  "name",
  "number",
  "phone",
  "pricingKey",
  "pricingKeys",
  "primaryCtaHref",
  "secondaryCtaHref",
  "src",
  "turnstileSiteKey",
  "track",
  "uploadedImage",
]);
const stable = (key) => stableKeys.has(key) || /(?:Href|Url)$/u.test(key);
const readJson = (root, path) =>
  JSON.parse(readFileSync(join(root, path), "utf8"));

export function readStructuredSourceTree(root) {
  const tree = {};
  for (const [path, keys] of structuredTranslationTargets) {
    let node = tree;
    for (const key of keys.slice(0, -1)) node = node[key] ??= {};
    node[keys.at(-1)] = readJson(root, path);
  }
  return tree;
}

export function calculateContentNodeHash(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function validateDeclarations(pendingContent) {
  assert.ok(
    pendingContent &&
      typeof pendingContent === "object" &&
      !Array.isArray(pendingContent),
    "pendingContent must be an object",
  );
  for (const [pointer, pending] of Object.entries(pendingContent)) {
    assert.ok(
      allowedPaths.has(pointer),
      `${pointer}: unknown pending content path`,
    );
    assert.deepEqual(
      Object.keys(pending ?? {}).sort(),
      ["locales", "sourceHash"],
      `${pointer}: declare sourceHash and locales only`,
    );
    assert.match(
      pending.sourceHash,
      /^[a-f0-9]{64}$/u,
      `${pointer}: invalid sourceHash`,
    );
    assert.ok(
      Array.isArray(pending.locales) && pending.locales.length > 0,
      `${pointer}: locales must be nonempty`,
    );
    assert.equal(
      new Set(pending.locales).size,
      pending.locales.length,
      `${pointer}: duplicate locale`,
    );
    assert.ok(
      pending.locales.every((locale) => translatedLocales.includes(locale)),
      `${pointer}: unsupported locale`,
    );
  }
}

// Presence is insufficient: partial or incorrectly typed overlay nodes must not release a page.
function hasCompleteShape(source, overlay, key = "") {
  if (stable(key)) return overlay === undefined;
  if (typeof source === "string")
    return (
      typeof overlay === "string" && (!source.trim() || Boolean(overlay.trim()))
    );
  if (Array.isArray(source))
    return (
      Array.isArray(overlay) &&
      source.length === overlay.length &&
      source.every((item, index) => hasCompleteShape(item, overlay[index]))
    );
  if (source && typeof source === "object")
    return (
      Boolean(
        overlay && typeof overlay === "object" && !Array.isArray(overlay),
      ) &&
      Object.keys(overlay).every((child) => Object.hasOwn(source, child)) &&
      Object.entries(source).every(([child, value]) =>
        hasCompleteShape(value, overlay[child], child),
      )
    );
  return source === overlay;
}

export function validatePendingContent(root, state) {
  const pendingContent = state.pendingContent ?? {};
  validateDeclarations(pendingContent);
  const source = readStructuredSourceTree(root);
  for (const [pointer, pending] of Object.entries(pendingContent)) {
    const value = getContentNode(source, pointer);
    assert.ok(
      value && typeof value === "object" && !Array.isArray(value),
      `${pointer}: pending source must be an object`,
    );
    assert.equal(
      pending.sourceHash,
      calculateContentNodeHash(value),
      `${pointer}: pending sourceHash is stale`,
    );
    for (const locale of pending.locales) {
      assert.equal(
        getContentNode(
          readJson(root, `src/i18n/content/${locale}.json`),
          pointer,
        ),
        undefined,
        `${pointer}: ${locale} exists but is still declared pending`,
      );
    }
  }
  return pendingContent;
}

export function createPendingContentState(root, previousState) {
  const previous = previousState.pendingContent ?? {};
  validateDeclarations(previous);
  const source = readStructuredSourceTree(root);
  const pendingContent = {};
  for (const [pointer, pending] of Object.entries(previous)) {
    const value = getContentNode(source, pointer);
    assert.ok(
      value && typeof value === "object" && !Array.isArray(value),
      `${pointer}: pending source must be an object`,
    );
    const locales = pending.locales.filter((locale) => {
      const overlay = getContentNode(
        readJson(root, `src/i18n/content/${locale}.json`),
        pointer,
      );
      if (overlay === undefined) return true;
      assert.ok(
        hasCompleteShape(value, overlay),
        `${pointer}: ${locale} translation is partial or has an invalid type`,
      );
      return false;
    });
    if (locales.length)
      pendingContent[pointer] = {
        sourceHash: calculateContentNodeHash(value),
        locales,
      };
  }
  return pendingContent;
}

export function getPendingContentSourcePaths(state) {
  validateDeclarations(state.pendingContent ?? {});
  return [
    ...new Set(
      Object.keys(state.pendingContent ?? {}).map((pointer) => {
        const entry = [...structuredTranslationTargets].find(
          ([, keys]) =>
            pointer.startsWith(`/${keys.join("/")}/`) ||
            pointer === `/${keys.join("/")}`,
        );
        assert.ok(entry, `${pointer}: missing structured source inventory`);
        return entry[0];
      }),
    ),
  ].sort();
}

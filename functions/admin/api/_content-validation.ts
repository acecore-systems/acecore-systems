import contact from "../../../src/data/contact.json";
import guide from "../../../src/data/guide.json";
import home from "../../../src/data/home.json";
import itAdvisor from "../../../src/data/it-advisor.json";
import pricing from "../../../src/data/pricing.json";
import privacy from "../../../src/data/privacy.json";
import services from "../../../src/data/services.json";
import site from "../../../src/data/site.json";
import operations from "../../../src/data/service-details/operations.json";
import siteFunctions from "../../../src/data/service-details/site-functions.json";
import siteQuality from "../../../src/data/service-details/site-quality.json";
import works from "../../../src/data/works.json";
import acecoreSitePlatform from "../../../src/data/work-details/acecore-site-platform.json";
import { validateSystemsContentFiles } from "../../../src/lib/systems-content-validation.ts";

const MAX_JSON_BYTES = 448 * 1024;
const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const MAX_DEPTH = 32;
const MAX_NODES = 50_000;
const URL_KEY_PATTERN = /(?:action|href|url|src|image|logo)$/iu;
const RESOURCE_KEY_PATTERN = /(?:src|image|logo)$/iu;

const BASELINES = new Map<string, unknown>([
  ["src/data/site.json", site],
  ["src/data/home.json", home],
  ["src/data/services.json", services],
  ["src/data/it-advisor.json", itAdvisor],
  ["src/data/pricing.json", pricing],
  ["src/data/guide.json", guide],
  ["src/data/works.json", works],
  ["src/data/contact.json", contact],
  ["src/data/privacy.json", privacy],
  ["src/data/service-details/site-functions.json", siteFunctions],
  ["src/data/service-details/site-quality.json", siteQuality],
  ["src/data/service-details/operations.json", operations],
  ["src/data/work-details/acecore-site-platform.json", acecoreSitePlatform],
]);

export type ValidatedCmsAddition = {
  path: string;
  contents: string;
  byteSize: number;
};

type ValidationResult =
  { ok: true; addition: ValidatedCmsAddition } | { ok: false; message: string };

export function validateCmsAddition(
  path: string,
  contents: string,
): ValidationResult {
  const validation = validateCmsAdditionStructure(path, contents);

  if (!validation.ok) return validation;

  const semanticError = validateSystemsCmsAdditions([validation.addition]);

  return semanticError ? { ok: false, message: semanticError } : validation;
}

export function validateCmsAdditionStructure(
  path: string,
  contents: string,
): ValidationResult {
  const bytes = decodeBase64(contents);

  if (!bytes) {
    return { ok: false, message: "ファイル内容が正しいbase64ではありません。" };
  }

  if (path.endsWith(".json")) {
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_JSON_BYTES) {
      return {
        ok: false,
        message: "JSONは1 byte以上448 KiB以下にしてください。",
      };
    }

    const baseline = BASELINES.get(path);

    if (baseline === undefined) {
      return { ok: false, message: "JSON schemaが登録されていません。" };
    }

    const error = validateJson(bytes, baseline);

    if (error) return { ok: false, message: error };
  } else {
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_MEDIA_BYTES) {
      return {
        ok: false,
        message: "画像は1 byte以上10 MiB以下にしてください。",
      };
    }

    const error = validateImage(path, bytes);

    if (error) return { ok: false, message: error };
  }

  return {
    ok: true,
    addition: { path, contents, byteSize: bytes.byteLength },
  };
}

export function validateSystemsCmsAdditions(
  additions: readonly ValidatedCmsAddition[],
) {
  const projectedFiles = new Map(BASELINES);

  for (const addition of additions) {
    if (!addition.path.endsWith(".json")) continue;

    const bytes = decodeBase64(addition.contents);

    if (!bytes) return "JSONのbase64を再検証できません。";

    let value: unknown;

    try {
      value = JSON.parse(
        new TextDecoder("utf-8", { fatal: true, ignoreBOM: false }).decode(
          bytes,
        ),
      );
    } catch {
      return "JSONを再検証できません。";
    }

    projectedFiles.set(addition.path, value);
  }

  const semanticErrors = validateSystemsContentFiles(projectedFiles);

  return semanticErrors.length > 0 ? semanticErrors[0] : null;
}

function validateJson(bytes: Uint8Array, baseline: unknown) {
  let text: string;

  try {
    text = new TextDecoder("utf-8", {
      fatal: true,
      ignoreBOM: false,
    }).decode(bytes);
  } catch {
    return "JSONは正しいUTF-8で保存してください。";
  }

  if (text.charCodeAt(0) === 0xfeff || text.includes("\0")) {
    return "JSONにUTF-8 BOMまたはNUL文字は使用できません。";
  }

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    return "JSONの構文が不正です。";
  }

  const budget = { nodes: 0 };

  return validateValue(value, baseline, "$", 0, budget);
}

function validateValue(
  value: unknown,
  baseline: unknown,
  scope: string,
  depth: number,
  budget: { nodes: number },
): string | null {
  budget.nodes += 1;

  if (depth > MAX_DEPTH || budget.nodes > MAX_NODES) {
    return `${scope}: JSONが複雑すぎます。`;
  }

  if (Array.isArray(baseline)) {
    if (!Array.isArray(value)) return `${scope}: 配列で指定してください。`;
    if (baseline.length === 0) return null;

    for (let index = 0; index < value.length; index += 1) {
      const templates = baseline.filter((item) =>
        sameStructuralKind(item, value[index]),
      );
      let error = `${scope}[${index}]: schemaと一致しません。`;

      for (const template of templates.length > 0 ? templates : [baseline[0]]) {
        const attemptBudget = { nodes: budget.nodes };
        const attempt = validateValue(
          value[index],
          template,
          `${scope}[${index}]`,
          depth + 1,
          attemptBudget,
        );

        if (!attempt) {
          budget.nodes = attemptBudget.nodes;
          error = "";
          break;
        }

        error = attempt;
      }

      if (error) return error;
    }

    return null;
  }

  if (isRecord(baseline)) {
    if (!isRecord(value)) return `${scope}: objectで指定してください。`;

    const allowedKeys = new Set<string>();
    collectObjectKeys(baseline, allowedKeys);

    for (const key of Object.keys(value)) {
      if (
        key === "__proto__" ||
        key === "constructor" ||
        key === "prototype" ||
        !allowedKeys.has(key)
      ) {
        return `${scope}.${key}: 許可されていない項目です。`;
      }
    }

    for (const [key, template] of Object.entries(baseline)) {
      if (!Object.hasOwn(value, key)) {
        return `${scope}.${key}: 必須項目です。`;
      }

      const error = validateValue(
        value[key],
        template,
        `${scope}.${key}`,
        depth + 1,
        budget,
      );

      if (error) return error;
    }

    return null;
  }

  if (baseline === null)
    return value === null ? null : `${scope}: nullが必要です。`;

  if (typeof value !== typeof baseline) {
    return `${scope}: ${typeof baseline}で指定してください。`;
  }

  if (typeof value === "number" && !Number.isFinite(value)) {
    return `${scope}: 有限の数値で指定してください。`;
  }

  if (typeof value === "string") {
    if (containsForbiddenCharacter(value)) {
      return `${scope}: 不正な制御文字またはUnicodeが含まれています。`;
    }

    const key = scope.split(".").pop() ?? "";

    if (URL_KEY_PATTERN.test(key)) {
      const error = validateUrlValue(value, key);

      if (error) return `${scope}: ${error}`;
    }
  }

  return null;
}

function validateUrlValue(value: string, key: string) {
  if (value === "") return null;
  const normalizedValue = normalizeUrlText(value);

  if (/[\u0000-\u0020\u007f\\]/u.test(normalizedValue)) {
    return "URLに空白、制御文字、backslashは使用できません。";
  }

  const isResource = RESOURCE_KEY_PATTERN.test(key);

  if (normalizedValue.startsWith("/")) {
    return normalizedValue.startsWith("//")
      ? "protocol-relative URLは使用できません。"
      : null;
  }

  if (!isResource && normalizedValue.startsWith("#")) return null;

  let url: URL;

  try {
    url = new URL(normalizedValue);
  } catch {
    return "絶対path、fragment、またはHTTPS URLで指定してください。";
  }

  if (url.protocol !== "https:" || url.username !== "" || url.password !== "") {
    return "外部URLは認証情報を含まないHTTPSで指定してください。";
  }

  return null;
}

function normalizeUrlText(value: string) {
  return value
    .replace(
      /&#(?:x([0-9a-f]{1,6})|([0-9]{1,7}));?/giu,
      (match, hexadecimal: string | undefined, decimal: string | undefined) => {
        const codePoint = Number.parseInt(
          hexadecimal || decimal || "",
          hexadecimal ? 16 : 10,
        );

        return Number.isSafeInteger(codePoint) && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : match;
      },
    )
    .replace(/&(?:colon|tab|newline);/giu, (entity) => {
      if (/^&colon;/iu.test(entity)) return ":";
      if (/^&tab;/iu.test(entity)) return "\t";
      return "\n";
    });
}

function collectObjectKeys(value: Record<string, unknown>, keys: Set<string>) {
  for (const key of Object.keys(value)) keys.add(key);
}

function sameStructuralKind(left: unknown, right: unknown) {
  if (Array.isArray(left) || Array.isArray(right)) {
    return Array.isArray(left) && Array.isArray(right);
  }

  if (isRecord(left) || isRecord(right)) {
    return isRecord(left) && isRecord(right);
  }

  return typeof left === typeof right;
}

function validateImage(path: string, bytes: Uint8Array) {
  const extension = path.slice(path.lastIndexOf(".")).toLowerCase();
  const valid =
    (extension === ".png" &&
      hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]) &&
      readAscii(bytes, 12, 4) === "IHDR" &&
      readAscii(bytes, bytes.length - 8, 4) === "IEND") ||
    ((extension === ".jpg" || extension === ".jpeg") &&
      hasBytes(bytes, 0, [0xff, 0xd8, 0xff]) &&
      hasBytes(bytes, bytes.length - 2, [0xff, 0xd9])) ||
    (extension === ".gif" &&
      (readAscii(bytes, 0, 6) === "GIF87a" ||
        readAscii(bytes, 0, 6) === "GIF89a")) ||
    (extension === ".webp" &&
      readAscii(bytes, 0, 4) === "RIFF" &&
      readAscii(bytes, 8, 4) === "WEBP" &&
      readUint32LittleEndian(bytes, 4) === bytes.length - 8) ||
    (extension === ".avif" &&
      readAscii(bytes, 4, 4) === "ftyp" &&
      ["avif", "avis"].includes(readAscii(bytes, 8, 4)));

  return valid
    ? null
    : "画像の拡張子と実体が一致するPNG、JPEG、GIF、WebP、AVIFだけを保存できます。";
}

function decodeBase64(value: string) {
  try {
    const binary = atob(value);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  } catch {
    return null;
  }
}

function containsForbiddenCharacter(value: string) {
  return Array.from(value).some((character) => {
    const codePoint = character.codePointAt(0) ?? 0;

    return (
      codePoint === 0 ||
      codePoint === 0x7f ||
      (codePoint >= 0xd800 && codePoint <= 0xdfff)
    );
  });
}

function hasBytes(bytes: Uint8Array, offset: number, expected: number[]) {
  if (offset < 0 || offset + expected.length > bytes.length) return false;

  return expected.every((value, index) => bytes[offset + index] === value);
}

function readAscii(bytes: Uint8Array, offset: number, length: number) {
  if (offset < 0 || offset + length > bytes.length) return "";

  return Array.from(bytes.slice(offset, offset + length), (byte) =>
    String.fromCharCode(byte),
  ).join("");
}

function readUint32LittleEndian(bytes: Uint8Array, offset: number) {
  if (offset < 0 || offset + 4 > bytes.length) return -1;

  return (
    bytes[offset] +
    bytes[offset + 1] * 0x100 +
    bytes[offset + 2] * 0x10000 +
    bytes[offset + 3] * 0x1000000
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

import { createHash } from "node:crypto";

const markerPattern = /\{ACECORE_KEEP_[^{}\r\n]*\}/gu;
const inlinePattern =
  /`[^`\r\n]+`|https:\/\/[^\s<>"')\]]+|\{[A-Za-z0-9_.-]+\}|\d+(?:[.,]\d+)*/gu;

function normalizeText(value) {
  return value.replace(/\r\n/gu, "\n");
}

function fencedCodeRanges(source) {
  const ranges = [];
  let opening = null;
  for (const line of source.matchAll(/[^\n]*(?:\n|$)/gu)) {
    if (!line[0]) continue;
    const text = line[0].replace(/\n$/u, "");
    if (opening) {
      const closing = /^ {0,3}(`+|~+)[ \t]*$/u.exec(text);
      if (
        closing &&
        closing[1][0] === opening.character &&
        closing[1].length >= opening.length
      ) {
        ranges.push([opening.start, line.index + text.length]);
        opening = null;
      }
    } else {
      const fence = /^ {0,3}(`{3,}|~{3,})(.*)$/u.exec(text);
      if (fence && !(fence[1][0] === "`" && fence[2].includes("`"))) {
        opening = {
          start: line.index,
          character: fence[1][0],
          length: fence[1].length,
        };
      }
    }
  }
  if (opening) ranges.push([opening.start, source.length]);
  return ranges;
}

export function fencedCodeBlocks(markdown) {
  const source = normalizeText(markdown);
  return fencedCodeRanges(source).map(([start, end]) =>
    source.slice(start, end),
  );
}

export function protectTranslationText(value) {
  const source = normalizeText(value);
  let namespace = createHash("sha256")
    .update(source)
    .digest("hex")
    .slice(0, 12);
  while (source.includes(`{ACECORE_KEEP_${namespace}_`)) namespace += "x";
  const tokens = new Map();
  const protect = (text, kind) => {
    const token = `{ACECORE_KEEP_${namespace}_${kind}_${tokens.size}}`;
    tokens.set(token, text);
    return token;
  };
  const protectInline = (text) =>
    text.replace(inlinePattern, (original) => {
      const kind = /^\d/u.test(original)
        ? `NUMBER_${original}`
        : original.startsWith("`")
          ? "CODE"
          : original.startsWith("https://")
            ? "URL"
            : "PLACEHOLDER";
      return protect(original, kind);
    });
  let text = "";
  let offset = 0;
  for (const [start, end] of fencedCodeRanges(source)) {
    text += protectInline(source.slice(offset, start));
    text += protect(source.slice(start, end), "CODE");
    offset = end;
  }
  text += protectInline(source.slice(offset));
  return { text, tokens };
}

export function restoreTranslationText(
  source,
  translated,
  label = "Translation",
) {
  const { text: protectedSource, tokens } = protectTranslationText(source);
  let output = normalizeText(translated);
  const seen = new Set();
  for (const token of output.match(markerPattern) ?? []) {
    if (!tokens.has(token) || seen.has(token)) {
      throw new Error(`${label}: unknown or duplicated protected token`);
    }
    seen.add(token);
  }
  if (seen.size !== tokens.size) {
    throw new Error(`${label}: protected token is missing or changed`);
  }
  // A CODE marker already owns its original delimiters. Remove only a single
  // extra, isolated pair around one known inline-code marker. Never infer lost
  // tokens, unwrap prose/multiple markers, or alter fenced-code formatting.
  output = output.replace(
    /(?<!`)`(\{ACECORE_KEEP_[^{}\r\n]*\})`(?!`)/gu,
    (wrapped, token) => {
      const original = tokens.get(token);
      return original &&
        /^`[^`\r\n]+`$/u.test(original) &&
        !protectedSource.includes(`\u0060${token}`) &&
        !protectedSource.includes(`${token}\u0060`)
        ? token
        : wrapped;
    },
  );
  for (const token of tokens.keys()) {
    const originalIndex = protectedSource.indexOf(token);
    const translatedIndex = output.indexOf(token);
    const before = (text, index) => /`*$/u.exec(text.slice(0, index))[0].length;
    const after = (text, index) =>
      /^`*/u.exec(text.slice(index + token.length))[0].length;
    if (
      before(output, translatedIndex) >
        before(protectedSource, originalIndex) ||
      after(output, translatedIndex) > after(protectedSource, originalIndex)
    ) {
      throw new Error(`${label}: ambiguous formatting around protected token`);
    }
  }
  return output.replace(markerPattern, (token) => tokens.get(token));
}

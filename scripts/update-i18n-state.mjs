import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  calculateTranslationSourceHash,
  translatedLocales,
} from "./i18n-source-hash.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const state = {
  sourceHash: calculateTranslationSourceHash(root),
  locales: translatedLocales,
};
writeFileSync(
  join(root, "src/i18n/translation-state.json"),
  `${JSON.stringify(state, null, 2)}\n`,
);
console.log(`Updated translation state: ${state.sourceHash}`);

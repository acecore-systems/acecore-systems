import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createTranslationState } from "./pending-insights.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const statePath = join(root, "src/i18n/translation-state.json");
const state = createTranslationState(
  root,
  JSON.parse(readFileSync(statePath, "utf8")),
);
writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`);
console.log(`Updated translation state: ${state.sourceHash}`);

import { createRequire } from "node:module";

// Astro's content runner evaluates dependencies through Vite's ESM runner.
// Load picomatch through Node's CommonJS bridge so its `require()` calls keep
// their native semantics on Windows.
const require = createRequire(import.meta.url);
const picomatch = require("picomatch");

export default picomatch;

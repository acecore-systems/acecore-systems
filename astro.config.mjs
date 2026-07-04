import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import { fileURLToPath } from "node:url";

const astroPrerenderEntry = fileURLToPath(
  import.meta.resolve("astro/entrypoints/prerender"),
);

export default defineConfig({
  output: "static",
  site: "https://systems.acecore.net",
  integrations: [
    sitemap({
      lastmod: new Date(),
      serialize(item) {
        if (item.url === "https://systems.acecore.net/") {
          item.changefreq = "weekly";
          item.priority = 1.0;
        } else {
          item.changefreq = "monthly";
          item.priority = 0.7;
        }
        return item;
      },
    }),
  ],
  vite: {
    resolve: {
      alias: {
        "astro/entrypoints/prerender": astroPrerenderEntry,
      },
    },
  },
});

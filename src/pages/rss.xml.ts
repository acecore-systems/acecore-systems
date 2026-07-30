import { getCollection } from "astro:content";

import { renderInsightsRss } from "../lib/rss";

export async function GET() {
  return new Response(
    renderInsightsRss(await getCollection("insights"), "ja"),
    {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    },
  );
}

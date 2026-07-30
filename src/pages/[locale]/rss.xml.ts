import { getCollection } from "astro:content";

import { locales, type Locale } from "../../i18n";
import { renderInsightsRss } from "../../lib/rss";

interface Props {
  locale: Locale;
}

export function getStaticPaths() {
  return locales
    .filter((locale) => locale !== "ja")
    .map((locale) => ({ params: { locale }, props: { locale } }));
}

export async function GET({ props }: { props: Props }) {
  return new Response(
    renderInsightsRss(await getCollection("insights"), props.locale),
    {
      headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
    },
  );
}

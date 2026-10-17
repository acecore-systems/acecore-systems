import type { LocalizedContent } from "../i18n/content";
import { getAvailableRouteLocales } from "./insight-links.mjs";
import type { Locale } from "../i18n";
import { getUi } from "../i18n/ui";
import type { PurposeIconName } from "../components/PurposeIcon.astro";
import { serviceSummaryKeys } from "./service-presentation";

export function getServiceCatalog(content: LocalizedContent, locale: Locale) {
  const text = getUi(locale);
  const details = content.serviceDetails;
  const item = (
    id: string,
    data: {
      title: string;
      indexSummary: string;
      indexTopics: string[];
      challenges: { title: string; body: string }[];
    },
    icon: PurposeIconName,
  ) => ({
    id,
    data,
    icon,
    href: `/services/${id}/`,
    pricingKeys: serviceSummaryKeys[id] ?? [],
  });
  return [
    {
      id: "web",
      title: text.purposeWeb,
      lead: content.home.layers[0].body,
      items: [
        ...(getAvailableRouteLocales("/services/website/").includes(locale)
          ? [item("website", details.website, "monitor")]
          : []),
        item("site-functions", details.siteFunctions, "puzzle"),
        item("site-quality", details.siteQuality, "chart"),
      ],
    },
    {
      id: "work",
      title: text.purposeWork,
      lead: content.home.layers[1].body,
      items: [
        item("development", details.development, "database"),
        item("it-advisor", content.itAdvisor, "bulb"),
      ],
    },
    {
      id: "operate",
      title: text.purposeOperate,
      lead: details.operations.indexSummary,
      items: [
        item("operations", details.operations, "settings"),
        item("security", details.security, "shield"),
      ],
    },
  ];
}

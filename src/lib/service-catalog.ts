import type { LocalizedContent } from "../i18n/content";
import { getAvailableRouteLocales } from "./insight-links.mjs";
import type { Locale } from "../i18n";
import { getUi } from "../i18n/ui";
import type { PurposeIconName } from "../components/PurposeIcon.astro";
import { serviceSummaryKeys } from "./service-presentation";

// Stable detail-page identities are also used by works, related links and pricing.
export function getServiceDetails(content: LocalizedContent, locale: Locale) {
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
    ...(getAvailableRouteLocales("/services/website/").includes(locale)
      ? [item("website", details.website, "monitor")]
      : []),
    item("site-functions", details.siteFunctions, "puzzle"),
    item("site-quality", details.siteQuality, "chart"),
    item("development", details.development, "database"),
    item("it-advisor", content.itAdvisor, "bulb"),
    item("operations", details.operations, "settings"),
    item("security", details.security, "shield"),
  ];
}

export function getServiceCatalog(content: LocalizedContent, locale: Locale) {
  const text = getUi(locale);
  const details = getServiceDetails(content, locale);
  const entry = (
    routeId: string,
    title: string,
    id = routeId,
    fragment = "",
    pricingKeys?: string[],
  ) => {
    const detail = details.find((detail) => detail.id === routeId)!;
    const offering =
      routeId === "development"
        ? content.serviceDetails.development.offerings.find(
            (offering) => offering.id === fragment.slice(1),
          )
        : undefined;
    return {
      ...detail,
      id,
      routeId,
      href: detail.href + fragment,
      data: {
        ...detail.data,
        title,
        ...(offering
          ? { indexSummary: offering.body, indexTopics: offering.includes }
          : {}),
      },
      pricingKeys: pricingKeys ?? detail.pricingKeys,
    };
  };
  return [
    {
      id: "web",
      title: text.catalogCategoryWeb,
      lead: content.home.layers[0].body,
      items: [
        ...(getAvailableRouteLocales("/services/website/").includes(locale)
          ? [entry("website", text.catalogWebsite)]
          : []),
        entry("site-quality", text.catalogSiteHandover),
        entry("development", text.catalogWebSystem, "web-system", "#web-app", [
          "web-app",
        ]),
      ],
    },
    {
      id: "work",
      title: text.catalogCategoryWork,
      lead: content.home.layers[1].body,
      items: [
        entry(
          "development",
          text.catalogInternalTool,
          "development",
          "#internal-tool",
          ["internal-tool", "small-automation"],
        ),
        entry("operations", text.catalogInfrastructure),
      ],
    },
    {
      id: "advisory",
      title: text.purposeAdvisory,
      lead: content.itAdvisor.indexSummary,
      items: [entry("it-advisor", content.itAdvisor.title)],
    },
    {
      id: "other",
      title: text.catalogCategoryOther,
      lead: content.services.heroLead,
      items: [
        entry("development", text.catalogOwnApp, "own-app", "", [
          "ai-system-implementation",
          "integrated-system",
        ]),
        entry("security", content.serviceDetails.security.title),
      ],
    },
  ];
}

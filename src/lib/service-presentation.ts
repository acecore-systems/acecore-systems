import type { LocalizedContent } from "../i18n/content";

export const serviceSummaryKeys: Record<string, string[]> = {
  website: ["website-launch", "website-care"],
  development: ["ai-improvement-starter", "small-automation"],
  "it-advisor": ["it-advisor-light", "deployment-spot"],
  "site-functions": ["cms", "site-search"],
  "site-quality": ["seo", "performance"],
  operations: ["maintenance"],
  security: ["security-pre-release-review"],
};

export const relatedServiceIds: Record<string, string[]> = {
  website: ["site-functions", "operations"],
  development: ["it-advisor", "security"],
  "it-advisor": ["development", "operations"],
  "site-functions": ["site-quality", "development"],
  "site-quality": ["security", "operations"],
  operations: ["it-advisor", "security"],
  security: ["site-quality", "development"],
};

type General = LocalizedContent["serviceDetails"]["siteFunctions"] & {
  heroBenefits?: string[];
  heroPrimaryCta?: string;
  heroSecondaryCta?: string;
  handoff?: LocalizedContent["serviceDetails"]["development"]["handoff"];
  termsTitle?: string;
  terms?: LocalizedContent["serviceDetails"]["website"]["terms"];
  costExample?: LocalizedContent["serviceDetails"]["website"]["costExample"];
  faqsTitle?: string;
  faqs?: LocalizedContent["serviceDetails"]["website"]["faqs"];
};
type Advisor = LocalizedContent["itAdvisor"];
export type ServiceContent = General | Advisor;

export function presentService(data: ServiceContent, serviceKey: string) {
  const routeId = serviceKey === "business-system" ? "development" : serviceKey;
  const advisor = serviceKey === "it-advisor" ? (data as Advisor) : undefined;
  const general = advisor ? undefined : (data as General);
  return {
    ...data,
    routeId,
    heroBenefits: general?.heroBenefits ?? [],
    heroPrimaryCta: advisor?.heroPrimaryCta ?? general?.heroPrimaryCta,
    heroSecondaryCta: advisor?.heroSecondaryCta ?? general?.heroSecondaryCta,
    offeringsTitle: advisor?.plansTitle ?? general!.offeringsTitle,
    offeringsLead: advisor?.plansLead ?? general!.offeringsLead,
    offerings: advisor
      ? advisor.plans.map((plan) => ({
          id: plan.id,
          title: plan.title,
          body: plan.summary,
          includes: plan.includes,
          pricingKeys: [plan.pricingKey],
          priceNote: plan.boundary,
        }))
      : general!.offerings,
    resourcesTitle: general?.resourcesTitle,
    resourcesLead: general?.resourcesLead,
    resources: general?.resources ?? [],
    termsTitle: general?.termsTitle,
    terms: general?.terms ?? [],
    costExample: general?.costExample,
    faqsTitle: advisor?.faqTitle ?? general?.faqsTitle,
    faqs: advisor?.faqs ?? general?.faqs ?? [],
    faqLead: advisor?.faqLead,
    handoff: advisor?.handoff ?? general?.handoff,
    advisor,
  };
}

type WorkServiceContext = {
  consultationService: string;
  relatedServices: string[];
  purposes: string[];
};

export const workServiceContexts: Record<string, WorkServiceContext> = {
  "case-acecore-contact": {
    consultationService: "site-functions",
    relatedServices: ["site-functions"],
    purposes: ["web", "work"],
  },
  "case-acecore-store": {
    consultationService: "business-system",
    relatedServices: ["development"],
    purposes: ["web", "work"],
  },
  "case-acecore-site-platform": {
    consultationService: "site-functions",
    relatedServices: ["site-functions", "site-quality"],
    purposes: ["web", "operate"],
  },
  "case-aceserver": {
    consultationService: "it-advisor",
    relatedServices: ["it-advisor"],
    purposes: ["operate"],
  },
  "case-aceserver-portal": {
    consultationService: "website",
    relatedServices: ["website", "site-functions"],
    purposes: ["web", "operate"],
  },
  "case-cherry-homepage": {
    consultationService: "website",
    relatedServices: ["website", "site-functions"],
    purposes: ["web"],
  },
  "case-hatt-homepage": {
    consultationService: "website",
    relatedServices: ["website", "site-functions"],
    purposes: ["web"],
  },
};

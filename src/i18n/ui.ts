import type { Locale } from "./config";

type UiText = {
  skipToContent: string;
  officialSite: string;
  mainNavigation: string;
  mobileNavigation: string;
  footerNavigation: string;
  breadcrumbNavigation: string;
  languageSelector: string;
  contact: string;
  menu: string;
  operatedBy: string;
  home: string;
  philosophy: string;
  services: string;
  works: string;
  pricing: string;
  guide: string;
  privacy: string;
  insights: string;
  insightsEyebrow: string;
  insightsTitle: string;
  insightsLead: string;
  insightsList: string;
  insightsGuideLead: string;
  viewGuide: string;
  consultationTitle: string;
  consultationBody: string;
  technicalConsultation: string;
  published: string;
  updated: string;
  tags: string;
  tableOfContents: string;
  authorProfile: string;
  nextStepTitle: string;
  nextStepBody: string;
  layerSummary: string;
  designDomainsTitle: string;
  designDomainsLead: string;
  viewDetails: string;
  viewAllServices: string;
  viewConsultationEntry: string;
  selectedWorkTitle: string;
  selectedWorkLead: string;
  viewWorks: string;
  servicesEyebrow: string;
  chooseScopeTitle: string;
  chooseScopeLead: string;
  serviceDomainsTitle: string;
  serviceDetailsTitle: string;
  serviceDetailsLead: string;
  primaryServicesTitle: string;
  primaryServicesLead: string;
  focusedSupportTitle: string;
  focusedSupportLead: string;
  viewSupportDetails: string;
  mainItems: string;
  processTitle: string;
  processLead: string;
  consultSpecificTitle: string;
  consultSpecificBody: string;
  contactLabel: string;
  challengesLabel: string;
  scopeLabel: string;
  pricingList: string;
  technicalNotes: string;
  readTechnicalNote: string;
  relatedSupport: string;
  viewSupport: string;
  discussThis: string;
  pricingGuideTitle: string;
  pricingCheck: string;
  securityResponsibility: string;
  guideInsightsTitle: string;
  guideInsightsBody: string;
  pricingEyebrow: string;
  priceListTitle: string;
  priceListCaption: string;
  estimateTitle: string;
  estimateBody: string;
  estimateLabel: string;
  privacyEyebrow: string;
  privacyHandlingTitle: string;
  contactFormLink: string;
  worksEyebrow: string;
  casesTitle: string;
  challenge: string;
  proposal: string;
  result: string;
  caseDetails: string;
  overview: string;
  currentState: string;
  challengeAndPolicy: string;
  sustainableShape: string;
  implementationScope: string;
  supportInThisCase: string;
  similarPlatformConsultation: string;
  viewAcecoreSite: string;
  thanksTitle: string;
  thanksBody: string;
  returnHome: string;
};

export const ui: Record<Locale, UiText> = {
  ja: {
    skipToContent: "本文へ移動",
    officialSite: "Acecore公式サイト",
    mainNavigation: "メインナビゲーション",
    mobileNavigation: "モバイルナビゲーション",
    footerNavigation: "フッターナビゲーション",
    breadcrumbNavigation: "パンくずナビゲーション",
    languageSelector: "言語選択",
    contact: "お問い合わせ",
    menu: "メニュー",
    operatedBy: "運営：株式会社Acecore",
    home: "ホーム",
    philosophy: "支援方針",
    services: "サービス",
    works: "実績",
    pricing: "料金の目安",
    guide: "導入ガイド",
    privacy: "プライバシー",
    insights: "技術解説",
    insightsEyebrow: "Insights / 技術解説",
    insightsTitle: "実装と運用の判断を、再利用できる知見へ。",
    insightsLead:
      "サービスや実績の背景にある設計判断を、Astro、Cloudflare、CMS、SEO、アクセシビリティなどのテーマごとに整理しています。",
    insightsList: "技術解説一覧",
    insightsGuideLead:
      "導入の考え方から整理したい場合は、導入ガイドをご覧ください。",
    viewGuide: "導入ガイドを見る",
    consultationTitle: "自社の状況に合わせて整理する。",
    consultationBody:
      "記事の構成をそのまま当てはめるのではなく、現在のサイト、運用体制、制約に合わせて必要な範囲を整理します。",
    technicalConsultation: "技術相談をする",
    published: "公開",
    updated: "更新",
    tags: "タグ",
    tableOfContents: "この記事の目次",
    authorProfile: "プロフィールを見る",
    nextStepTitle: "実装前の整理から相談できます。",
    nextStepBody:
      "現在の構成、追加したい機能、運用上の制約を確認し、必要な範囲と進め方を整理します。",
    layerSummary: "三つの設計層",
    designDomainsTitle: "画面から運用まで、ひとつの仕組みとして。",
    designDomainsLead:
      "Webは目的ではなく、業務を支える接点のひとつです。現場の流れに必要な範囲を組み合わせます。",
    viewDetails: "詳しく見る",
    viewAllServices: "設計領域をすべて見る",
    viewConsultationEntry: "相談の入口を見る",
    selectedWorkTitle: "小さな課題から、運用できる形へ。",
    selectedWorkLead:
      "課題をどう整理し、どのような仕組みにしたかを事例ごとに紹介します。",
    viewWorks: "取り組みを見る",
    servicesEyebrow: "Design domains / 設計領域",
    chooseScopeTitle: "まず、依頼したい範囲を選ぶ",
    chooseScopeLead:
      "開発そのものを任せるか、すでにある開発を公開・運用へ進めるかで、相談の入口を分けています。",
    serviceDomainsTitle: "設計領域",
    serviceDetailsTitle: "目的別の支援メニュー",
    serviceDetailsLead:
      "二つの主要サービスと、範囲を絞って依頼できる三つの支援を分けて紹介します。",
    primaryServicesTitle: "依頼の入口になる二つのサービス",
    primaryServicesLead:
      "構想から開発を任せるか、すでにある開発を公開・運用へ進めるかで選びます。",
    focusedSupportTitle: "必要な範囲に絞った支援",
    focusedSupportLead:
      "サイトの機能追加、品質改善、公開後の運用は、個別の支援メニューから選べます。",
    viewSupportDetails: "詳しい支援内容を見る",
    mainItems: "主な項目",
    processTitle: "進め方",
    processLead: "最初から大きく作り込まず、確認できる単位で段階的に進めます。",
    consultSpecificTitle: "具体的な進め方を相談する",
    consultSpecificBody:
      "業務の流れ、現在のツール、困っている点をお知らせください。",
    contactLabel: "問い合わせる",
    challengesLabel: "相談の背景",
    scopeLabel: "支援範囲",
    pricingList: "料金一覧を見る",
    technicalNotes: "技術資料",
    readTechnicalNote: "技術資料を読む ↗",
    relatedSupport: "隣接する支援内容",
    viewSupport: "支援内容を見る",
    discussThis: "この内容を相談する",
    pricingGuideTitle: "料金の目安",
    pricingCheck: "料金一覧で確認する",
    securityResponsibility: "セキュリティと責任境界",
    guideInsightsTitle: "実装判断を、技術解説で確認する。",
    guideInsightsBody:
      "Astro、Cloudflare、CMS、SEO、アクセシビリティなど、サービスや実績の背景にある判断を記事ごとに整理しています。",
    pricingEyebrow: "Engagement / 費用の目安",
    priceListTitle: "支援内容と料金",
    priceListCaption: "内容と費用の目安",
    estimateTitle: "正式な金額は要件整理後に見積ります。",
    estimateBody:
      "目的、希望時期、現在の課題、予算感があればフォームに記入してください。",
    estimateLabel: "見積りを相談する",
    privacyEyebrow: "Policy / 個人情報の取り扱い",
    privacyHandlingTitle: "取り扱いについて",
    contactFormLink: "お問い合わせフォームへ",
    worksEyebrow: "Selected work / 取り組み",
    casesTitle: "事例",
    challenge: "課題",
    proposal: "提案",
    result: "成果",
    caseDetails: "事例の詳細を見る",
    overview: "概要",
    currentState: "現在",
    challengeAndPolicy: "課題と方針",
    sustainableShape: "複雑にせず、育てられる形へ。",
    implementationScope: "実施内容",
    supportInThisCase: "この事例で扱った支援",
    similarPlatformConsultation: "同じような基盤を相談する",
    viewAcecoreSite: "Acecore公式サイトを見る",
    thanksTitle: "送信ありがとうございました",
    thanksBody: "内容を確認し、通常1〜2営業日以内に返信します。",
    returnHome: "トップへ戻る",
  },
  en: {
    skipToContent: "Skip to content",
    officialSite: "Acecore corporate site",
    mainNavigation: "Main navigation",
    mobileNavigation: "Mobile navigation",
    footerNavigation: "Footer navigation",
    breadcrumbNavigation: "Breadcrumb navigation",
    languageSelector: "Language selector",
    contact: "Contact",
    menu: "Menu",
    operatedBy: "Operated by Acecore",
    home: "Home",
    philosophy: "Approach",
    services: "Services",
    works: "Work",
    pricing: "Pricing",
    guide: "Implementation guide",
    privacy: "Privacy",
    insights: "Insights",
    insightsEyebrow: "Insights / Technical notes",
    insightsTitle:
      "Turn implementation and operations decisions into reusable knowledge.",
    insightsLead:
      "We document the design decisions behind our services and work across Astro, Cloudflare, CMS, SEO, accessibility, and related topics.",
    insightsList: "All insights",
    insightsGuideLead:
      "For help framing an implementation, start with the implementation guide.",
    viewGuide: "View the implementation guide",
    consultationTitle: "Apply the ideas to your own situation.",
    consultationBody:
      "We adapt the scope to your current site, operating model, and constraints instead of applying an article as-is.",
    technicalConsultation: "Request a technical consultation",
    published: "Published",
    updated: "Updated",
    tags: "Tags",
    tableOfContents: "Table of contents",
    authorProfile: "View profile",
    nextStepTitle: "Start by clarifying the work before implementation.",
    nextStepBody:
      "We review your current setup, desired capabilities, and operational constraints, then define the necessary scope and approach.",
    layerSummary: "Three design layers",
    designDomainsTitle: "One system, from interface to operations.",
    designDomainsLead:
      "The web is one touchpoint that supports the work, not the goal itself. We combine only what the operational flow requires.",
    viewDetails: "View details",
    viewAllServices: "View all service areas",
    viewConsultationEntry: "Choose a consultation route",
    selectedWorkTitle:
      "From small challenges to solutions that can be sustained.",
    selectedWorkLead:
      "Each case explains how we framed the problem and shaped it into an operational system.",
    viewWorks: "View our work",
    servicesEyebrow: "Design domains / Services",
    chooseScopeTitle: "Choose the scope you want to entrust first",
    chooseScopeLead:
      "Start with commissioned development when the idea itself needs building, or advisory support when an existing build needs to reach release and operations.",
    serviceDomainsTitle: "Service areas",
    serviceDetailsTitle: "Support by objective",
    serviceDetailsLead:
      "Two primary services are separated from three focused support options.",
    primaryServicesTitle: "Two primary ways to engage us",
    primaryServicesLead:
      "Choose between entrusting development from the concept stage and advancing an existing build toward release and operations.",
    focusedSupportTitle: "Focused support for a defined scope",
    focusedSupportLead:
      "Choose focused support for site features, quality improvements, or post-launch operations.",
    viewSupportDetails: "View detailed support",
    mainItems: "Main items",
    processTitle: "Process",
    processLead:
      "We work in verifiable stages instead of building everything at once.",
    consultSpecificTitle: "Discuss a practical way forward",
    consultSpecificBody:
      "Tell us about your workflow, current tools, and problems.",
    contactLabel: "Contact us",
    challengesLabel: "Your situation",
    scopeLabel: "Scope",
    pricingList: "View pricing",
    technicalNotes: "Technical notes",
    readTechnicalNote: "Read technical note ↗",
    relatedSupport: "Related support",
    viewSupport: "View support",
    discussThis: "Discuss this service",
    pricingGuideTitle: "Pricing guide",
    pricingCheck: "Check the pricing list",
    securityResponsibility: "Security and responsibility boundaries",
    guideInsightsTitle:
      "Review implementation decisions in our technical articles.",
    guideInsightsBody:
      "Our articles explain the decisions behind services and work across Astro, Cloudflare, CMS, SEO, accessibility, and related topics.",
    pricingEyebrow: "Engagement / Pricing guide",
    priceListTitle: "Services and pricing",
    priceListCaption: "Indicative scope and cost",
    estimateTitle: "A formal quote follows requirements clarification.",
    estimateBody:
      "Use the form to share your objective, preferred timing, current problem, and budget range.",
    estimateLabel: "Discuss an estimate",
    privacyEyebrow: "Policy / Privacy",
    privacyHandlingTitle: "How we handle personal information",
    contactFormLink: "Open the contact form",
    worksEyebrow: "Selected work / Case studies",
    casesTitle: "Case studies",
    challenge: "Challenge",
    proposal: "Proposal",
    result: "Outcome",
    caseDetails: "View case details",
    overview: "Overview",
    currentState: "Current state",
    challengeAndPolicy: "Challenge and approach",
    sustainableShape: "Keep it simple and ready to evolve.",
    implementationScope: "Implemented scope",
    supportInThisCase: "Services used in this case",
    similarPlatformConsultation: "Discuss a similar platform",
    viewAcecoreSite: "View the Acecore corporate site",
    thanksTitle: "Thank you for your message",
    thanksBody:
      "We will review it and usually respond within one or two business days.",
    returnHome: "Return home",
  },
  "zh-cn": {
    skipToContent: "跳转到正文",
    officialSite: "Acecore 官方网站",
    mainNavigation: "主导航",
    mobileNavigation: "移动端导航",
    footerNavigation: "页脚导航",
    breadcrumbNavigation: "面包屑导航",
    languageSelector: "语言选择",
    contact: "联系我们",
    menu: "菜单",
    operatedBy: "运营：Acecore",
    home: "首页",
    philosophy: "支持方针",
    services: "服务",
    works: "案例",
    pricing: "价格参考",
    guide: "实施指南",
    privacy: "隐私",
    insights: "技术解读",
    insightsEyebrow: "Insights / 技术解读",
    insightsTitle: "将实施与运营判断沉淀为可复用的知识。",
    insightsLead:
      "围绕 Astro、Cloudflare、CMS、SEO、无障碍等主题，整理服务与案例背后的设计判断。",
    insightsList: "技术解读列表",
    insightsGuideLead: "如需先梳理导入思路，请查看实施指南。",
    viewGuide: "查看实施指南",
    consultationTitle: "结合贵公司的实际情况进行梳理。",
    consultationBody:
      "我们不会直接套用文章，而会依据现有网站、运营体制与约束确定所需范围。",
    technicalConsultation: "咨询技术方案",
    published: "发布",
    updated: "更新",
    tags: "标签",
    tableOfContents: "本文目录",
    authorProfile: "查看个人资料",
    nextStepTitle: "可从实施前的梳理开始咨询。",
    nextStepBody:
      "我们会确认现有架构、希望增加的功能与运营约束，再整理必要范围和推进方式。",
    layerSummary: "三个设计层",
    designDomainsTitle: "从界面到运营，作为一个整体来设计。",
    designDomainsLead:
      "Web 不是目的，而是支持业务的接点之一。我们只组合现场流程真正需要的范围。",
    viewDetails: "查看详情",
    viewAllServices: "查看全部服务领域",
    viewConsultationEntry: "查看咨询入口",
    selectedWorkTitle: "从细小课题到可持续运营的形态。",
    selectedWorkLead: "按案例介绍我们如何梳理课题并形成可持续运营的机制。",
    viewWorks: "查看案例",
    servicesEyebrow: "Design domains / 服务领域",
    chooseScopeTitle: "首先选择希望委托的范围",
    chooseScopeLead:
      "如果需要从构想开始开发，请选择开发服务；如果已有成果需要推进到发布和运营，请选择顾问支持。",
    serviceDomainsTitle: "服务领域",
    serviceDetailsTitle: "按目的选择支持",
    serviceDetailsLead: "分别介绍两项主要服务与三项可限定范围的支持。",
    primaryServicesTitle: "两种主要委托入口",
    primaryServicesLead:
      "可选择从构想开始委托开发，或将已有开发推进到发布和运营。",
    focusedSupportTitle: "聚焦必要范围的支持",
    focusedSupportLead: "网站功能、质量改善和上线后运营可从专项支持中选择。",
    viewSupportDetails: "查看详细支持",
    mainItems: "主要项目",
    processTitle: "推进方式",
    processLead: "不从一开始就大规模制作，而是按可确认的单位分阶段推进。",
    consultSpecificTitle: "咨询具体推进方式",
    consultSpecificBody: "请告诉我们业务流程、现有工具和当前问题。",
    contactLabel: "联系我们",
    challengesLabel: "咨询背景",
    scopeLabel: "支持范围",
    pricingList: "查看价格",
    technicalNotes: "技术资料",
    readTechnicalNote: "阅读技术资料 ↗",
    relatedSupport: "相关支持",
    viewSupport: "查看支持内容",
    discussThis: "咨询此项内容",
    pricingGuideTitle: "价格参考",
    pricingCheck: "在价格列表中确认",
    securityResponsibility: "安全与责任边界",
    guideInsightsTitle: "通过技术解读确认实施判断。",
    guideInsightsBody:
      "文章按 Astro、Cloudflare、CMS、SEO、无障碍等主题整理服务与案例背后的判断。",
    pricingEyebrow: "Engagement / 价格参考",
    priceListTitle: "支持内容与价格",
    priceListCaption: "内容和费用参考",
    estimateTitle: "正式金额将在需求梳理后报价。",
    estimateBody: "请在表单中填写目标、期望时间、当前问题和预算范围。",
    estimateLabel: "咨询报价",
    privacyEyebrow: "Policy / 个人信息处理",
    privacyHandlingTitle: "处理原则",
    contactFormLink: "前往联系表单",
    worksEyebrow: "Selected work / 案例",
    casesTitle: "案例",
    challenge: "课题",
    proposal: "方案",
    result: "成果",
    caseDetails: "查看案例详情",
    overview: "概要",
    currentState: "当前状态",
    challengeAndPolicy: "课题与方针",
    sustainableShape: "保持简单，并能持续成长。",
    implementationScope: "实施内容",
    supportInThisCase: "本案例涉及的支持",
    similarPlatformConsultation: "咨询类似平台",
    viewAcecoreSite: "查看 Acecore 官方网站",
    thanksTitle: "感谢您的来信",
    thanksBody: "我们会确认内容，通常在1至2个工作日内回复。",
    returnHome: "返回首页",
  },
  es: {
    skipToContent: "Ir al contenido",
    officialSite: "Sitio corporativo de Acecore",
    mainNavigation: "Navegación principal",
    mobileNavigation: "Navegación móvil",
    footerNavigation: "Navegación del pie",
    breadcrumbNavigation: "Navegación de migas de pan",
    languageSelector: "Selector de idioma",
    contact: "Contacto",
    menu: "Menú",
    operatedBy: "Operado por Acecore",
    home: "Inicio",
    philosophy: "Enfoque",
    services: "Servicios",
    works: "Proyectos",
    pricing: "Precios",
    guide: "Guía de implementación",
    privacy: "Privacidad",
    insights: "Artículos técnicos",
    insightsEyebrow: "Insights / Artículos técnicos",
    insightsTitle:
      "Convertimos decisiones de implementación y operación en conocimiento reutilizable.",
    insightsLead:
      "Documentamos las decisiones de diseño detrás de nuestros servicios y proyectos sobre Astro, Cloudflare, CMS, SEO y accesibilidad.",
    insightsList: "Todos los artículos",
    insightsGuideLead:
      "Para ordenar primero el enfoque, consulta la guía de implementación.",
    viewGuide: "Ver la guía de implementación",
    consultationTitle: "Adáptalo a la situación de tu organización.",
    consultationBody:
      "Ajustamos el alcance al sitio, la operación y las restricciones actuales en lugar de aplicar el artículo sin cambios.",
    technicalConsultation: "Solicitar una consulta técnica",
    published: "Publicado",
    updated: "Actualizado",
    tags: "Etiquetas",
    tableOfContents: "Contenido",
    authorProfile: "Ver perfil",
    nextStepTitle: "Aclaremos el trabajo antes de implementar.",
    nextStepBody:
      "Revisamos la configuración actual, las funciones deseadas y las restricciones operativas para definir el alcance y el enfoque.",
    layerSummary: "Tres capas de diseño",
    designDomainsTitle:
      "Un solo sistema, desde la interfaz hasta la operación.",
    designDomainsLead:
      "La web es un punto de contacto que apoya el trabajo, no el objetivo. Combinamos solo lo que requiere el flujo operativo.",
    viewDetails: "Ver detalles",
    viewAllServices: "Ver todas las áreas",
    viewConsultationEntry: "Elegir una vía de consulta",
    selectedWorkTitle: "De pequeños retos a soluciones que se pueden sostener.",
    selectedWorkLead:
      "Cada caso muestra cómo ordenamos el problema y lo convertimos en un sistema que puede mantenerse.",
    viewWorks: "Ver proyectos",
    servicesEyebrow: "Design domains / Servicios",
    chooseScopeTitle: "Elige primero el alcance que deseas confiar",
    chooseScopeLead:
      "Encarga el desarrollo desde la idea o elige asesoría para llevar un desarrollo existente a publicación y operación.",
    serviceDomainsTitle: "Áreas de servicio",
    serviceDetailsTitle: "Apoyo según el objetivo",
    serviceDetailsLead:
      "Separamos dos servicios principales de tres opciones de apoyo específico.",
    primaryServicesTitle: "Dos formas principales de trabajar con nosotros",
    primaryServicesLead:
      "Elige entre encargar el desarrollo desde el concepto o avanzar un desarrollo existente hacia la publicación y operación.",
    focusedSupportTitle: "Apoyo centrado en un alcance definido",
    focusedSupportLead:
      "Elige apoyo específico para funciones, calidad u operación posterior al lanzamiento.",
    viewSupportDetails: "Ver apoyo detallado",
    mainItems: "Elementos principales",
    processTitle: "Proceso",
    processLead:
      "Avanzamos por etapas verificables en lugar de construir todo de una vez.",
    consultSpecificTitle: "Consultar una forma concreta de avanzar",
    consultSpecificBody:
      "Cuéntanos tu flujo de trabajo, herramientas actuales y dificultades.",
    contactLabel: "Contactar",
    challengesLabel: "Situación",
    scopeLabel: "Alcance",
    pricingList: "Ver precios",
    technicalNotes: "Notas técnicas",
    readTechnicalNote: "Leer nota técnica ↗",
    relatedSupport: "Apoyo relacionado",
    viewSupport: "Ver apoyo",
    discussThis: "Consultar este servicio",
    pricingGuideTitle: "Precios orientativos",
    pricingCheck: "Consultar la lista de precios",
    securityResponsibility: "Seguridad y límites de responsabilidad",
    guideInsightsTitle:
      "Revisa las decisiones de implementación en nuestros artículos.",
    guideInsightsBody:
      "Los artículos explican las decisiones detrás de servicios y proyectos sobre Astro, Cloudflare, CMS, SEO y accesibilidad.",
    pricingEyebrow: "Engagement / Precios",
    priceListTitle: "Servicios y precios",
    priceListCaption: "Alcance y coste orientativos",
    estimateTitle:
      "La propuesta formal se prepara después de aclarar los requisitos.",
    estimateBody:
      "Indica en el formulario el objetivo, el plazo deseado, el problema actual y el presupuesto.",
    estimateLabel: "Consultar un presupuesto",
    privacyEyebrow: "Policy / Privacidad",
    privacyHandlingTitle: "Tratamiento de datos personales",
    contactFormLink: "Abrir el formulario de contacto",
    worksEyebrow: "Selected work / Proyectos",
    casesTitle: "Casos",
    challenge: "Reto",
    proposal: "Propuesta",
    result: "Resultado",
    caseDetails: "Ver detalles del caso",
    overview: "Resumen",
    currentState: "Estado actual",
    challengeAndPolicy: "Reto y enfoque",
    sustainableShape: "Mantenerlo simple y preparado para crecer.",
    implementationScope: "Alcance implementado",
    supportInThisCase: "Servicios utilizados en este caso",
    similarPlatformConsultation: "Consultar una plataforma similar",
    viewAcecoreSite: "Ver el sitio corporativo de Acecore",
    thanksTitle: "Gracias por tu mensaje",
    thanksBody:
      "Lo revisaremos y normalmente responderemos en uno o dos días laborables.",
    returnHome: "Volver al inicio",
  },
  pt: {
    skipToContent: "Ir para o conteúdo",
    officialSite: "Site institucional da Acecore",
    mainNavigation: "Navegação principal",
    mobileNavigation: "Navegação móvel",
    footerNavigation: "Navegação do rodapé",
    breadcrumbNavigation: "Navegação estrutural",
    languageSelector: "Seletor de idioma",
    contact: "Contato",
    menu: "Menu",
    operatedBy: "Operado pela Acecore",
    home: "Início",
    philosophy: "Abordagem",
    services: "Serviços",
    works: "Projetos",
    pricing: "Preços",
    guide: "Guia de implementação",
    privacy: "Privacidade",
    insights: "Artigos técnicos",
    insightsEyebrow: "Insights / Artigos técnicos",
    insightsTitle:
      "Transformamos decisões de implementação e operação em conhecimento reutilizável.",
    insightsLead:
      "Documentamos as decisões de projeto por trás dos serviços e trabalhos em Astro, Cloudflare, CMS, SEO e acessibilidade.",
    insightsList: "Todos os artigos",
    insightsGuideLead:
      "Para organizar primeiro a abordagem, consulte o guia de implementação.",
    viewGuide: "Ver o guia de implementação",
    consultationTitle: "Adapte as ideias à realidade da sua organização.",
    consultationBody:
      "Ajustamos o escopo ao site, à operação e às restrições atuais, sem aplicar o artigo de forma literal.",
    technicalConsultation: "Solicitar consultoria técnica",
    published: "Publicado",
    updated: "Atualizado",
    tags: "Tags",
    tableOfContents: "Sumário",
    authorProfile: "Ver perfil",
    nextStepTitle: "Comece esclarecendo o trabalho antes da implementação.",
    nextStepBody:
      "Analisamos a estrutura atual, as funções desejadas e as restrições operacionais para definir escopo e abordagem.",
    layerSummary: "Três camadas de design",
    designDomainsTitle: "Um único sistema, da interface à operação.",
    designDomainsLead:
      "A web é um ponto de contato que apoia o trabalho, não o objetivo. Combinamos apenas o necessário para o fluxo operacional.",
    viewDetails: "Ver detalhes",
    viewAllServices: "Ver todas as áreas",
    viewConsultationEntry: "Escolher uma rota de consulta",
    selectedWorkTitle:
      "De pequenos desafios a soluções que podem ser sustentadas.",
    selectedWorkLead:
      "Cada caso mostra como organizamos o problema e o transformamos em um sistema sustentável.",
    viewWorks: "Ver projetos",
    servicesEyebrow: "Design domains / Serviços",
    chooseScopeTitle: "Escolha primeiro o escopo que deseja confiar",
    chooseScopeLead:
      "Contrate o desenvolvimento desde a ideia ou escolha consultoria para levar um desenvolvimento existente à publicação e operação.",
    serviceDomainsTitle: "Áreas de serviço",
    serviceDetailsTitle: "Suporte por objetivo",
    serviceDetailsLead:
      "Separamos dois serviços principais de três opções de suporte focado.",
    primaryServicesTitle: "Duas formas principais de trabalhar conosco",
    primaryServicesLead:
      "Escolha entre confiar o desenvolvimento desde o conceito ou avançar uma solução existente até publicação e operação.",
    focusedSupportTitle: "Suporte focado em um escopo definido",
    focusedSupportLead:
      "Escolha suporte específico para funções, qualidade ou operação pós-lançamento.",
    viewSupportDetails: "Ver suporte detalhado",
    mainItems: "Itens principais",
    processTitle: "Processo",
    processLead:
      "Avançamos em etapas verificáveis, sem construir tudo de uma vez.",
    consultSpecificTitle: "Discutir uma forma prática de avançar",
    consultSpecificBody:
      "Conte-nos sobre o fluxo de trabalho, as ferramentas e os problemas atuais.",
    contactLabel: "Entrar em contato",
    challengesLabel: "Contexto",
    scopeLabel: "Escopo",
    pricingList: "Ver preços",
    technicalNotes: "Notas técnicas",
    readTechnicalNote: "Ler nota técnica ↗",
    relatedSupport: "Suporte relacionado",
    viewSupport: "Ver suporte",
    discussThis: "Consultar este serviço",
    pricingGuideTitle: "Referência de preços",
    pricingCheck: "Consultar a lista de preços",
    securityResponsibility: "Segurança e limites de responsabilidade",
    guideInsightsTitle:
      "Confira decisões de implementação nos artigos técnicos.",
    guideInsightsBody:
      "Os artigos explicam as decisões por trás dos serviços e projetos em Astro, Cloudflare, CMS, SEO e acessibilidade.",
    pricingEyebrow: "Engagement / Preços",
    priceListTitle: "Serviços e preços",
    priceListCaption: "Escopo e custo indicativos",
    estimateTitle:
      "O orçamento formal é preparado após o levantamento dos requisitos.",
    estimateBody:
      "Informe no formulário o objetivo, prazo desejado, problema atual e faixa de orçamento.",
    estimateLabel: "Consultar um orçamento",
    privacyEyebrow: "Policy / Privacidade",
    privacyHandlingTitle: "Tratamento de dados pessoais",
    contactFormLink: "Abrir o formulário de contato",
    worksEyebrow: "Selected work / Projetos",
    casesTitle: "Casos",
    challenge: "Desafio",
    proposal: "Proposta",
    result: "Resultado",
    caseDetails: "Ver detalhes do caso",
    overview: "Visão geral",
    currentState: "Estado atual",
    challengeAndPolicy: "Desafio e abordagem",
    sustainableShape: "Manter simples e pronto para evoluir.",
    implementationScope: "Escopo implementado",
    supportInThisCase: "Serviços usados neste caso",
    similarPlatformConsultation: "Consultar uma plataforma semelhante",
    viewAcecoreSite: "Ver o site institucional da Acecore",
    thanksTitle: "Obrigado pela mensagem",
    thanksBody:
      "Vamos analisá-la e normalmente responderemos em um ou dois dias úteis.",
    returnHome: "Voltar ao início",
  },
  fr: {
    skipToContent: "Aller au contenu",
    officialSite: "Site institutionnel Acecore",
    mainNavigation: "Navigation principale",
    mobileNavigation: "Navigation mobile",
    footerNavigation: "Navigation du pied de page",
    breadcrumbNavigation: "Fil d’Ariane",
    languageSelector: "Sélecteur de langue",
    contact: "Contact",
    menu: "Menu",
    operatedBy: "Exploité par Acecore",
    home: "Accueil",
    philosophy: "Approche",
    services: "Services",
    works: "Réalisations",
    pricing: "Tarifs",
    guide: "Guide de mise en œuvre",
    privacy: "Confidentialité",
    insights: "Articles techniques",
    insightsEyebrow: "Insights / Articles techniques",
    insightsTitle:
      "Transformer les décisions de mise en œuvre et d’exploitation en connaissances réutilisables.",
    insightsLead:
      "Nous documentons les choix de conception derrière nos services et réalisations autour d’Astro, Cloudflare, CMS, SEO et accessibilité.",
    insightsList: "Tous les articles",
    insightsGuideLead:
      "Pour cadrer d’abord votre démarche, consultez le guide de mise en œuvre.",
    viewGuide: "Voir le guide de mise en œuvre",
    consultationTitle: "Adapter les idées à votre propre contexte.",
    consultationBody:
      "Nous ajustons le périmètre au site, à l’organisation et aux contraintes existantes plutôt que d’appliquer l’article tel quel.",
    technicalConsultation: "Demander une consultation technique",
    published: "Publié",
    updated: "Mis à jour",
    tags: "Tags",
    tableOfContents: "Sommaire",
    authorProfile: "Voir le profil",
    nextStepTitle: "Commencez par cadrer le travail avant la mise en œuvre.",
    nextStepBody:
      "Nous examinons l’architecture actuelle, les fonctions souhaitées et les contraintes d’exploitation afin de définir le périmètre et l’approche.",
    layerSummary: "Trois couches de conception",
    designDomainsTitle: "Un seul système, de l’interface à l’exploitation.",
    designDomainsLead:
      "Le web est un point de contact au service du travail, pas une finalité. Nous combinons uniquement ce qu’exige le flux opérationnel.",
    viewDetails: "Voir le détail",
    viewAllServices: "Voir tous les domaines",
    viewConsultationEntry: "Choisir un point d’entrée",
    selectedWorkTitle: "Des petits enjeux à des solutions durables.",
    selectedWorkLead:
      "Chaque cas montre comment nous cadrons le problème et le transformons en système durable.",
    viewWorks: "Voir les réalisations",
    servicesEyebrow: "Design domains / Services",
    chooseScopeTitle: "Choisissez d’abord le périmètre à nous confier",
    chooseScopeLead:
      "Confiez-nous le développement dès l’idée, ou choisissez le conseil pour amener un développement existant jusqu’à la mise en ligne et l’exploitation.",
    serviceDomainsTitle: "Domaines de service",
    serviceDetailsTitle: "Accompagnement par objectif",
    serviceDetailsLead:
      "Deux services principaux sont séparés de trois accompagnements ciblés.",
    primaryServicesTitle: "Deux façons principales de travailler avec nous",
    primaryServicesLead:
      "Choisissez entre le développement depuis le concept et l’accompagnement d’un existant vers la publication et l’exploitation.",
    focusedSupportTitle: "Accompagnement ciblé sur un périmètre défini",
    focusedSupportLead:
      "Choisissez un soutien spécifique pour les fonctions, la qualité ou l’exploitation après lancement.",
    viewSupportDetails: "Voir l’accompagnement détaillé",
    mainItems: "Éléments principaux",
    processTitle: "Déroulement",
    processLead:
      "Nous avançons par étapes vérifiables plutôt que de tout construire en une fois.",
    consultSpecificTitle: "Discuter d’une démarche concrète",
    consultSpecificBody:
      "Présentez-nous votre flux de travail, vos outils et vos difficultés.",
    contactLabel: "Nous contacter",
    challengesLabel: "Contexte",
    scopeLabel: "Périmètre",
    pricingList: "Voir les tarifs",
    technicalNotes: "Notes techniques",
    readTechnicalNote: "Lire la note technique ↗",
    relatedSupport: "Accompagnements associés",
    viewSupport: "Voir l’accompagnement",
    discussThis: "Discuter de ce service",
    pricingGuideTitle: "Repères tarifaires",
    pricingCheck: "Consulter la liste des tarifs",
    securityResponsibility: "Sécurité et limites de responsabilité",
    guideInsightsTitle:
      "Retrouvez les décisions de mise en œuvre dans nos articles.",
    guideInsightsBody:
      "Les articles expliquent les choix derrière nos services et réalisations autour d’Astro, Cloudflare, CMS, SEO et accessibilité.",
    pricingEyebrow: "Engagement / Tarifs",
    priceListTitle: "Services et tarifs",
    priceListCaption: "Périmètre et coût indicatifs",
    estimateTitle:
      "Le devis définitif est établi après le cadrage des besoins.",
    estimateBody:
      "Indiquez dans le formulaire l’objectif, le calendrier souhaité, le problème actuel et le budget.",
    estimateLabel: "Discuter d’un devis",
    privacyEyebrow: "Policy / Confidentialité",
    privacyHandlingTitle: "Traitement des données personnelles",
    contactFormLink: "Ouvrir le formulaire de contact",
    worksEyebrow: "Selected work / Réalisations",
    casesTitle: "Études de cas",
    challenge: "Enjeu",
    proposal: "Proposition",
    result: "Résultat",
    caseDetails: "Voir le détail du cas",
    overview: "Vue d’ensemble",
    currentState: "État actuel",
    challengeAndPolicy: "Enjeu et approche",
    sustainableShape: "Rester simple et prêt à évoluer.",
    implementationScope: "Périmètre réalisé",
    supportInThisCase: "Services mobilisés dans ce cas",
    similarPlatformConsultation: "Discuter d’une plateforme similaire",
    viewAcecoreSite: "Voir le site institutionnel Acecore",
    thanksTitle: "Merci pour votre message",
    thanksBody:
      "Nous l’examinerons et répondrons généralement sous un à deux jours ouvrés.",
    returnHome: "Retour à l’accueil",
  },
  ko: {
    skipToContent: "본문으로 이동",
    officialSite: "Acecore 공식 사이트",
    mainNavigation: "주요 내비게이션",
    mobileNavigation: "모바일 내비게이션",
    footerNavigation: "푸터 내비게이션",
    breadcrumbNavigation: "이동 경로",
    languageSelector: "언어 선택",
    contact: "문의",
    menu: "메뉴",
    operatedBy: "운영: Acecore",
    home: "홈",
    philosophy: "지원 방침",
    services: "서비스",
    works: "사례",
    pricing: "비용 안내",
    guide: "구현 가이드",
    privacy: "개인정보 처리방침",
    insights: "기술 해설",
    insightsEyebrow: "Insights / 기술 해설",
    insightsTitle: "구현과 운영의 판단을 재사용 가능한 지식으로.",
    insightsLead:
      "Astro, Cloudflare, CMS, SEO, 접근성 등을 중심으로 서비스와 사례의 설계 판단을 정리합니다.",
    insightsList: "기술 해설 목록",
    insightsGuideLead: "도입 방향부터 정리하려면 구현 가이드를 확인하세요.",
    viewGuide: "구현 가이드 보기",
    consultationTitle: "조직의 상황에 맞게 정리합니다.",
    consultationBody:
      "글을 그대로 적용하지 않고 현재 사이트, 운영 체계, 제약에 맞춰 필요한 범위를 정리합니다.",
    technicalConsultation: "기술 상담 요청",
    published: "공개",
    updated: "업데이트",
    tags: "태그",
    tableOfContents: "목차",
    authorProfile: "프로필 보기",
    nextStepTitle: "구현 전에 필요한 정리부터 상담할 수 있습니다.",
    nextStepBody:
      "현재 구성, 추가하려는 기능, 운영 제약을 확인한 뒤 필요한 범위와 진행 방식을 정리합니다.",
    layerSummary: "세 가지 설계 계층",
    designDomainsTitle: "화면부터 운영까지 하나의 시스템으로.",
    designDomainsLead:
      "웹은 목적이 아니라 업무를 지원하는 접점입니다. 현장 흐름에 필요한 범위만 조합합니다.",
    viewDetails: "자세히 보기",
    viewAllServices: "전체 서비스 영역 보기",
    viewConsultationEntry: "상담 경로 보기",
    selectedWorkTitle: "작은 과제에서, 운영할 수 있는 형태로.",
    selectedWorkLead:
      "과제를 정리해 어떤 시스템으로 만들었는지 사례별로 소개합니다.",
    viewWorks: "사례 보기",
    servicesEyebrow: "Design domains / 서비스 영역",
    chooseScopeTitle: "먼저 맡길 범위를 선택하세요",
    chooseScopeLead:
      "구상부터 개발을 맡길지, 기존 개발을 공개와 운영까지 진행할지에 따라 상담 경로를 나눕니다.",
    serviceDomainsTitle: "서비스 영역",
    serviceDetailsTitle: "목적별 지원",
    serviceDetailsLead:
      "두 가지 주요 서비스와 세 가지 집중 지원을 구분해 소개합니다.",
    primaryServicesTitle: "두 가지 주요 의뢰 경로",
    primaryServicesLead:
      "구상부터 개발을 맡기거나 기존 개발을 공개와 운영으로 발전시키는 경로 중 선택합니다.",
    focusedSupportTitle: "필요한 범위에 집중한 지원",
    focusedSupportLead:
      "사이트 기능, 품질 개선, 공개 후 운영을 개별 지원에서 선택할 수 있습니다.",
    viewSupportDetails: "상세 지원 보기",
    mainItems: "주요 항목",
    processTitle: "진행 방식",
    processLead:
      "처음부터 크게 만들지 않고 확인 가능한 단위로 단계적으로 진행합니다.",
    consultSpecificTitle: "구체적인 진행 방식 상담",
    consultSpecificBody: "업무 흐름, 현재 도구, 어려운 점을 알려주세요.",
    contactLabel: "문의하기",
    challengesLabel: "상담 배경",
    scopeLabel: "지원 범위",
    pricingList: "요금 보기",
    technicalNotes: "기술 자료",
    readTechnicalNote: "기술 자료 읽기 ↗",
    relatedSupport: "관련 지원",
    viewSupport: "지원 내용 보기",
    discussThis: "이 내용 상담하기",
    pricingGuideTitle: "요금 안내",
    pricingCheck: "요금 목록에서 확인",
    securityResponsibility: "보안과 책임 범위",
    guideInsightsTitle: "기술 해설에서 구현 판단을 확인하세요.",
    guideInsightsBody:
      "Astro, Cloudflare, CMS, SEO, 접근성 등 서비스와 사례의 배경 판단을 글별로 정리합니다.",
    pricingEyebrow: "Engagement / 비용 안내",
    priceListTitle: "지원 내용과 요금",
    priceListCaption: "내용과 비용 기준",
    estimateTitle: "정식 금액은 요구사항 정리 후 견적합니다.",
    estimateBody: "목적, 희망 시기, 현재 과제, 예산 범위를 폼에 적어주세요.",
    estimateLabel: "견적 상담하기",
    privacyEyebrow: "Policy / 개인정보 처리",
    privacyHandlingTitle: "개인정보 처리 원칙",
    contactFormLink: "문의 폼으로 이동",
    worksEyebrow: "Selected work / 사례",
    casesTitle: "사례",
    challenge: "과제",
    proposal: "제안",
    result: "성과",
    caseDetails: "사례 상세 보기",
    overview: "개요",
    currentState: "현재",
    challengeAndPolicy: "과제와 방침",
    sustainableShape: "복잡하게 만들지 않고 성장 가능한 형태로.",
    implementationScope: "구현 내용",
    supportInThisCase: "이 사례에 적용한 지원",
    similarPlatformConsultation: "유사한 기반 상담하기",
    viewAcecoreSite: "Acecore 공식 사이트 보기",
    thanksTitle: "문의해 주셔서 감사합니다",
    thanksBody: "내용을 확인한 뒤 보통 1~2영업일 이내에 답변드립니다.",
    returnHome: "홈으로 돌아가기",
  },
  de: {
    skipToContent: "Zum Inhalt",
    officialSite: "Acecore-Unternehmensseite",
    mainNavigation: "Hauptnavigation",
    mobileNavigation: "Mobile Navigation",
    footerNavigation: "Fußnavigation",
    breadcrumbNavigation: "Brotkrümelnavigation",
    languageSelector: "Sprachauswahl",
    contact: "Kontakt",
    menu: "Menü",
    operatedBy: "Betrieben von Acecore",
    home: "Startseite",
    philosophy: "Vorgehen",
    services: "Leistungen",
    works: "Projekte",
    pricing: "Preise",
    guide: "Implementierungsleitfaden",
    privacy: "Datenschutz",
    insights: "Technische Beiträge",
    insightsEyebrow: "Insights / Technische Beiträge",
    insightsTitle:
      "Entscheidungen aus Umsetzung und Betrieb als wiederverwendbares Wissen.",
    insightsLead:
      "Wir dokumentieren die Entwurfsentscheidungen hinter unseren Leistungen und Projekten zu Astro, Cloudflare, CMS, SEO und Barrierefreiheit.",
    insightsList: "Alle Beiträge",
    insightsGuideLead:
      "Nutzen Sie den Implementierungsleitfaden, um zunächst den Ansatz zu klären.",
    viewGuide: "Implementierungsleitfaden ansehen",
    consultationTitle: "Auf die eigene Situation übertragen.",
    consultationBody:
      "Wir passen den Umfang an Website, Betrieb und Rahmenbedingungen an, statt einen Artikel unverändert anzuwenden.",
    technicalConsultation: "Technische Beratung anfragen",
    published: "Veröffentlicht",
    updated: "Aktualisiert",
    tags: "Tags",
    tableOfContents: "Inhaltsverzeichnis",
    authorProfile: "Profil ansehen",
    nextStepTitle: "Klären Sie die Arbeit vor der Umsetzung.",
    nextStepBody:
      "Wir prüfen den aktuellen Aufbau, gewünschte Funktionen und betriebliche Einschränkungen und definieren daraus Umfang und Vorgehen.",
    layerSummary: "Drei Gestaltungsebenen",
    designDomainsTitle: "Ein System – von der Oberfläche bis zum Betrieb.",
    designDomainsLead:
      "Das Web ist ein Kontaktpunkt zur Unterstützung der Arbeit, nicht das Ziel. Wir kombinieren nur, was der Ablauf benötigt.",
    viewDetails: "Details ansehen",
    viewAllServices: "Alle Leistungsbereiche ansehen",
    viewConsultationEntry: "Beratungsweg wählen",
    selectedWorkTitle: "Von kleinen Herausforderungen zu tragfähigen Lösungen.",
    selectedWorkLead:
      "Jeder Fall zeigt, wie wir das Problem strukturiert und in ein dauerhaft betreibbares System überführt haben.",
    viewWorks: "Projekte ansehen",
    servicesEyebrow: "Design domains / Leistungen",
    chooseScopeTitle: "Wählen Sie zuerst den gewünschten Umfang",
    chooseScopeLead:
      "Beauftragen Sie die Entwicklung ab der Idee oder wählen Sie Beratung, um eine vorhandene Entwicklung bis Veröffentlichung und Betrieb zu bringen.",
    serviceDomainsTitle: "Leistungsbereiche",
    serviceDetailsTitle: "Unterstützung nach Ziel",
    serviceDetailsLead:
      "Zwei Hauptleistungen werden von drei fokussierten Angeboten getrennt.",
    primaryServicesTitle: "Zwei zentrale Wege der Zusammenarbeit",
    primaryServicesLead:
      "Wählen Sie zwischen Entwicklung ab dem Konzept und der Weiterführung einer bestehenden Lösung bis Veröffentlichung und Betrieb.",
    focusedSupportTitle: "Fokussierte Unterstützung für einen klaren Umfang",
    focusedSupportLead:
      "Wählen Sie gezielte Unterstützung für Funktionen, Qualität oder den Betrieb nach dem Start.",
    viewSupportDetails: "Details ansehen",
    mainItems: "Wichtige Punkte",
    processTitle: "Ablauf",
    processLead:
      "Wir arbeiten in prüfbaren Etappen, statt alles auf einmal zu bauen.",
    consultSpecificTitle: "Konkretes Vorgehen besprechen",
    consultSpecificBody:
      "Beschreiben Sie Arbeitsablauf, aktuelle Werkzeuge und Probleme.",
    contactLabel: "Kontakt aufnehmen",
    challengesLabel: "Ausgangslage",
    scopeLabel: "Umfang",
    pricingList: "Preise ansehen",
    technicalNotes: "Technische Hinweise",
    readTechnicalNote: "Technischen Hinweis lesen ↗",
    relatedSupport: "Verwandte Leistungen",
    viewSupport: "Leistung ansehen",
    discussThis: "Diese Leistung besprechen",
    pricingGuideTitle: "Preisrahmen",
    pricingCheck: "In der Preisliste prüfen",
    securityResponsibility: "Sicherheit und Verantwortungsgrenzen",
    guideInsightsTitle:
      "Prüfen Sie Umsetzungsentscheidungen in unseren Fachbeiträgen.",
    guideInsightsBody:
      "Die Beiträge erläutern Entscheidungen hinter Leistungen und Projekten zu Astro, Cloudflare, CMS, SEO und Barrierefreiheit.",
    pricingEyebrow: "Engagement / Preise",
    priceListTitle: "Leistungen und Preise",
    priceListCaption: "Richtwerte für Umfang und Kosten",
    estimateTitle:
      "Ein verbindliches Angebot folgt nach Klärung der Anforderungen.",
    estimateBody:
      "Teilen Sie im Formular Ziel, gewünschten Zeitraum, aktuelles Problem und Budgetrahmen mit.",
    estimateLabel: "Angebot besprechen",
    privacyEyebrow: "Policy / Datenschutz",
    privacyHandlingTitle: "Umgang mit personenbezogenen Daten",
    contactFormLink: "Kontaktformular öffnen",
    worksEyebrow: "Selected work / Projekte",
    casesTitle: "Fallstudien",
    challenge: "Herausforderung",
    proposal: "Vorschlag",
    result: "Ergebnis",
    caseDetails: "Falldetails ansehen",
    overview: "Überblick",
    currentState: "Aktueller Stand",
    challengeAndPolicy: "Herausforderung und Vorgehen",
    sustainableShape: "Einfach halten und weiterentwickelbar gestalten.",
    implementationScope: "Umgesetzter Umfang",
    supportInThisCase: "In diesem Fall eingesetzte Leistungen",
    similarPlatformConsultation: "Ähnliche Plattform besprechen",
    viewAcecoreSite: "Acecore-Unternehmensseite ansehen",
    thanksTitle: "Vielen Dank für Ihre Nachricht",
    thanksBody:
      "Wir prüfen sie und antworten in der Regel innerhalb von ein bis zwei Werktagen.",
    returnHome: "Zur Startseite",
  },
  ru: {
    skipToContent: "Перейти к содержанию",
    officialSite: "Корпоративный сайт Acecore",
    mainNavigation: "Основная навигация",
    mobileNavigation: "Мобильная навигация",
    footerNavigation: "Навигация в подвале",
    breadcrumbNavigation: "Навигационная цепочка",
    languageSelector: "Выбор языка",
    contact: "Связаться",
    menu: "Меню",
    operatedBy: "Управляется Acecore",
    home: "Главная",
    philosophy: "Подход",
    services: "Услуги",
    works: "Проекты",
    pricing: "Цены",
    guide: "Руководство",
    privacy: "Конфиденциальность",
    insights: "Технические материалы",
    insightsEyebrow: "Insights / Технические материалы",
    insightsTitle:
      "Превращаем решения по внедрению и эксплуатации в повторно используемые знания.",
    insightsLead:
      "Мы описываем проектные решения наших услуг и работ по Astro, Cloudflare, CMS, SEO, доступности и другим темам.",
    insightsList: "Все материалы",
    insightsGuideLead:
      "Чтобы сначала определить подход, откройте руководство по внедрению.",
    viewGuide: "Открыть руководство",
    consultationTitle: "Адаптируйте идеи к своей ситуации.",
    consultationBody:
      "Мы определяем объём с учётом текущего сайта, процессов и ограничений, а не применяем статью без изменений.",
    technicalConsultation: "Запросить техническую консультацию",
    published: "Опубликовано",
    updated: "Обновлено",
    tags: "Теги",
    tableOfContents: "Содержание",
    authorProfile: "Открыть профиль",
    nextStepTitle: "Начните с уточнения задачи до внедрения.",
    nextStepBody:
      "Мы изучим текущую архитектуру, желаемые функции и эксплуатационные ограничения, затем определим объём и подход.",
    layerSummary: "Три уровня проектирования",
    designDomainsTitle: "Единая система — от интерфейса до эксплуатации.",
    designDomainsLead:
      "Веб — это точка взаимодействия, поддерживающая работу, а не самоцель. Мы объединяем только необходимое для процессов.",
    viewDetails: "Подробнее",
    viewAllServices: "Все направления услуг",
    viewConsultationEntry: "Выбрать формат консультации",
    selectedWorkTitle:
      "От небольших задач к решениям, которые можно поддерживать.",
    selectedWorkLead:
      "В каждом кейсе показано, как мы сформулировали задачу и превратили её в устойчивую систему.",
    viewWorks: "Смотреть проекты",
    servicesEyebrow: "Design domains / Услуги",
    chooseScopeTitle: "Сначала выберите объём работ",
    chooseScopeLead:
      "Поручите нам разработку с этапа идеи или выберите консультацию, чтобы довести имеющуюся разработку до публикации и эксплуатации.",
    serviceDomainsTitle: "Направления услуг",
    serviceDetailsTitle: "Поддержка по целям",
    serviceDetailsLead:
      "Две основные услуги отделены от трёх целевых форматов поддержки.",
    primaryServicesTitle: "Два основных формата сотрудничества",
    primaryServicesLead:
      "Выберите разработку от концепции или развитие существующего решения до публикации и эксплуатации.",
    focusedSupportTitle: "Поддержка в определённом объёме",
    focusedSupportLead:
      "Выберите целевую помощь для функций сайта, качества или работы после запуска.",
    viewSupportDetails: "Подробнее о поддержке",
    mainItems: "Основные пункты",
    processTitle: "Процесс",
    processLead: "Мы работаем проверяемыми этапами, а не создаём всё сразу.",
    consultSpecificTitle: "Обсудить практический план",
    consultSpecificBody:
      "Расскажите о процессах, текущих инструментах и проблемах.",
    contactLabel: "Связаться",
    challengesLabel: "Исходная ситуация",
    scopeLabel: "Объём",
    pricingList: "Смотреть цены",
    technicalNotes: "Технические материалы",
    readTechnicalNote: "Читать материал ↗",
    relatedSupport: "Связанные услуги",
    viewSupport: "Смотреть услугу",
    discussThis: "Обсудить эту услугу",
    pricingGuideTitle: "Ориентиры по стоимости",
    pricingCheck: "Проверить в списке цен",
    securityResponsibility: "Безопасность и границы ответственности",
    guideInsightsTitle:
      "Изучите решения по внедрению в технических материалах.",
    guideInsightsBody:
      "Материалы объясняют решения за услугами и проектами по Astro, Cloudflare, CMS, SEO и доступности.",
    pricingEyebrow: "Engagement / Цены",
    priceListTitle: "Услуги и цены",
    priceListCaption: "Ориентиры по объёму и стоимости",
    estimateTitle:
      "Окончательная смета составляется после уточнения требований.",
    estimateBody:
      "Укажите в форме цель, желаемые сроки, текущую проблему и бюджетный диапазон.",
    estimateLabel: "Обсудить смету",
    privacyEyebrow: "Policy / Конфиденциальность",
    privacyHandlingTitle: "Обработка персональных данных",
    contactFormLink: "Открыть форму связи",
    worksEyebrow: "Selected work / Проекты",
    casesTitle: "Кейсы",
    challenge: "Задача",
    proposal: "Предложение",
    result: "Результат",
    caseDetails: "Подробнее о кейсе",
    overview: "Обзор",
    currentState: "Текущее состояние",
    challengeAndPolicy: "Задача и подход",
    sustainableShape: "Простая основа, готовая к развитию.",
    implementationScope: "Выполненные работы",
    supportInThisCase: "Услуги в этом кейсе",
    similarPlatformConsultation: "Обсудить похожую платформу",
    viewAcecoreSite: "Открыть корпоративный сайт Acecore",
    thanksTitle: "Спасибо за сообщение",
    thanksBody:
      "Мы рассмотрим его и обычно отвечаем в течение одного–двух рабочих дней.",
    returnHome: "На главную",
  },
};

export function getUi(locale: Locale) {
  return ui[locale];
}

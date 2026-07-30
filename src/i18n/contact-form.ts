import type { Locale } from "./config";

export const contactCategoryValues = {
  general: "サービス全般について",
  advisor: "IT顧問・AI導入・デプロイについて",
  system: "業務システム開発について",
  webApp: "Webアプリ・管理画面について",
  site: "Webサイト機能・品質改善について",
  design: "デザイン・クリエイティブについて",
  integration: "データ連携・自動化について",
  operations: "保守・運用改善について",
  estimate: "見積り相談",
  other: "その他",
} as const;

type CategoryKey = keyof typeof contactCategoryValues;

type ContactFormText = {
  eyebrow: string;
  formTitle: string;
  faqLabel: string;
  companyWebsite: string;
  category: string;
  required: string;
  select: string;
  categories: Record<CategoryKey, string>;
  name: string;
  email: string;
  subject: string;
  message: string;
  submissionNote: string;
  validationError: string;
  submit: string;
  submitting: string;
  consultationSuffix: string;
};

export const contactFormCopy: Record<Locale, ContactFormText> = {
  ja: {
    eyebrow: "Start a conversation / ご相談",
    formTitle: "相談内容を送る",
    faqLabel: "お問い合わせ前のよくある質問",
    companyWebsite: "会社Webサイト",
    category: "お問い合わせ種別",
    required: "必須",
    select: "選択してください",
    categories: {
      general: contactCategoryValues.general,
      advisor: contactCategoryValues.advisor,
      system: contactCategoryValues.system,
      webApp: contactCategoryValues.webApp,
      site: contactCategoryValues.site,
      design: contactCategoryValues.design,
      integration: contactCategoryValues.integration,
      operations: contactCategoryValues.operations,
      estimate: contactCategoryValues.estimate,
      other: contactCategoryValues.other,
    },
    name: "お名前",
    email: "メールアドレス",
    subject: "件名",
    message: "お問い合わせ内容",
    submissionNote:
      "送信はAcecore共通窓口で受け付けます。送信後はこのサイトの完了画面へ移動します。",
    validationError:
      "送信前の確認が完了していません。少し待ってからもう一度お試しください。",
    submit: "送信する",
    submitting: "送信中…",
    consultationSuffix: "についての相談",
  },
  en: {
    eyebrow: "Start a conversation / Contact",
    formTitle: "Tell us what you would like to discuss",
    faqLabel: "Frequently asked questions before contacting us",
    companyWebsite: "Company website",
    category: "Inquiry type",
    required: "Required",
    select: "Select an option",
    categories: {
      general: "General service inquiry",
      advisor: "IT advisory, AI adoption, or deployment",
      system: "Business system development",
      webApp: "Web applications and admin interfaces",
      site: "Website features and quality improvement",
      design: "Design and creative work",
      integration: "Data integration and automation",
      operations: "Maintenance and operational improvement",
      estimate: "Estimate request",
      other: "Other",
    },
    name: "Name",
    email: "Email address",
    subject: "Subject",
    message: "Message",
    submissionNote:
      "Acecore’s shared contact desk receives this form. After submission, you will return to this site’s confirmation page.",
    validationError:
      "The pre-submission check is not complete. Please wait briefly and try again.",
    submit: "Send",
    submitting: "Sending…",
    consultationSuffix: "Consultation",
  },
  "zh-cn": {
    eyebrow: "Start a conversation / 咨询",
    formTitle: "发送咨询内容",
    faqLabel: "联系前常见问题",
    companyWebsite: "公司网站",
    category: "咨询类型",
    required: "必填",
    select: "请选择",
    categories: {
      general: "服务综合咨询",
      advisor: "IT 顾问、AI 导入或部署",
      system: "业务系统开发",
      webApp: "Web 应用与管理界面",
      site: "网站功能与质量改善",
      design: "设计与创意制作",
      integration: "数据集成与自动化",
      operations: "维护与运营改善",
      estimate: "报价咨询",
      other: "其他",
    },
    name: "姓名",
    email: "电子邮箱",
    subject: "主题",
    message: "咨询内容",
    submissionNote: "表单由 Acecore 统一窗口接收。发送后将返回本站的完成页面。",
    validationError: "发送前验证尚未完成，请稍候后重试。",
    submit: "发送",
    submitting: "发送中…",
    consultationSuffix: "咨询",
  },
  es: {
    eyebrow: "Start a conversation / Consulta",
    formTitle: "Cuéntanos qué deseas consultar",
    faqLabel: "Preguntas frecuentes antes de contactar",
    companyWebsite: "Sitio web de la empresa",
    category: "Tipo de consulta",
    required: "Obligatorio",
    select: "Selecciona una opción",
    categories: {
      general: "Consulta general sobre servicios",
      advisor: "Asesoría IT, adopción de IA o despliegue",
      system: "Desarrollo de sistemas empresariales",
      webApp: "Aplicaciones web y paneles de administración",
      site: "Funciones y calidad del sitio web",
      design: "Diseño y trabajo creativo",
      integration: "Integración de datos y automatización",
      operations: "Mantenimiento y mejora operativa",
      estimate: "Solicitud de presupuesto",
      other: "Otro",
    },
    name: "Nombre",
    email: "Correo electrónico",
    subject: "Asunto",
    message: "Mensaje",
    submissionNote:
      "El formulario llega al punto de contacto común de Acecore. Tras enviarlo, volverás a la página de confirmación de este sitio.",
    validationError:
      "La comprobación previa al envío aún no ha terminado. Espera un momento e inténtalo de nuevo.",
    submit: "Enviar",
    submitting: "Enviando…",
    consultationSuffix: "Consulta",
  },
  pt: {
    eyebrow: "Start a conversation / Contato",
    formTitle: "Conte-nos o que deseja discutir",
    faqLabel: "Perguntas frequentes antes do contato",
    companyWebsite: "Site da empresa",
    category: "Tipo de contato",
    required: "Obrigatório",
    select: "Selecione uma opção",
    categories: {
      general: "Consulta geral sobre serviços",
      advisor: "Consultoria de IT, adoção de IA ou implantação",
      system: "Desenvolvimento de sistemas empresariais",
      webApp: "Aplicações web e painéis administrativos",
      site: "Funções e qualidade do site",
      design: "Design e trabalho criativo",
      integration: "Integração de dados e automação",
      operations: "Manutenção e melhoria operacional",
      estimate: "Solicitação de orçamento",
      other: "Outro",
    },
    name: "Nome",
    email: "E-mail",
    subject: "Assunto",
    message: "Mensagem",
    submissionNote:
      "O formulário é recebido pelo contato central da Acecore. Após o envio, você retornará à página de confirmação deste site.",
    validationError:
      "A verificação antes do envio ainda não terminou. Aguarde um momento e tente novamente.",
    submit: "Enviar",
    submitting: "Enviando…",
    consultationSuffix: "Consulta",
  },
  fr: {
    eyebrow: "Start a conversation / Contact",
    formTitle: "Présentez-nous votre demande",
    faqLabel: "Questions fréquentes avant de nous contacter",
    companyWebsite: "Site web de l’entreprise",
    category: "Type de demande",
    required: "Obligatoire",
    select: "Sélectionnez une option",
    categories: {
      general: "Demande générale sur les services",
      advisor: "Conseil IT, adoption de l’IA ou déploiement",
      system: "Développement de systèmes métier",
      webApp: "Applications web et interfaces d’administration",
      site: "Fonctions et qualité du site web",
      design: "Design et création",
      integration: "Intégration de données et automatisation",
      operations: "Maintenance et amélioration opérationnelle",
      estimate: "Demande de devis",
      other: "Autre",
    },
    name: "Nom",
    email: "Adresse e-mail",
    subject: "Objet",
    message: "Message",
    submissionNote:
      "Le formulaire est reçu par le point de contact commun d’Acecore. Après l’envoi, vous serez redirigé vers la page de confirmation de ce site.",
    validationError:
      "La vérification préalable n’est pas terminée. Patientez un instant puis réessayez.",
    submit: "Envoyer",
    submitting: "Envoi…",
    consultationSuffix: "Demande",
  },
  ko: {
    eyebrow: "Start a conversation / 상담",
    formTitle: "상담 내용을 보내주세요",
    faqLabel: "문의 전 자주 묻는 질문",
    companyWebsite: "회사 웹사이트",
    category: "문의 유형",
    required: "필수",
    select: "선택하세요",
    categories: {
      general: "서비스 전반 문의",
      advisor: "IT 자문, AI 도입, 배포",
      system: "업무 시스템 개발",
      webApp: "웹 앱 및 관리자 화면",
      site: "웹사이트 기능 및 품질 개선",
      design: "디자인 및 크리에이티브",
      integration: "데이터 연동 및 자동화",
      operations: "유지보수 및 운영 개선",
      estimate: "견적 상담",
      other: "기타",
    },
    name: "이름",
    email: "이메일 주소",
    subject: "제목",
    message: "문의 내용",
    submissionNote:
      "Acecore 공통 창구에서 접수하며, 전송 후 이 사이트의 완료 화면으로 돌아옵니다.",
    validationError:
      "전송 전 확인이 완료되지 않았습니다. 잠시 후 다시 시도해 주세요.",
    submit: "보내기",
    submitting: "전송 중…",
    consultationSuffix: "상담",
  },
  de: {
    eyebrow: "Start a conversation / Kontakt",
    formTitle: "Beschreiben Sie Ihr Anliegen",
    faqLabel: "Häufige Fragen vor der Kontaktaufnahme",
    companyWebsite: "Unternehmenswebsite",
    category: "Art der Anfrage",
    required: "Erforderlich",
    select: "Option auswählen",
    categories: {
      general: "Allgemeine Leistungsanfrage",
      advisor: "IT-Beratung, KI-Einführung oder Deployment",
      system: "Entwicklung von Geschäftssystemen",
      webApp: "Webanwendungen und Verwaltungsoberflächen",
      site: "Website-Funktionen und Qualitätsverbesserung",
      design: "Design und Kreativarbeit",
      integration: "Datenintegration und Automatisierung",
      operations: "Wartung und Betriebsverbesserung",
      estimate: "Angebotsanfrage",
      other: "Sonstiges",
    },
    name: "Name",
    email: "E-Mail-Adresse",
    subject: "Betreff",
    message: "Nachricht",
    submissionNote:
      "Das gemeinsame Acecore-Kontaktteam empfängt dieses Formular. Nach dem Senden gelangen Sie zur Bestätigungsseite dieser Website.",
    validationError:
      "Die Prüfung vor dem Senden ist noch nicht abgeschlossen. Bitte warten Sie kurz und versuchen Sie es erneut.",
    submit: "Senden",
    submitting: "Wird gesendet…",
    consultationSuffix: "Beratung",
  },
  ru: {
    eyebrow: "Start a conversation / Связаться",
    formTitle: "Опишите, что вы хотите обсудить",
    faqLabel: "Частые вопросы перед обращением",
    companyWebsite: "Сайт компании",
    category: "Тип обращения",
    required: "Обязательно",
    select: "Выберите вариант",
    categories: {
      general: "Общий вопрос об услугах",
      advisor: "IT-консалтинг, внедрение ИИ или развёртывание",
      system: "Разработка бизнес-систем",
      webApp: "Веб-приложения и панели управления",
      site: "Функции и качество веб-сайта",
      design: "Дизайн и креативные работы",
      integration: "Интеграция данных и автоматизация",
      operations: "Поддержка и улучшение эксплуатации",
      estimate: "Запрос сметы",
      other: "Другое",
    },
    name: "Имя",
    email: "Электронная почта",
    subject: "Тема",
    message: "Сообщение",
    submissionNote:
      "Форма поступает в единый контактный центр Acecore. После отправки вы вернётесь на страницу подтверждения этого сайта.",
    validationError:
      "Проверка перед отправкой ещё не завершена. Подождите немного и попробуйте снова.",
    submit: "Отправить",
    submitting: "Отправка…",
    consultationSuffix: "Консультация",
  },
};

export function getContactFormText(locale: Locale) {
  return {
    ...contactFormCopy[locale],
    categoryOptions: (Object.keys(contactCategoryValues) as CategoryKey[]).map(
      (key) => ({
        value: contactCategoryValues[key],
        label: contactFormCopy[locale].categories[key],
      }),
    ),
    categoryValues: contactCategoryValues,
  };
}

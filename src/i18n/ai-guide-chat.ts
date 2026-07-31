import type { Locale } from "./config";

export type AiGuideChatText = {
  eyebrow: string;
  title: string;
  lead: string;
  openLabel: string;
  closeLabel: string;
  greeting: string;
  quickPrompts: readonly [string, string, string];
  inputLabel: string;
  placeholder: string;
  characterLimit: string;
  send: string;
  sending: string;
  emptyError: string;
  tooLongError: string;
  timeoutError: string;
  genericError: string;
  disclosure: string;
  contact: string;
  privacy: string;
  assistantLabel: string;
  visitorLabel: string;
};

export const aiGuideChatCopy: Record<Locale, AiGuideChatText> = {
  ja: {
    eyebrow: "Systems AI案内",
    title: "開発や運用の相談先を探す",
    lead: "Acecoreの公開情報を横断して、適したサービスや次の相談先をご案内します。",
    openLabel: "Systems AI案内",
    closeLabel: "Systems AI案内を閉じる",
    greeting:
      "こんにちは。業務システム、Webサイト、AI導入、運用改善など、検討中のことを教えてください。",
    quickPrompts: [
      "どの開発サービスが合いますか？",
      "料金と相談の流れを知りたい",
      "運用中のシステムを改善したい",
    ],
    inputLabel: "質問",
    placeholder: "例：社内の申請業務をWeb化したい",
    characterLimit: "800文字以内",
    send: "送信",
    sending: "回答を準備中…",
    emptyError: "質問を入力してください。",
    tooLongError: "質問は800文字以内で入力してください。",
    timeoutError:
      "回答に時間がかかっています。少し待ってから、もう一度お試しください。",
    genericError:
      "現在AI案内を利用できません。お問い合わせフォームからご相談ください。",
    disclosure:
      "質問と直近の会話をAcecore共通AIへ送信します。個人情報や機密情報は入力しないでください。回答は誤る場合があります。",
    contact: "お問い合わせ",
    privacy: "個人情報の取り扱い",
    assistantLabel: "Systems AI案内",
    visitorLabel: "あなた",
  },
  en: {
    eyebrow: "Systems AI guide",
    title: "Find the right development or operations support",
    lead: "Searches across Acecore’s public information to guide you to a suitable service or next contact.",
    openLabel: "Systems AI guide",
    closeLabel: "Close the Systems AI guide",
    greeting:
      "Hello. Tell me what you are considering, such as a business system, website, AI adoption, or operational improvement.",
    quickPrompts: [
      "Which development service fits?",
      "How do pricing and consultation work?",
      "I want to improve an existing system",
    ],
    inputLabel: "Question",
    placeholder: "Example: We want to move an internal approval process online",
    characterLimit: "Up to 800 characters",
    send: "Send",
    sending: "Preparing an answer…",
    emptyError: "Please enter a question.",
    tooLongError: "Please keep the question within 800 characters.",
    timeoutError:
      "The answer is taking longer than expected. Please wait a moment and try again.",
    genericError:
      "The AI guide is currently unavailable. Please use the contact form.",
    disclosure:
      "Your question and recent conversation are sent to Acecore’s shared AI. Do not enter personal or confidential information. Answers may be inaccurate.",
    contact: "Contact",
    privacy: "Privacy",
    assistantLabel: "Systems AI guide",
    visitorLabel: "You",
  },
  "zh-cn": {
    eyebrow: "Systems AI 指南",
    title: "查找合适的开发或运维支持",
    lead: "横向检索 Acecore 的公开信息，为您推荐合适的服务或下一步咨询渠道。",
    openLabel: "Systems AI 指南",
    closeLabel: "关闭 Systems AI 指南",
    greeting:
      "您好。请告诉我您正在考虑的内容，例如业务系统、网站、AI 导入或运维改善。",
    quickPrompts: [
      "哪项开发服务适合我？",
      "我想了解费用和咨询流程",
      "我想改善现有系统",
    ],
    inputLabel: "问题",
    placeholder: "例如：希望将公司内部审批流程搬到网上",
    characterLimit: "最多 800 个字符",
    send: "发送",
    sending: "正在准备回答…",
    emptyError: "请输入问题。",
    tooLongError: "问题请控制在 800 个字符以内。",
    timeoutError: "回答所需时间较长。请稍候后重试。",
    genericError: "目前无法使用 AI 指南。请通过联系表单咨询。",
    disclosure:
      "您的问题和最近的对话会发送给 Acecore 共用 AI。请勿输入个人信息或机密信息。回答可能不准确。",
    contact: "联系我们",
    privacy: "个人信息处理",
    assistantLabel: "Systems AI 指南",
    visitorLabel: "您",
  },
  es: {
    eyebrow: "Guía de IA de Systems",
    title: "Encuentra el apoyo adecuado para desarrollo u operaciones",
    lead: "Consulta la información pública de Acecore para orientarte hacia el servicio o contacto más adecuado.",
    openLabel: "Guía de IA de Systems",
    closeLabel: "Cerrar la guía de IA de Systems",
    greeting:
      "Hola. Cuéntame qué estás considerando, por ejemplo un sistema empresarial, un sitio web, adopción de IA o mejora operativa.",
    quickPrompts: [
      "¿Qué servicio de desarrollo me conviene?",
      "¿Cómo funcionan los precios y la consulta?",
      "Quiero mejorar un sistema existente",
    ],
    inputLabel: "Pregunta",
    placeholder: "Ejemplo: Queremos digitalizar las aprobaciones internas",
    characterLimit: "Hasta 800 caracteres",
    send: "Enviar",
    sending: "Preparando una respuesta…",
    emptyError: "Escribe una pregunta.",
    tooLongError: "La pregunta debe tener un máximo de 800 caracteres.",
    timeoutError:
      "La respuesta está tardando más de lo previsto. Espera un momento e inténtalo de nuevo.",
    genericError:
      "La guía de IA no está disponible en este momento. Utiliza el formulario de contacto.",
    disclosure:
      "Tu pregunta y la conversación reciente se envían a la IA compartida de Acecore. No introduzcas información personal o confidencial. Las respuestas pueden contener errores.",
    contact: "Contacto",
    privacy: "Privacidad",
    assistantLabel: "Guía de IA de Systems",
    visitorLabel: "Tú",
  },
  pt: {
    eyebrow: "Guia de IA da Systems",
    title: "Encontre o suporte certo para desenvolvimento ou operações",
    lead: "Consulta as informações públicas da Acecore para indicar o serviço ou contato mais adequado.",
    openLabel: "Guia de IA da Systems",
    closeLabel: "Fechar o guia de IA da Systems",
    greeting:
      "Olá. Conte o que você está planejando, como um sistema empresarial, site, adoção de IA ou melhoria operacional.",
    quickPrompts: [
      "Qual serviço de desenvolvimento é ideal?",
      "Como funcionam preços e consulta?",
      "Quero melhorar um sistema existente",
    ],
    inputLabel: "Pergunta",
    placeholder: "Exemplo: Queremos digitalizar as aprovações internas",
    characterLimit: "Até 800 caracteres",
    send: "Enviar",
    sending: "Preparando uma resposta…",
    emptyError: "Digite uma pergunta.",
    tooLongError: "A pergunta deve ter no máximo 800 caracteres.",
    timeoutError:
      "A resposta está demorando mais que o esperado. Aguarde um momento e tente novamente.",
    genericError:
      "O guia de IA está indisponível no momento. Use o formulário de contato.",
    disclosure:
      "Sua pergunta e a conversa recente são enviadas à IA compartilhada da Acecore. Não insira informações pessoais ou confidenciais. As respostas podem conter erros.",
    contact: "Contato",
    privacy: "Privacidade",
    assistantLabel: "Guia de IA da Systems",
    visitorLabel: "Você",
  },
  fr: {
    eyebrow: "Guide IA de Systems",
    title: "Trouvez le bon accompagnement en développement ou exploitation",
    lead: "Consulte les informations publiques d’Acecore pour vous orienter vers le service ou le contact adapté.",
    openLabel: "Guide IA de Systems",
    closeLabel: "Fermer le guide IA de Systems",
    greeting:
      "Bonjour. Décrivez votre projet : système métier, site web, adoption de l’IA ou amélioration des opérations.",
    quickPrompts: [
      "Quel service de développement choisir ?",
      "Comment fonctionnent les tarifs et le conseil ?",
      "Je veux améliorer un système existant",
    ],
    inputLabel: "Question",
    placeholder: "Exemple : Nous voulons numériser nos validations internes",
    characterLimit: "800 caractères maximum",
    send: "Envoyer",
    sending: "Préparation de la réponse…",
    emptyError: "Saisissez une question.",
    tooLongError: "La question doit contenir au maximum 800 caractères.",
    timeoutError:
      "La réponse prend plus de temps que prévu. Patientez un instant puis réessayez.",
    genericError:
      "Le guide IA est actuellement indisponible. Utilisez le formulaire de contact.",
    disclosure:
      "Votre question et la conversation récente sont envoyées à l’IA partagée d’Acecore. Ne saisissez aucune information personnelle ou confidentielle. Les réponses peuvent être inexactes.",
    contact: "Contact",
    privacy: "Confidentialité",
    assistantLabel: "Guide IA de Systems",
    visitorLabel: "Vous",
  },
  ko: {
    eyebrow: "Systems AI 안내",
    title: "개발 및 운영에 맞는 지원 찾기",
    lead: "Acecore의 공개 정보를 가로질러 검색하고 적합한 서비스나 다음 상담 창구를 안내합니다.",
    openLabel: "Systems AI 안내",
    closeLabel: "Systems AI 안내 닫기",
    greeting:
      "안녕하세요. 업무 시스템, 웹사이트, AI 도입, 운영 개선 등 검토 중인 내용을 알려주세요.",
    quickPrompts: [
      "어떤 개발 서비스가 적합한가요?",
      "요금과 상담 절차를 알고 싶어요",
      "기존 시스템을 개선하고 싶어요",
    ],
    inputLabel: "질문",
    placeholder: "예: 사내 승인 업무를 온라인으로 전환하고 싶어요",
    characterLimit: "800자 이내",
    send: "보내기",
    sending: "답변 준비 중…",
    emptyError: "질문을 입력해 주세요.",
    tooLongError: "질문은 800자 이내로 입력해 주세요.",
    timeoutError:
      "답변에 예상보다 시간이 걸리고 있습니다. 잠시 후 다시 시도해 주세요.",
    genericError:
      "현재 AI 안내를 이용할 수 없습니다. 문의 양식을 이용해 주세요.",
    disclosure:
      "질문과 최근 대화가 Acecore 공용 AI로 전송됩니다. 개인정보나 기밀정보를 입력하지 마세요. 답변이 정확하지 않을 수 있습니다.",
    contact: "문의",
    privacy: "개인정보 처리",
    assistantLabel: "Systems AI 안내",
    visitorLabel: "사용자",
  },
  de: {
    eyebrow: "Systems KI-Hilfe",
    title: "Passende Unterstützung für Entwicklung oder Betrieb finden",
    lead: "Durchsucht die öffentlichen Informationen von Acecore und führt Sie zum passenden Angebot oder Kontakt.",
    openLabel: "Systems KI-Hilfe",
    closeLabel: "Systems KI-Hilfe schließen",
    greeting:
      "Hallo. Beschreiben Sie Ihr Vorhaben, etwa ein Geschäftssystem, eine Website, KI-Einführung oder betriebliche Verbesserung.",
    quickPrompts: [
      "Welcher Entwicklungsservice passt?",
      "Wie funktionieren Preise und Beratung?",
      "Ich möchte ein bestehendes System verbessern",
    ],
    inputLabel: "Frage",
    placeholder: "Beispiel: Wir möchten interne Freigaben digitalisieren",
    characterLimit: "Bis zu 800 Zeichen",
    send: "Senden",
    sending: "Antwort wird vorbereitet…",
    emptyError: "Bitte geben Sie eine Frage ein.",
    tooLongError: "Die Frage darf höchstens 800 Zeichen lang sein.",
    timeoutError:
      "Die Antwort dauert länger als erwartet. Bitte warten Sie kurz und versuchen Sie es erneut.",
    genericError:
      "Die KI-Hilfe ist derzeit nicht verfügbar. Bitte nutzen Sie das Kontaktformular.",
    disclosure:
      "Ihre Frage und der letzte Gesprächsverlauf werden an die gemeinsame KI von Acecore gesendet. Geben Sie keine persönlichen oder vertraulichen Informationen ein. Antworten können fehlerhaft sein.",
    contact: "Kontakt",
    privacy: "Datenschutz",
    assistantLabel: "Systems KI-Hilfe",
    visitorLabel: "Sie",
  },
  ru: {
    eyebrow: "ИИ-помощник Systems",
    title: "Найдите подходящую поддержку для разработки или эксплуатации",
    lead: "Ищет по открытой информации Acecore и направляет к подходящей услуге или каналу связи.",
    openLabel: "ИИ-помощник Systems",
    closeLabel: "Закрыть ИИ-помощника Systems",
    greeting:
      "Здравствуйте. Расскажите, что вы планируете: бизнес-систему, сайт, внедрение ИИ или улучшение эксплуатации.",
    quickPrompts: [
      "Какая услуга разработки мне подходит?",
      "Как устроены цены и консультация?",
      "Хочу улучшить существующую систему",
    ],
    inputLabel: "Вопрос",
    placeholder: "Например: хотим перевести внутренние согласования в онлайн",
    characterLimit: "До 800 символов",
    send: "Отправить",
    sending: "Готовим ответ…",
    emptyError: "Введите вопрос.",
    tooLongError: "Вопрос должен содержать не более 800 символов.",
    timeoutError:
      "Ответ занимает больше времени, чем ожидалось. Подождите немного и повторите попытку.",
    genericError:
      "ИИ-помощник сейчас недоступен. Используйте форму обратной связи.",
    disclosure:
      "Ваш вопрос и недавняя переписка отправляются общему ИИ Acecore. Не вводите персональные или конфиденциальные данные. Ответы могут содержать ошибки.",
    contact: "Связаться",
    privacy: "Конфиденциальность",
    assistantLabel: "ИИ-помощник Systems",
    visitorLabel: "Вы",
  },
};

export function getAiGuideChatText(locale: Locale): AiGuideChatText {
  return aiGuideChatCopy[locale];
}

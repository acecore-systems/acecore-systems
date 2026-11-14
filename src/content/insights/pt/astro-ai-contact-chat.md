---
title: "Arquitetura técnica para integrar um chat de IA para atendimento a um site Astro"
description: "Arquitetura de referência válida em 2026/6. Projeto técnico para integrar um chat de IA para atendimento, usando a OpenAI Responses API, a um site estático com Astro + Cloudflare Pages. Organiza, em um formato fácil de adaptar a outros sites, os limites da API, o contexto do site, o controle de prompts, URLs por locale, verificação de Origin, limitação de taxa e renderização segura de links Markdown."
date: 2026-06-07T12:00
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Tecnologia", "Cloudflare", "Sites", "IA", "Serviços"]
image: "/images/insights/covers/astro-ai-contact-chat-cover-v2.webp"
callout:
  type: info
  title: Pontos principais deste artigo
  text: Um chat de IA para atendimento não deve ser projetado como um recurso em que a IA responde livremente, mas como um pequeno aplicativo que usa informações já publicadas no site para encaminhar os visitantes ao caminho adequado. A chave de API, o prompt, os dados de contato e a renderização de Markdown são controlados no servidor e por listas de permissões.
processFigure:
  title: Arquitetura de referência de um chat de IA para atendimento
  steps:
    - title: Componente de chat
      description: A interface de chat do Astro envia apenas a pergunta, o locale de exibição e o histórico mínimo necessário.
      icon: i-lucide-message-circle
      accent: brand
    - title: Função
      description: A Cloudflare Pages Function é responsável por validar a entrada, verificar Origin, limitar a taxa de solicitações e gerar o prompt.
      icon: i-lucide-shield-check
      accent: amber
    - title: Modelo
      description: As informações públicas do site e o contexto da conversa são enviados à OpenAI Responses API, que retorna o texto da resposta.
      icon: i-lucide-sparkles
      accent: emerald
    - title: Renderizador
      description: Apenas o Markdown permitido é convertido em DOM no cliente, que encaminha os visitantes para links internos ou dados de contato.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Responsabilidades que devem ser separadas na implementação
  before:
    label: Quando tudo é implementado em conjunto
    items:
      - A API de IA é chamada diretamente pelo navegador
      - Informações do site, chave de API, interface e renderização de links ficam misturadas
      - A IA tende a afirmar preços, contratos e prazos de entrega com certeza excessiva
      - Markdown e URLs podem acabar sendo inseridos diretamente no HTML
  after:
    label: Quando as responsabilidades são separadas
    items:
      - A chave de API e as chamadas ao modelo ficam no servidor
      - As informações públicas do site são gerenciadas como contexto explícito
      - O escopo das respostas e os caminhos de contato são controlados pelo prompt
      - Markdown e URLs são renderizados usando uma lista de permissões
checklist:
  title: Verificações de projeto ao implementar em outros sites
  items:
    - text: Definir o objetivo do chat de IA como “organizar os caminhos”, não “resolver o contato por completo”
    - text: Criar uma fronteira de API no servidor, sem expor a chave de API no navegador
    - text: Limitar as informações usadas nas respostas ao conteúdo já publicado no site
    - text: Definir áreas em que a IA não deve fazer afirmações definitivas, como preços, contratos, prazos e garantias
    - text: Definir regras para direcionar os visitantes ao formulário, ao LINE, ao e-mail ou ao telefone
    - text: Gerar URLs por locale para não prejudicar os caminhos de navegação multilíngues
    - text: Implementar verificação de Origin, limites de tamanho da entrada e do histórico e limitação de taxa
    - text: Validar os links Markdown usando uma lista de permissões depois de aplicar trim
linkCards:
  - href: /contact/
    title: Contato
    description: Página que organiza as entradas para o chat de IA, o LINE, o formulário e os contatos diretos.
    icon: i-lucide-message-square
  - href: /insights/cloudflare-pages-security/
    title: Configurações de segurança do Cloudflare Pages
    description: Artigo sobre a base de distribuição de sites estáticos, incluindo CSP e configuração de cabeçalhos.
    icon: i-lucide-shield
  - href: /blog/cms-selection-and-turnstile/
    title: Guia de implantação do Sveltia CMS
    description: Artigo relacionado sobre como adicionar uma interface de edição de CMS a um site estático.
    icon: i-lucide-badge-check
faq:
  title: Perguntas frequentes
  items:
    - question: É possível criar um chat de IA para atendimento sem RAG ou banco de dados vetorial?
      answer: Para um site corporativo pequeno, pode ser útil começar passando ao prompt um contexto estruturado com os pontos principais das páginas já publicadas. Basta considerar um índice de busca ou um banco de dados vetorial quando o número de páginas ou a frequência de atualização aumentar.
    - question: A chave da API da OpenAI fica exposta no navegador?
      answer: Não. O navegador apenas envia a pergunta para /api/ai-contact, e a chamada à OpenAI Responses API e o gerenciamento da chave de API são feitos pela Cloudflare Pages Function.
    - question: Os links nas respostas da IA podem ser exibidos sem restrições?
      answer: Não. São permitidos apenas caminhos internos, a mesma origin, acecore.net, o LINE oficial e, quando necessário, mailto e tel. Mesmo que haja espaços antes ou depois da URL de um link Markdown, ela é validada com trim para garantir a segurança.
---

Para experimentar um chat de IA em um site estático, comece limitando-o a orientar os visitantes sobre o FAQ público e encaminhe os pedidos formais de orçamento ou atendimento ao formulário. Consulte [Vinculações do Cloudflare Pages](https://developers.cloudflare.com/pages/functions/bindings/) para configurar a conexão do lado do servidor. A validação de URLs descrita no texto é um exemplo simplificado da época; na implementação, use a análise sintática de URLs e uma lista de permissões, como explicado no artigo relacionado, em vez de permitir URLs apenas por correspondência de prefixo da string.

> **Adendo de 2026/9/26:** O conteúdo abaixo é uma arquitetura de referência válida em 2026/6. A implementação atual do Acecore Systems encaminha `/api/ai-chat`, a partir de uma Cloudflare Pages Function, por meio de um Service Binding, para um `acecore-chat-worker` compartilhado. A interface recebe a resposta JSON e exibe a resposta pronta. A arquitetura descrita no texto, que chama diretamente a OpenAI Responses API, deve ser interpretada como referência, não como uma descrição da implementação atual do Systems.

Um chat de IA para atendimento é fácil de adicionar a um site, se o objetivo for apenas colocar IA nele. Na operação real, porém, os problemas têm menos a ver com o desempenho do modelo e mais com o que ele pode responder, para qual caminho encaminhar o visitante, quais URLs podem ser exibidas e como controlar o custo da API.

Nos sites da Acecore, adicionamos um chat de IA para atendimento a um site estático com Astro + Cloudflare Pages. O núcleo da implementação está em [PR que implementou a IA para atendimento e o fluxo de tradução restrito ao CMS](https://github.com/acecore-systems/acecore-net/pull/98). Depois, ajustamos em [outro PR](https://github.com/acecore-systems/acecore-net/pull/99) a renderização segura de links Markdown incluídos nas respostas da IA. Os detalhes da renderização de links estão organizados separadamente em [Projeto técnico para renderizar com segurança links Markdown nas respostas do chat de IA](/blog/ai-chat-markdown-link-safety/).

Este artigo não é um registro de trabalho de um site específico, mas organiza o assunto como um projeto técnico facilmente adaptável a outros sites estáticos. Mesmo em frontends que não usam Astro, os princípios são praticamente os mesmos: a base é separar as responsabilidades do cliente, da fronteira da API, do prompt e do renderizador.

## Arquitetura geral

Esta arquitetura tem 3 camadas simples.

| Camada               | Responsabilidade                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------- |
| Widget de chat       | UI, entrada, locale de exibição, histórico mínimo necessário, renderização de Markdown              |
| `/api/ai-contact`    | Validação da entrada, verificação de Origin, limitação de taxa, geração do prompt, chamada à OpenAI |
| OpenAI Responses API | Geração de respostas com base nas informações do site e no contexto da conversa                     |

Não chamamos a API da OpenAI diretamente pelo navegador. Há 3 motivos.

- Não expor a chave de API no navegador
- Possibilitar a atualização do modelo, do prompt e do contexto do site no servidor
- Centralizar a validação do tamanho da entrada, de Origin, da limitação de taxa e do tratamento de erros em 1 lugar

No caso de Astro + Cloudflare Pages, a fronteira da API pode ser implementada como `/api/ai-contact` das Cloudflare Pages Functions. Se você usa Next.js, basta substituir por um Route Handler; em Hono ou Express, por uma rota de API, mantendo a mesma abordagem.

## Manter pequeno o contrato do endpoint

Reduza ao mínimo as informações enviadas à API do chat de IA para atendimento.

```ts
type ContactAiRequest = {
  message: string;
  locale: "ja" | "en" | "zh-cn" | "es" | "pt" | "fr" | "ko" | "de" | "ru";
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
};

type ContactAiResponse = {
  answer: string;
};
```

Decidimos não enviar ao chat de IA dados do formulário, como nome, endereço de e-mail, telefone ou nome da empresa. O chat de IA para atendimento não é um local para coletar dados pessoais, mas uma porta de entrada para ajudar o visitante a descobrir “qual serviço deve consultar” e “por onde deve iniciar uma conversa”.

Também não enviamos o histórico sem limite. Mantemos apenas as mensagens recentes e limitamos o número de caracteres por 1 mensagem. Isso ajuda a controlar o crescimento do prompt e o custo da API.

## Controlar entradas e chamadas no servidor

Na Cloudflare Pages Function, reunimos os seguintes processos.

```ts
export async function onRequestPost({ request, env }: PagesFunction<Env>) {
  assertSameOrigin(request);
  assertRateLimit(request);

  const body = await request.json();
  const message = validateMessage(body.message);
  const locale = validateLocale(body.locale);
  const history = trimHistory(body.history);

  const prompt = buildContactPrompt({
    locale,
    message,
    history,
    siteContext: buildPublicSiteContext(locale),
  });

  const answer = await callOpenAIResponsesApi({
    apiKey: env.OPENAI_API_KEY,
    model: env.OPENAI_MODEL,
    prompt,
  });

  return Response.json({ answer });
}
```

O ponto principal da implementação é sempre organizar e reduzir a entrada antes de chamar a OpenAI. A API de IA gera custos de acordo com os dados que recebe. Se textos longos, histórico desnecessário ou acessos repetidos de sites externos forem aceitos sem controle, a operação pode se tornar instável antes mesmo de haver problemas com o funcionamento do recurso.

Definir `OPENAI_MODEL` como variável de ambiente facilita trocar o modelo e testar no ambiente de preview. `OPENAI_API_KEY`, naturalmente, deve ser gerenciada apenas como uma variável de ambiente no servidor.

A distribuição pelo Cloudflare Pages e as considerações sobre CSP também estão organizadas em [Como publicar um site estático seguro com Cloudflare Pages](/insights/cloudflare-pages-security/).

## Fornecer explicitamente as informações do site como contexto

Para um site deste porte, não é necessário começar com um banco de dados vetorial ou RAG. Primeiro, é mais simples para implementar e operar passar ao prompt um contexto estruturado com os pontos principais das informações já publicadas no site.

Por exemplo, estas informações podem ser reunidas no servidor.

- Visão geral da empresa e dos serviços
- Público-alvo de cada serviço, exemplos de consultas e URLs relacionadas
- Conteúdo que já tem respostas no FAQ
- Como escolher entre formulário de contato, LINE, e-mail e telefone
- Áreas em que a IA não deve fazer afirmações definitivas, como preços, contratos e prazos de entrega
- URLs internas de cada locale

O importante é fornecer informações que o site está autorizado a usar nas respostas, em vez de pedir ao modelo que responda com base no que “parece saber”.

```ts
function buildPublicSiteContext(locale: Locale) {
  return {
    services: [
      {
        name: "Web制作",
        summary: "コーポレートサイト、採用サイト、LPの制作相談に対応",
        url: localizePath("/services/web-production/", locale),
      },
      {
        name: "サーバー運用",
        summary: "クラウド、VPS、監視、バックアップ設計の相談に対応",
        url: localizePath("/services/server-operations/", locale),
      },
    ],
    contact: {
      form: localizePath("/contact/", locale),
      line: "https://lin.ee/...",
      emailPolicy: "フォームが使えない場合や補足が必要な場合だけ案内する",
      phonePolicy: "急ぎの確認が必要な場合だけ案内する",
    },
  };
}
```

Enquanto houver poucas páginas, essa abordagem é suficiente. Se aumentarem o número de páginas, a frequência de atualização ou as exigências de busca, pode fazer sentido adicionar uma camada de pesquisa usando Pagefind, JSON do CMS, D1, Vectorize e outras ferramentas.

## O prompt deve definir regras, não apenas o texto da resposta

No prompt do chat de IA para atendimento, é mais importante definir claramente o escopo das respostas e as proibições do que simplesmente instruir o modelo a escrever de forma natural.

```txt
あなたはこのサイトの問い合わせ案内AIです。
公開済みサイト情報だけを根拠に回答してください。

ルール:
- 料金、契約、納期、保証を断定しない
- 詳細見積りや正式な相談は問い合わせフォームへ案内する
- 短い確認やSchoolsに関する相談はLINEも案内する
- メールと電話は、ユーザーが直接連絡を求めた場合だけ案内する
- 内部リンクは現在のlocaleに合うURLを使う
- わからない場合は、推測せずフォームへ案内する
```

Um erro comum em chats de IA é o modelo fazer afirmações categóricas na tentativa de apresentar melhor os serviços. Por exemplo, para perguntas como “Quanto custa?”, “Quando ficará pronto?” ou “É garantido que vocês conseguem atender?”, é necessário limitar-se a orientações gerais e encaminhar as respostas oficiais ao formulário.

Isso não é apenas uma questão jurídica. Orçamentos e prazos não podem ser definidos antes de conversar com o cliente. O prompt deve especificar as respostas pelas quais a operação pode se responsabilizar, em vez de priorizar respostas comercialmente convenientes.

## Separar as funções dos canais de contato

O chat de IA não substitui o formulário. A operação da página de contato fica mais simples quando os caminhos são separados da seguinte forma.

| Caminho        | Função                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------ |
| FAQ            | Resolver primeiro, na própria página, as dúvidas mais frequentes                                                         |
| Chat de IA     | Organizar por conversa a escolha de serviços, o canal adequado e as páginas relacionadas                                 |
| LINE           | Usado para consultas rápidas, assuntos relacionados à Schools e dúvidas simples                                          |
| Formulário     | Usado para consultas que precisam ficar registradas, como orçamentos, consultas sobre produção, parcerias e recrutamento |
| Contato direto | Exibido apenas quando é necessário complementar uma solicitação enviada pelo formulário ou fazer uma consulta urgente    |

Quando a IA conecta conteúdo de apresentação, como a [página de serviços](/services/), ao caminho concreto de atendimento da [página de contato](/contact/), os visitantes não precisam procurar as páginas novamente por conta própria.

Essa abordagem também pode ser aplicada a sites empresariais, sites de agências, sites de escolas e caminhos de suporte de SaaS. É mais fácil implementar quando a IA ajuda a selecionar a próxima página a consultar ou o meio de contato, em vez de tentar resolver tudo por conta própria.

## Preservar as URLs de cada locale

Em sites multilíngues, não basta que o idioma da resposta da IA esteja correto: as URLs de destino também precisam corresponder ao locale.

Por exemplo, se a pergunta for feita em uma página em inglês, a resposta também deve ser em inglês, e o link para a página de serviços deve usar uma URL com locale, como `/en/services/`. Em uma página em japonês, use `/services/`.

Essa lógica é mais confiável quando definida por uma função de geração de URLs no servidor, em vez de depender do prompt.

```ts
function localizePath(path: string, locale: Locale) {
  if (locale === "ja") return path;
  return `/${locale}${path}`;
}
```

Se apenas a resposta da IA voltar para uma URL em japonês, o caminho multilíngue será prejudicado. A base para blogs multilíngues e fluxos de tradução está organizada em [Como gerenciar um blog multilíngue com Sveltia CMS](/blog/copilot-translation-pipeline/).

## Adicionar verificação de Origin e limitação de taxa

Como `/api/ai-contact` é uma API pública, implemente pelo menos a verificação de Origin, limites de tamanho da entrada e do histórico e limitação de taxa.

Na verificação de Origin, quando o cabeçalho `Origin` está presente, confirme se a origem da solicitação corresponde ao host da API. Isso reduz as chamadas feitas sem autorização por outros sites.

```ts
function assertSameOrigin(request: Request) {
  const origin = request.headers.get("Origin");
  if (!origin) return;

  const requestUrl = new URL(request.url);
  const originUrl = new URL(origin);

  if (originUrl.host !== requestUrl.host) {
    throw new Response("Forbidden", { status: 403 });
  }
}
```

A limitação de taxa é útil mesmo que comece com uma regra simples baseada em IP. Em um ambiente Cloudflare, você pode identificar a origem usando `CF-Connecting-IP`, `X-Forwarded-For` e `CF-Ray`.

No entanto, a limitação de taxa em memória não é persistente entre vários isolates ou reinicializações. Pode servir como proteção inicial para um site pequeno, mas, se o acesso aumentar, é mais confiável usar Cloudflare WAF, Turnstile, KV, D1 ou Durable Objects.

O projeto de CMS para atualização de conteúdo está organizado separadamente no [Guia de implantação do Sveltia CMS](/blog/cms-selection-and-turnstile/). A proteção contra bots em formulários e comentários deve ser tratada em outra camada, como o Turnstile. O projeto de uma funcionalidade de comentários usando apenas Cloudflare está descrito em [Como criar uma funcionalidade de comentários para um blog Astro usando apenas Cloudflare](/blog/cloudflare-only-blog-comments/).

## Renderizar links Markdown usando uma lista de permissões

Incluir links nas respostas da IA é útil para apresentar serviços. No entanto, evite inserir Markdown diretamente no HTML.

Na interface do chat, converta em DOM apenas as expressões permitidas.

- Parágrafos
- Listas com marcadores
- Negrito
- Código em linha
- Links Markdown

Restrinja ainda mais os destinos dos links.

- Caminhos dentro do mesmo site, como `/services/`
- A origin atual
- `https://acecore.net`
- LINE oficial
- `mailto:info@acecore.net` quando necessário
- `tel:0120987370` quando necessário

Sempre aplique `trim()` à URL antes de validá-la. A IA pode retornar URLs com espaços antes ou depois, como em `[サービス一覧]( /services/ )`.

```ts
function sanitizeHref(rawHref: string, currentOrigin: string) {
  const href = rawHref.trim();

  if (href.startsWith("/")) return href;
  if (href.startsWith(`${currentOrigin}/`)) return href;
  if (href.startsWith("https://acecore.net/")) return href;
  if (href.startsWith("https://lin.ee/")) return href;
  if (href === "mailto:info@acecore.net") return href;
  if (href === "tel:0120987370") return href;

  return null;
}
```

É mais fácil de manter aceitar apenas as expressões usadas no chat e tratá-las com rigor do que tentar implementar toda a especificação de Markdown. Mesmo que queira permitir URLs externas livremente, inclua pelo menos uma lista de permissões de domínios e `rel="noopener noreferrer"`.

## O que verificar no ambiente local, em preview e em produção

O ambiente de desenvolvimento local do Astro e o preview não correspondem perfeitamente ao ambiente de execução das Cloudflare Pages Functions. Em um ambiente sem `OPENAI_API_KEY`, as respostas da IA não estarão disponíveis; por isso, verifique as mensagens de erro e a alternativa exibida pela interface.

No preview ou em produção do Pages, verifique os seguintes pontos.

- `/api/ai-contact` pode ser chamado por POST
- `OPENAI_API_KEY` e `OPENAI_MODEL` estão configurados
- Solicitações com outra Origin são rejeitadas
- O tamanho da entrada e a quantidade de mensagens do histórico são limitados
- A resposta corresponde ao locale de exibição
- Os links internos usam URLs com locale
- A IA não faz afirmações definitivas sobre orçamentos ou contratos
- E-mail e telefone não são exibidos o tempo todo
- Os links Markdown são convertidos apenas em URLs seguras

A integração de IA não está concluída só porque o sistema respondeu a 1 pergunta. Verifique separadamente perguntas inesperadas, mensagens longas, perguntas feitas a partir de páginas em inglês, pedidos de contato direto e perguntas sobre preços.

## Métricas úteis para logs e operação

Também é importante verificar os logs depois de publicar o chat de IA para atendimento.

No mínimo, acompanhe estas métricas.

- Taxa de erros da API
- Número de vezes em que a limitação de taxa foi acionada
- Número médio de mensagens por 1 consulta
- Número de acessos ao formulário ou ao LINE
- Número de vezes em que a IA não conseguiu responder e encaminhou o visitante ao formulário
- Número de usos por locale

Se as conversas forem armazenadas, é necessário definir primeiro como os dados pessoais serão tratados. É mais seguro começar sem salvar o conteúdo das mensagens e acompanhar apenas a quantidade de eventos e os erros.

## Escopo separado nesta implementação

Este artigo se concentra apenas no projeto técnico do chat de IA para atendimento. Também implementamos um caminho para levar o assunto de interesse da página de serviços ao formulário; esse tema está organizado separadamente em [Projeto técnico para levar o contexto da página de serviços ao formulário de contato por meio de uma CTA](/blog/service-cta-contact-prefill/).

Isso acontece porque são assuntos diferentes.

- Chat de IA: organizar as dúvidas por conversa e orientar com segurança
- CTA por serviço: levar ao formulário o contexto do serviço que o visitante está lendo

O primeiro assunto envolve IA, fronteira da API, prompt e renderização segura. O segundo trata da experiência do formulário e do projeto dos caminhos de navegação. Separá-los facilita a leitura e a inclusão de links internos posteriormente.

## Resumo

Ao integrar um chat de IA para atendimento a um site estático, é mais importante projetar primeiro a fronteira da API e o controle das respostas do que a interface do chat.

Os pontos que fizeram mais diferença nesta implementação foram:

- Chamar a API da OpenAI por uma Cloudflare Pages Function, não pelo navegador
- Reduzir a entrada do endpoint e limitar o histórico e o número de caracteres
- Montar no servidor as informações do site e as URLs por locale
- Especificar no prompt o que a IA pode ou não afirmar com certeza
- Separar as funções do formulário, do LINE e dos contatos diretos
- Implementar verificação de Origin e limitação de taxa
- Renderizar links Markdown com uma lista de permissões depois de aplicar trim

Mesmo em um site estático, é possível implementar um chat de IA para atendimento. O objetivo principal não é dar destaque à IA, mas ajudar os visitantes a escolher com segurança o próximo passo.

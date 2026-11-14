---
title: "Implementação segura da renderização de links Markdown em respostas de chat com IA"
description: "Esta nota de implementação descreve como converter com segurança para HTML os links Markdown presentes em respostas de chat com IA. Ao aceitar espaços em branco antes e depois das URLs e tratar separadamente trim, lista de permissões, criação do DOM, fallback e casos de teste, criamos um renderizador fácil de reutilizar em outros sites."
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Tecnologia", "Sites", "IA", "Segurança", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: Pontos principais deste artigo
  text: As respostas da IA não são HTML confiável. Mesmo que os links Markdown sejam convenientes, aplique trim à URL antes de verificá-la em uma lista de permissões; se ela não for permitida, não a transforme em link e mantenha-a como texto.
processFigure:
  title: Fluxo de renderização de links nas respostas da IA
  steps:
    - title: Texto
      description: Trate primeiro as respostas do modelo como texto simples.
      icon: i-lucide-message-square-text
      accent: brand
    - title: Analisar
      description: Use um pequeno analisador para reconhecer apenas as construções Markdown necessárias.
      icon: i-lucide-brackets
      accent: amber
    - title: Validar
      description: Aplique trim ao href e permita apenas URLs internas ou de domínios autorizados.
      icon: i-lucide-shield-check
      accent: emerald
    - title: Renderizar
      description: Crie apenas elementos seguros usando a API do DOM.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Decisões a separar na renderização de links Markdown
  before:
    label: Renderização descuidada
    items:
      - Inserir diretamente as respostas da IA em innerHTML
      - Tentar implementar de uma só vez toda a especificação Markdown
      - Não conseguir criar o link por causa de espaços em branco antes ou depois da URL
      - "Tratar URLs externas e javascript: da mesma forma"
  after:
    label: Renderização simples e segura
    items:
      - Receber a resposta como texto e criar elementos DOM apenas para as construções necessárias
      - Dar suporte apenas ao Markdown usado no chat
      - Verificar se a URL é segura após aplicar trim
      - Exibir como texto, sem transformar em link, URLs que não sejam permitidas
checklist:
  title: Lista de verificação para implantação
  items:
    - text: Não tratar as respostas da IA como HTML confiável
    - text: Aceitar espaços em branco antes e depois da URL dos links Markdown
    - text: Sempre aplicar trim ao href antes de validá-lo
    - text: Permitir apenas caminhos internos, URLs da mesma origem e domínios externos necessários
    - text: Definir explicitamente target e rel nos links externos
    - text: Manter como texto os links que não forem permitidos
    - text: Testar não só os casos válidos, mas também URLs perigosas e Markdown malformado
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: Projeto técnico do chat de IA para atendimento
    description: Artigo principal que aborda as respostas da IA, os limites da API e o controle de prompts.
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Configurações de segurança do Cloudflare Pages
    description: Artigo relacionado que organiza CSP e cabeçalhos de segurança.
    icon: i-lucide-shield
  - href: /contact/
    title: Entre em contato
    description: O fluxo real que inclui o chat com IA e o formulário.
    icon: i-lucide-message-square
faq:
  title: Perguntas frequentes
  items:
    - question: Usar markdown-it ou marked é suficiente?
      answer: Mesmo ao usar uma biblioteca, ainda é necessário projetar separadamente o tratamento da saída HTML, os destinos de links permitidos, a inclusão de target e rel e a rejeição de URLs perigosas. Para uso em chat, um pequeno renderizador próprio também pode ser suficiente.
    - question: Permitir espaços em branco antes e depois da URL não cria riscos?
      answer: O importante não é o fato de aceitar espaços em branco, mas o que é permitido após a aplicação de trim. Ao verificar o href após trim em uma lista de permissões, é possível manter a segurança e tornar o sistema mais resistente às variações de formatação do modelo.
    - question: URLs que não podem ser permitidas devem ser removidas?
      answer: Em muitos casos, exibi-las como texto é mais fácil de depurar do que removê-las, além de preservar o contexto da resposta para o usuário. Contudo, se a operação exigir ocultar completamente strings suspeitas, também é possível descartar todo o link.
---

Se os links das respostas da IA continuarem como texto, comece passando a mesma entrada, em sequência, pelas etapas de análise, validação da URL e renderização no DOM para descobrir em qual delas ocorre a falha. Para o texto exibido, use uma API destinada a texto, como [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent), e não misture a decisão de transformar o conteúdo em link com a interpretação de HTML. Esse é o ponto de partida para aplicar a solução a um chat existente.

Se o chat com IA responder “Para mais detalhes, consulte a [lista de serviços](/services/)”, pode acontecer de a resposta não ser exibida como link e de a string Markdown permanecer intacta.

Também no site da Acecore, links Markdown com espaços em branco antes e depois da URL apareciam nas respostas do chat de atendimento; por isso, ajustamos o renderizador na [PR que corrigiu a renderização de links Markdown no chat com IA](https://github.com/acecore-systems/acecore-net/pull/99).

Neste artigo, usamos essa pequena correção como ponto de partida para reunir as ideias necessárias para converter respostas de IA em elementos do DOM com segurança.

## As respostas da IA não são HTML confiável

Como premissa, trate as respostas da IA como texto, não como HTML.

Na interface de chat, é natural querer oferecer pelo menos links, negrito e listas. Porém, se você inserir diretamente a resposta em `innerHTML`, estará pedindo ao navegador que interprete a string gerada pelo modelo.

Não é necessário implementar o Markdown por completo. Basta reconhecer, em pequena escala, apenas as construções necessárias no chat e criar somente elementos DOM seguros.

## O problema não se resume aos espaços em branco

O problema direto desta vez era um link como o seguinte.

```md
[サービス一覧](/services/)
```

Como Markdown, ele faz sentido para uma pessoa, mas uma expressão regular que captura a parte da URL como uma “string sem espaços em branco” não encontrará correspondência.

Antes da correção, a lógica era a seguinte.

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

`[^)\s]+` não permite espaços em branco, então não consegue reconhecer `( /services/ )` como um link. Por isso, passamos a permitir espaços em branco antes e depois dentro dos parênteses e, depois, aplicar trim à URL usada de fato.

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

É importante não simplesmente relaxar a expressão regular e parar por aí. Depois de flexibilizá-la, inclua sempre normalização e verificação de segurança.

## Valide o href depois de aplicar trim

A sequência de criação do link deve ser fixa.

1. Extraia do Markdown o texto do link (label) e o href bruto
2. Aplique `trim()` ao href bruto
3. Valide o href após trim com uma lista de permissões
4. Crie `<a>` somente se o destino for permitido

```js
const href = String(rawHref || "").trim();

if (label && isSafeMarkdownHref(href)) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";

  if (/^https?:\/\//i.test(href)) {
    link.target = "_blank";
  }

  link.textContent = label;
  parent.appendChild(link);
}
```

Valide o valor que será realmente inserido no DOM depois da aplicação de `trim()`, não o valor anterior. Se o valor validado e o valor renderizado não coincidirem, a verificação de segurança perde eficácia.

## A lista de permissões deve ser definida para cada produto

As URLs que o chat com IA pode recomendar variam de acordo com o site.

Para o chat de atendimento da Acecore, restringimos os links aproximadamente às seguintes categorias.

| Tipo            | Exemplo                   | Decisão                                        |
| --------------- | ------------------------- | ---------------------------------------------- |
| Caminho interno | `/services/`              | Permitir                                       |
| Mesma origem    | `https://acecore.net/...` | Permitir                                       |
| LINE oficial    | `https://lin.ee/...`      | Permitir, pois o objetivo é claro              |
| mailto          | `mailto:info@acecore.net` | Permitir apenas os endereços fixos necessários |
| tel             | `tel:0120987370`          | Permitir apenas os números fixos necessários   |
| Outras externas | URL arbitrária            | Em princípio, não transformar em link          |

Um exemplo de implementação seria este.

```js
function isSafeMarkdownHref(rawHref) {
  const href = String(rawHref ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href === "mailto:info@acecore.net" || href === "tel:0120987370") {
    return true;
  }

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;
      const url = new URL(href, window.location.origin);
      return (
        url.origin === window.location.origin && !url.username && !url.password
      );
    }

    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        window.location.origin,
        "https://acecore.net",
        "https://lin.ee",
      ].includes(url.origin)
    );
  } catch {
    return false;
  }
}
```

Essa função deve variar de site para site. Um site de recrutamento pode permitir plataformas de emprego; um e-commerce, serviços de pagamento ou de rastreamento de entregas; e um SaaS, a documentação ou a página de status.

## Links não permitidos devem voltar a ser texto

Também é preciso decidir o que fazer com links que falham na verificação de segurança.

Para um chat de atendimento, é mais prático manter como texto original o Markdown que não puder ser convertido em link, em vez de removê-lo por completo. Assim, o usuário preserva o contexto e os desenvolvedores podem verificar “o que a IA produziu”.

Ou seja, além de “criar links seguros”, o analisador também é responsável por “exibir como texto comum aquilo que não puder ser criado com segurança”.

## Prepare os casos de teste desde o início

Com esse tipo de renderizador, olhar apenas os casos válidos faz com que algumas falhas passem despercebidas.

Verifique, no mínimo, os seguintes casos.

| Entrada                             | Resultado esperado                           |
| ----------------------------------- | -------------------------------------------- |
| `[サービス一覧](/services/)`        | Deve gerar um link interno                   |
| `[サービス一覧]( /services/ )`      | Aplicar trim e gerar um link interno         |
| `[LINE]( https://lin.ee/example )`  | Abrir como link externo                      |
| `[危険](javascript:alert(1))`       | Não transformar em link                      |
| `[外部](https://example.com/)`      | Não transformar em link se não for permitido |
| `[壊れたリンク](/services/`         | Exibir como texto                            |
| `` `code` と [link]( /contact/ ) `` | Código e link são renderizados separadamente |

Na PR #99, confirmamos que `[サービス一覧]( /services/ )`, `[サービス一覧](/services/)` e `[LINE]( https://lin.ee/DjIrdqj )` são tratados como a mesma URL.

## A decisão de não implementar todo o Markdown

É possível limitar o Markdown usado no chat com IA.

- Parágrafos
- Listas
- Negrito
- Código em linha
- Links

Oferecer suporte a tabelas, imagens, HTML, notas de rodapé e níveis profundos de títulos faz com que as responsabilidades do renderizador cresçam rapidamente. Na interface de chat, é suficiente apresentar as informações de forma clara.

Se houver necessidade, também é possível optar por uma biblioteca Markdown consolidada. Ainda assim, é preciso decidir à parte se o HTML será permitido, como restringir as URLs e quais atributos adicionar aos links externos.

## Resumo

Renderizar links Markdown no chat com IA pode parecer uma pequena correção visual. Na prática, porém, trata-se de definir os limites de confiança nas saídas da IA.

Os pontos importantes da implementação são:

- Tratar as respostas da IA como texto, não como HTML
- Converter para o DOM, de forma simples, apenas o Markdown necessário
- Aceitar espaços em branco antes e depois da URL nos links Markdown
- Verificar a segurança do href após aplicar trim
- Usar uma lista de permissões para aceitar apenas URLs internas e externas necessárias
- Manter como texto os links que não forem permitidos
- Testar Markdown malformado e URLs perigosas

Quanto mais a IA fizer parte dos caminhos de navegação do site, mais importante será decidir como renderizar o texto das respostas. O suporte conveniente a Markdown e o controle seguro de links devem ser tratados juntos na mesma implementação.

---
title: "Projeto técnico para transferir o contexto do CTA de serviço para o formulário de contato"
description: "Este é um projeto de implementação para transferir ao formulário de contato o contexto que o usuário estava lendo na página de serviços. Organizamos a solução para que possa ser reutilizada em outros sites: mini CTAs em um site Astro, contrato de parâmetros da URL, seleção inicial do tipo de contato, preenchimento prévio do assunto, URLs multilíngues, mensuração no GA e verificação do HTML gerado."
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Tecnologia", "Sites", "Serviços", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Pontos principais deste artigo
  text: Um CTA na página de serviços é um ponto de entrada fraco se apenas direcionar o usuário ao formulário. Ao passar pela URL o contexto do serviço que ele estava lendo e inicializar no formulário o tipo de contato e o assunto, é possível reduzir ao mesmo tempo a indecisão durante o preenchimento e o trabalho de classificação do lado que recebe as consultas.
processFigure:
  title: Fluxo de transferência do contexto do CTA de serviço para o formulário
  steps:
    - title: Serviço
      description: Adicionar uma chave de serviço ao CTA de cada seção de serviço.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Passar os dados por meio de um contrato de URL, como /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Formulário
      description: Inicializar no formulário o tipo de contato e o assunto correspondentes.
      icon: i-lucide-file-input
      accent: emerald
    - title: Operações
      description: A equipe que recebe as consultas consegue identificar o contexto do serviço apenas pelo tipo de contato.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Diferenças ao conectar o CTA ao formulário
  before:
    label: Ao apenas direcionar para o formulário
    items:
      - O usuário seleciona novamente no formulário o nome do mesmo serviço
      - O assunto fica em branco e é difícil entender qual é a consulta
      - A equipe que recebe as consultas tem dificuldade para identificar o serviço sem ler o corpo da mensagem
      - Fica impreciso medir a eficácia dos CTAs por serviço
  after:
    label: Ao transferir o contexto
    items:
      - É possível selecionar inicialmente o tipo de contato com base na chave de serviço do CTA
      - Inserir o nome do serviço no assunto ajuda a organizar o conteúdo da consulta
      - A equipe que recebe as consultas pode classificar o contato apenas pelo tipo de contato
      - É mais fácil verificar os resultados por CTA usando o label do GA e os parâmetros da URL
checklist:
  title: Checklist de projeto para a implementação
  items:
    - text: Usar apenas chaves de serviço curtas e estáveis nos parâmetros da URL
    - text: Definir o valor recebido pelo formulário como um valor operacionalmente estável, não como o texto exibido ao usuário
    - text: Fazer chaves de serviço desconhecidas retornarem à categoria de serviços em geral
    - text: Preencher o assunto inicialmente apenas quando estiver em branco
    - text: Antes de adicionar campos ocultos, confirmar se o tipo de contato existente permite classificar as consultas
    - text: Gerar no servidor uma URL de contato para cada locale
    - text: Adicionar ao CTA um label e um location do GA para possibilitar a mensuração dos resultados
    - text: Verificar após o build a quantidade de CTAs e opções no HTML gerado, além da presença ou ausência de campos ocultos
linkCards:
  - href: /services/
    title: Serviços
    description: Página de entrada do fluxo com CTAs específicos para cada serviço.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contato
    description: Formulário que recebe parâmetros da URL e inicializa o tipo e o assunto.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Projeto técnico de um chat com IA para consultas
    description: Artigo relacionado sobre um fluxo que organiza o destino de uma consulta por meio de uma conversa.
    icon: i-lucide-sparkles
faq:
  title: Perguntas frequentes
  items:
    - question: Por que não enviar o serviço sobre o qual o usuário quer conversar em um campo oculto?
      answer: "Na época, em 6/2026, a classificação era feita apenas com os tipos de contato existentes, sem adicionar campos ocultos. Atualmente, o formulário do Acecore Systems salva service, from e entry em campos ocultos de integração, separadamente do valor de classificação."
    - question: É seguro se os parâmetros da URL forem adulterados?
      answer: Chaves de serviço desconhecidas retornam à categoria de serviços em geral. Como o valor enviado é selecionado entre as opções do formulário, a URL não é usada diretamente como valor recebido.
    - question: Como isso funciona em um site multilíngue?
      answer: O destino dos links dos CTAs é gerado para cada locale, e os rótulos exibidos no formulário são traduzidos. Por outro lado, usar valores recebidos com nomes de classificação estáveis em japonês ajuda a manter as operações da equipe que recebe as consultas consistentes.
---

> **Adicionado em 9/2026:** Os exemplos de `ServiceSectionActions` e `service=web` abaixo registram a estrutura usada no site oficial da Acecore em 6/2026. Atualmente, no Acecore Systems, os [CTAs dos detalhes dos serviços](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro) incluem `category`, `service`, `from` e `entry`; o [formulário de contato](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro) valida uma chave de serviço curta e inicializa o tipo e o assunto. Hoje também são usados campos ocultos para mensuração e integração; portanto, não copie como especificação atual o projeto abaixo de «não usar campos ocultos». O princípio de não confiar nos valores da URL e associá-los às opções do formulário continua válido.

Quando alguém que leu a página de serviços pensa «Quero conversar sobre este conteúdo», simplesmente direcionar essa pessoa ao formulário de contato faz com que parte do contexto se perca.

O usuário precisa selecionar novamente o tipo de serviço no formulário e escrever o assunto por conta própria. A equipe que recebe o contato também tem dificuldade para saber, sem ler a mensagem, se a consulta é sobre desenvolvimento web, operação de servidores ou Aceserver.

No site da Acecore, aprimoramos esse fluxo por meio do [PR para transferir o serviço em questão do CTA de serviço para o formulário de contato](https://github.com/acecore-systems/acecore-net/pull/100). Neste artigo, organizamos a solução não apenas como um registro de implementação em Astro, mas também como um projeto de fluxo que pode ser usado em outros sites.

## Validar a inicialização do formulário a partir de um CTA

Teste uma chave de serviço válida, uma chave desconhecida e a ação de voltar quando o assunto já estiver preenchido. Confirme se o tipo é associado a uma opção permitida e se o assunto não é sobrescrito; use o mesmo contrato de valores também nas URLs de cada locale. Não inclua dados pessoais nem texto livre na URL; transmita o contexto da consulta apenas com identificadores curtos.

[MDN URLSearchParams: especificação para ler parâmetros da URL](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## O objetivo não é reduzir o preenchimento do formulário

O objetivo desta implementação não é apenas facilitar o preenchimento automático dos campos do formulário.

O ponto principal é transferir corretamente para o formulário de contato e para a operação de recebimento o contexto que surgiu na página de serviços.

| Perspectiva       | O que queremos melhorar                                                        |
| ----------------- | ------------------------------------------------------------------------------ |
| Usuário           | Reduzir o trabalho de selecionar novamente o serviço que estava lendo          |
| Formulário        | Inicializar o tipo de contato e o assunto de acordo com o conteúdo da consulta |
| Equipe que recebe | Facilitar a classificação do serviço em questão apenas pelo tipo de contato    |
| Mensuração        | Facilitar a identificação do CTA de serviço que iniciou a consulta             |
| Fluxo multilíngue | Direcionar para uma URL de contato adequada ao locale                          |

Visualmente, trata-se de um pequeno mini CTA, mas o projeto abrange o CTA, a URL, o formulário, as traduções, a mensuração e as operações de recebimento.

## Extrair as responsabilidades para um componente de CTA

Adicione ao final de cada seção de serviço um CTA com o texto «Conversar sobre este serviço».

O primeiro problema a evitar é escrever repetidamente a geração do mesmo link e os atributos do GA em cada seção da página de serviços. Se houver 7 serviços, o mesmo padrão aparecerá 7 vezes. Isso facilita deixar algo passar quando for preciso alterar o texto ou as especificações da URL.

Por isso, criamos `ServiceSectionActions` para reunir os CTAs de contato.

```astro
---
import Icon from "./Icon.astro";
import { t, getLocalizedUrl, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  gaLabel: string;
  gaLocation: string;
  serviceKey: string;
}

const { locale, gaLabel, gaLocation, serviceKey } = Astro.props;
const u = (path: string) => getLocalizedUrl(path, locale);
const contactUrl = `${u("/contact/")}?category=service&service=${encodeURIComponent(serviceKey)}#contact-form`;
---

<a
  href={contactUrl}
  class="ac-btn-outline gap-2 text-sm sm:w-auto"
  data-ga-event="cta_click"
  data-ga-label={gaLabel}
  data-ga-location={gaLocation}
  data-ga-destination={contactUrl}
>
  <Icon name="message-circle" class="text-sm" />
  {t(locale, "pages.services.miniCta")}
</a>
```

Este componente tem 3 responsabilidades.

- Gerar uma URL de contato adequada ao locale
- Incluir a chave de serviço nos parâmetros da URL
- Adicionar um label e um location para a mensuração no GA

O CTA é um ponto de ação do usuário e, por isso, também é um ponto de mensuração, além de um elemento da interface. Mantemos `data-ga-label` e `data-ga-location` para identificar posteriormente de qual serviço começou cada consulta.

## Usar os parâmetros da URL como contrato com o formulário

Os valores passados do CTA para o formulário de contato são enviados por parâmetros da URL.

```txt
/contact/?category=service&service=web#contact-form
```

O importante aqui é não usar na URL um «texto exibido».

Textos exibidos como `Webサイト制作・運用について` são afetados por traduções, variações de grafia e futuras mudanças de nome. Na URL, inclua apenas uma chave de serviço curta, como `web` ou `server`.

| Parâmetro  | Papel                                                                  |
| ---------- | ---------------------------------------------------------------------- |
| `category` | Indica a entrada que deve ser tratada como uma consulta sobre serviços |
| `service`  | Chave estável que identifica o serviço em questão                      |
| hash       | Usado para rolar até a posição do formulário                           |

Como o usuário pode editar os parâmetros da URL, o formulário não deve usar o valor da URL diretamente como valor enviado. Em vez disso, deve mapeá-lo para uma opção existente.

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">Fluxo de transferência do recebimento de consultas para os registros de gestão</strong>
    <span>Mostra as etapas de implementação do fluxo. O contato com clientes reais e a conclusão do atendimento precisam ser verificados separadamente.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>Ler o contexto do CTA</strong>
      <span>Associar uma chave de serviço estável à URL de exibição multilíngue e à lista de opções permitidas no formulário.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>Validar a entrada e as permissões</strong>
      <span>Preencher o assunto inicialmente apenas se estiver em branco e verificar também na API a identidade do usuário e as permissões de operação.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>Transferir para os registros de recebimento</strong>
      <span>Refletir o conteúdo recebido no histórico do CRM e nas tarefas subsequentes, registrando a conclusão efetiva do atendimento pelo responsável como um estado separado.</span>
    </li>
  </ol>
</figure>

## Manter uma tabela de classificação no formulário

No formulário de contato, mantenha as classificações por serviço em um array.

```ts
const serviceCategoryOptions = [
  {
    key: "server",
    value: "サーバー構築・運用について",
    label: t(locale, "pages.contact.formCategoryServiceServer"),
    subject: t(locale, "pages.services.server.title"),
  },
  {
    key: "web",
    value: "Webサイト制作・運用について",
    label: t(locale, "pages.contact.formCategoryServiceWeb"),
    subject: t(locale, "pages.services.web.title"),
  },
];
```

`key`, `value`, `label` e `subject` têm funções diferentes.

| Campo     | Papel                                                                               |
| --------- | ----------------------------------------------------------------------------------- |
| `key`     | Identificador estável usado para localizar o serviço a partir dos parâmetros da URL |
| `value`   | Tipo de contato enviado à equipe que recebe as consultas                            |
| `label`   | Opção traduzida exibida na tela                                                     |
| `subject` | Nome do serviço usado para preencher inicialmente o assunto                         |

Em um site multilíngue, traduza `label` de acordo com o locale. Por outro lado, como `value` é usado pela equipe que recebe as consultas para fazer a classificação, usamos um valor estável em japonês.

Isso depende do produto. Se o CRM ou o formulário externo oferecer suporte a classificações multilíngues, os valores também podem variar por locale. Quando o objetivo é simplificar as operações da equipe que recebe as consultas, é mais fácil trabalhar separando o rótulo exibido do valor recebido.

## Adicionar atributos data às opções

O campo select do formulário exibe opções específicas para cada serviço.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {serviceCategoryOptions.map((option) => (
    <option
      value={option.value}
      data-service-key={option.key}
      data-service-subject={option.subject}
    >
      {option.label}
    </option>
  ))}
</select>
```

`data-service-key` é usado para comparar com `service` da URL. `data-service-subject` é usado para criar o assunto.

O importante aqui é não inserir diretamente o valor da URL em `category.value`. Selecionar sempre entre as opções do campo select evita que uma chave de serviço desconhecida ou um valor inválido seja incluído no valor recebido.

## Preencher previamente no lado do cliente

A inicialização do formulário é feita por um pequeno script executado depois que a página é carregada.

```js
function initContactServicePrefill() {
  const form = document.getElementById("contact-form");
  if (!form || form.dataset.servicePrefillInitialized === "true") return;

  form.dataset.servicePrefillInitialized = "true";

  const url = new URL(window.location.href);
  const requestedCategory = url.searchParams.get("category");
  const requestedService = url.searchParams.get("service") || "";
  const category = document.getElementById("category");
  const subject = document.getElementById("subject");

  if (
    requestedCategory === "service" &&
    category instanceof HTMLSelectElement
  ) {
    const serviceOption = Array.from(category.options).find((option) => {
      return option.dataset.serviceKey === requestedService;
    });

    category.value = serviceOption?.value || "サービス全般について";
    category.dispatchEvent(new Event("input", { bubbles: true }));
    category.dispatchEvent(new Event("change", { bubbles: true }));

    if (
      serviceOption &&
      subject instanceof HTMLInputElement &&
      !subject.value.trim()
    ) {
      const template = form.dataset.serviceSubjectTemplate || "{service}";
      const serviceName =
        serviceOption.dataset.serviceSubject ||
        serviceOption.textContent?.trim() ||
        "";
      subject.value = template.replace("{service}", serviceName);
    }
  }
}
```

Os principais pontos da implementação são estes 4.

- Verificar `data-service-prefill-initialized` para evitar uma inicialização duplicada
- Executar o processamento apenas quando `category=service`
- Fazer chaves de serviço desconhecidas retornarem à opção «Serviços em geral»
- Preencher o assunto inicialmente apenas quando estiver em branco

O último ponto, «apenas quando estiver em branco», é importante. Se o usuário já tiver um assunto preenchido ao voltar à página ou por meio do preenchimento automático do navegador, sobrescrevê-lo sem permissão prejudica a experiência.

Se houver View Transitions do Astro ou navegação no cliente, inicialize não apenas no carregamento normal, mas também em `astro:page-load`.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Ir até o formulário com hash

Adicionamos `#contact-form` à URL do CTA.

```txt
/contact/?category=service&service=web#contact-form
```

A página de contato também tem FAQ, LINE, textos explicativos e outros meios de contato além do formulário. Por isso, é mais natural que usuários vindos de um CTA de serviço sejam direcionados diretamente à posição do formulário.

No entanto, ao inicializar o formulário, é preciso prestar um pouco de atenção ao momento da rolagem. Como queremos rolar depois que o elemento for renderizado, usamos `requestAnimationFrame`.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Ir até a posição do formulário é um comportamento pequeno, mas, se a posição exibida não corresponder à intenção do CTA, o usuário pode ficar em dúvida. No projeto do fluxo, consideramos em conjunto a URL, a seleção inicial e a posição de rolagem.

## Decidir não adicionar campos ocultos

Desta vez, não adicionamos um campo oculto para `相談対象サービス`.

O motivo foi permitir identificar o serviço em questão apenas pelo tipo de contato.

Adicionar campos ao formulário também aumenta o número de pontos a verificar.

- Se o campo deve aparecer no e-mail de notificação
- Se é preciso adicionar uma coluna à tela de administração ou à planilha
- Se há impacto nos modelos de resposta automática existentes
- Se o campo será usado na integração com CRM ou por webhook
- Como separar o nome exibido traduzido do valor recebido

Se as informações necessárias puderem ser representadas por campos existentes, a operação tende a ser mais estável sem adicionar campos. Desta vez, dividimos `お問い合わせ種別` entre «serviços em geral» e os tipos específicos de cada serviço, permitindo que a equipe que recebe as consultas os identifique.

Naturalmente, também pode ser apropriado adicionar campos ocultos se houver requisitos como selecionar vários serviços ao mesmo tempo, salvar um ID de campanha publicitária ou usar um campo separado no CRM.

## Como lidar com sites multilíngues

Ao criar esse fluxo em um site multilíngue, separar 3 tipos de valores evita confusão.

| Tipo           | Exemplo                       | Depende do locale     |
| -------------- | ----------------------------- | --------------------- |
| Chave da URL   | `web`, `server`, `aceserver`  | Não                   |
| Rótulo exibido | `About Website Design` etc.   | Sim                   |
| Valor recebido | `Webサイト制作・運用について` | Depende das operações |

As chaves da URL são mais estáveis quando não são traduzidas. Isso facilita compartilhar links, analisar os dados e fazer a correspondência no formulário.

Os rótulos exibidos devem sempre ser traduzidos, pois são os textos que o usuário vê no formulário.

Os valores recebidos devem seguir as operações. Neste caso, usamos valores estáveis em japonês. Separar a exibição multilíngue das operações internas após o recebimento facilita o uso do formulário.

Também apresentamos o próprio fluxo de tradução em [Como gerenciar um blog multilíngue com o Sveltia CMS](/blog/copilot-translation-pipeline/).

## Verificar o HTML gerado

Para esse tipo de implementação, não basta verificar apenas o componente. É preciso confirmar no HTML após o build se os links e as opções foram realmente gerados.

Os pontos verificados foram os seguintes.

- Há 7 CTAs específicos para cada serviço em `/services/`
- Cada CTA tem `?category=service&service=...#contact-form`
- Há 7 opções com `data-service-key` em `/contact/`
- Estão presentes a opção «Serviços em geral» e os tipos específicos de cada serviço
- Não há campos ocultos para `相談対象サービス`

Por exemplo, é possível verificar isso no HTML gerado com `rg`.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

A última verificação serve para confirmar que aquilo que não deveria aparecer realmente não aparece. Ao alterar um formulário, devemos verificar não apenas o que foi adicionado, mas também o que decidimos não adicionar.

## Dividir as funções com o chat de IA

Este fluxo combina bem com o [projeto técnico de um chat com IA para consultas](/blog/astro-ai-contact-chat/), mas as funções são diferentes.

| Fluxo          | O que faz melhor                                                         |
| -------------- | ------------------------------------------------------------------------ |
| Chat de IA     | Organizar em uma conversa qual serviço é o mais adequado para a consulta |
| CTA de serviço | Transferir para o formulário o contexto do serviço que está sendo lido   |
| Formulário     | Receber o conteúdo formal da consulta e manter um registro               |

O chat de IA é um fluxo adequado para quando o usuário ainda está em dúvida. Por outro lado, para alguém que terminou de ler a página de serviços e decidiu «Conversar sobre este serviço», é mais natural direcionar diretamente ao formulário, sem inserir uma conversa no caminho.

Ao adicionar fluxos, é importante que eles não desempenhem todos a mesma função. Use conversas, CTAs e formulários de acordo com a situação do usuário.

## Resumo

A implementação que transfere o contexto da página de serviços para o formulário de contato pode ter um efeito maior do que parece.

Os pontos importantes deste projeto foram:

- Transformar o CTA em componente e reunir a geração da URL e os atributos de mensuração
- Usar na URL uma chave de serviço estável, não o texto exibido
- Mapear no formulário a chave de serviço para uma opção
- Separar o valor recebido, o rótulo exibido e o nome do serviço usado no assunto
- Fazer chaves de serviço desconhecidas retornarem à categoria de serviços em geral
- Preencher o assunto inicialmente apenas quando estiver em branco
- Permitir a classificação pelo tipo de contato sem adicionar campos ocultos
- Verificar no HTML gerado após o build a quantidade de links e opções e a ausência de campos desnecessários

Melhorar um formulário de contato não significa apenas reduzir o número de campos. Transferir até a equipe que recebe as consultas o contexto que o usuário estava lendo, sem perdê-lo, facilita o atendimento de fato.

## Atualização em 6/10/2026: Do recebimento do contato aos registros de gestão

Em uma atualização de integração anonimizada, tratamos o recebimento de uma consulta, o registro no histórico e nas tarefas do CRM e a conclusão do atendimento pelo responsável como estados separados. Validamos a entrada da URL e a rota de contato, associando o valor da rota a um enum estável. Saber a URL da tela de administração, por si só, não concede permissão para alterar históricos ou tarefas.

A API também verifica a identidade do usuário e as permissões de operação, e não mistura dados de clientes em pesquisas públicas nem em respostas de IA públicas. Mesmo que a implementação do recebimento e dos registros esteja concluída, isso não significa que tenha sido feita uma validação completa, do contato com clientes reais até a conclusão da atividade.

Diferenciamos dados preenchidos previamente de dados inseridos pelo próprio usuário. Para recebimentos que exigem retorno, o meio de contato preferido é uma opção fixa obrigatória, encaminhada para as tarefas subsequentes. Alinhamos os requisitos obrigatórios da interface e da API, bem como as permissões de visualização e inclusão dos responsáveis, e verificamos o schema e as constraints após as alterações no banco de dados. Também distinguimos a validação necessária em produção da cópia de todos os bancos de dados de clientes reais para o ambiente de desenvolvimento.

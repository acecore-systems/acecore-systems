---
title: "Projeto técnico para levar o contexto de um CTA de serviço ao formulário de contato"
description: "Projeto de implementação para levar ao formulário o contexto lido em uma página de serviço. Abrange mini CTAs em Astro, contrato de parâmetros de URL, seleção inicial da categoria, prefill do assunto, URLs multilíngues, medição com GA e verificação do HTML gerado."
date: 2026-06-07T13:00
author: gui
tags: ["Tecnologia", "Site", "Serviços", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Ponto principal deste artigo
  text: Um CTA de serviço é uma jornada fraca quando apenas envia o usuário ao formulário. Passar pela URL o contexto do serviço que ele estava lendo e inicializar no formulário a categoria e o assunto reduz ao mesmo tempo a dúvida no preenchimento e o trabalho de triagem de quem recebe.
processFigure:
  title: Fluxo para passar o contexto do CTA de serviço ao formulário
  steps:
    - title: Service
      description: Atribuir um service key ao CTA de cada seção de serviço.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Passar pelo contrato de URL, como /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: Inicializar no formulário a categoria e o assunto correspondentes.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: A equipe receptora identifica o contexto do serviço apenas pela categoria.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Diferença ao conectar o CTA ao formulário
  before:
    label: Apenas enviar ao formulário
    items:
      - O usuário precisa selecionar novamente o mesmo serviço
      - O assunto fica vazio e a natureza da consulta não fica clara
      - A equipe receptora precisa ler a mensagem para identificar o serviço
      - A medição de cada CTA de serviço fica ambígua
  after:
    label: Levar o contexto adiante
    items:
      - A categoria pode ser pré-selecionada pelo service key do CTA
      - O nome do serviço pode preencher o assunto e organizar a consulta
      - A equipe receptora classifica a consulta olhando a categoria
      - O GA label e os parâmetros de URL facilitam a análise por CTA
checklist:
  title: Verificação de projeto para adoção
  items:
    - text: Usar nos parâmetros de URL apenas service keys curtos e estáveis
    - text: Usar valores operacionalmente estáveis no envio, não textos exibidos ao usuário
    - text: Fazer fallback para consultas gerais diante de um service key desconhecido
    - text: Preencher o assunto somente quando estiver vazio
    - text: Antes de adicionar campos hidden, confirmar se a categoria existente já permite a classificação
    - text: Gerar no servidor a URL de contato de cada locale
    - text: Adicionar GA label e location ao CTA para medir seu desempenho
    - text: Após o build, verificar no HTML as quantidades de CTA e option e a presença ou ausência de campos hidden
linkCards:
  - href: /services/
    title: Serviços
    description: Entrada da jornada que contém CTAs específicos por serviço.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contato
    description: Formulário que recebe os parâmetros de URL e inicializa categoria e assunto.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Projeto técnico do chat de atendimento com IA
    description: Artigo relacionado sobre uma jornada conversacional que organiza o destino da consulta.
    icon: i-lucide-sparkles
faq:
  title: Perguntas frequentes
  items:
    - question: Por que não enviar o serviço-alvo em um campo hidden?
      answer: Para não aumentar os campos que a equipe receptora precisa verificar e permitir a classificação somente pela categoria existente. Cada campo adicional também aumenta as verificações operacionais e das mensagens de notificação.
    - question: É seguro se os parâmetros da URL forem alterados?
      answer: Um service key desconhecido faz fallback para consultas gerais. O valor enviado é escolhido entre os option do formulário, portanto o valor da URL não é usado diretamente.
    - question: Como tratar isso em um site multilíngue?
      answer: Gere o destino do CTA para cada locale e traduza os rótulos exibidos no formulário. Manter os valores enviados em classificações japonesas estáveis ajuda a evitar variação na operação receptora.
---

Quando alguém que lê uma página de serviço pensa “quero consultar sobre isto”, apenas enviar essa pessoa ao formulário faz perder parte do contexto.

O usuário precisa escolher novamente o tipo de serviço e escrever o assunto. A equipe receptora também não consegue saber facilmente se a consulta é sobre produção web, operação de servidores ou Aceserver antes de ler a mensagem.

No site da Acecore, melhoramos essa jornada no [PR que leva o alvo do CTA de serviço ao formulário](https://github.com/acecore-systems/acecore-net/pull/100). Este artigo organiza a solução não só como registro de implementação em Astro, mas como projeto de jornada reutilizável em outros sites.

## O objetivo não é apenas reduzir o preenchimento

A finalidade não é simplesmente preencher campos automaticamente para o formulário parecer mais fácil.

O essencial é levar corretamente o contexto criado na página de serviço ao formulário e à operação receptora.

| Perspectiva         | O que deve melhorar                                       |
| ------------------- | --------------------------------------------------------- |
| Usuário             | Evitar que selecione novamente o serviço que estava lendo |
| Formulário          | Inicializar categoria e assunto de acordo com a consulta  |
| Equipe receptora    | Facilitar a classificação apenas pela categoria           |
| Medição             | Rastrear de qual CTA de serviço a consulta começou        |
| Jornada multilíngue | Enviar para a URL de contato correspondente ao locale     |

Embora pareça um pequeno mini CTA, o projeto abrange CTA, URL, formulário, tradução, medição e operação receptora.

## Separar responsabilidades em um componente de CTA

Colocamos um CTA “Consultar sobre este serviço” ao final de cada seção.

É melhor evitar escrever diretamente em cada seção a mesma geração de link e os mesmos atributos de GA. Com sete serviços, a lógica se repete sete vezes e alguma cópia pode ficar desatualizada quando a redação ou a URL mudar.

Por isso criamos `ServiceSectionActions` para centralizar o CTA.

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

O componente tem três responsabilidades:

- Gerar uma URL de contato de acordo com o locale
- Colocar o service key em um parâmetro de URL
- Manter label e location usados na medição do GA

O CTA é um ponto de ação e também um ponto de medição. Mantemos `data-ga-label` e `data-ga-location` para ver depois de qual serviço a consulta começou.

## Transformar os parâmetros de URL no contrato com o formulário

Os valores são passados por parâmetros de URL.

```txt
/contact/?category=service&service=web#contact-form
```

O ponto importante é não usar o texto exibido na URL.

Um rótulo como `Webサイト制作・運用について` sofre efeitos de tradução, variações de redação e futuras mudanças de nome. Na URL, coloque apenas um service key curto como `web` ou `server`.

| Parâmetro  | Papel                                                |
| ---------- | ---------------------------------------------------- |
| `category` | Indica a entrada para tratar uma consulta de serviço |
| `service`  | Key estável que representa o serviço-alvo            |
| hash       | Usado para rolar até o formulário                    |

O usuário pode editar os parâmetros. Por isso o formulário não usa o valor da URL diretamente no envio; ele o mapeia para um option existente.

## Manter uma tabela de classificação no formulário

O formulário mantém as categorias por serviço em um array.

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

`key`, `value`, `label` e `subject` têm papéis diferentes.

| Campo     | Papel                                                        |
| --------- | ------------------------------------------------------------ |
| `key`     | Identificador estável para procurar pelo parâmetro da URL    |
| `value`   | Categoria recebida pela equipe quando o formulário é enviado |
| `label`   | Option traduzido mostrado na tela                            |
| `subject` | Nome do serviço usado para inicializar o assunto             |

Em um site multilíngue, `label` é traduzido para o locale. Já `value` é usado na classificação da equipe receptora e permanece como valor japonês estável.

A decisão varia conforme o produto. Se o CRM ou formulário externo aceitar classificações multilíngues, value também pode variar por locale. Para simplificar a operação receptora, separar rótulo exibido e valor enviado é mais fácil de administrar.

## Adicionar atributos data aos option

O select gera um option para cada serviço.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {
    serviceCategoryOptions.map((option) => (
      <option
        value={option.value}
        data-service-key={option.key}
        data-service-subject={option.subject}
      >
        {option.label}
      </option>
    ))
  }
</select>
```

`data-service-key` é comparado com `service` na URL. `data-service-subject` é usado para criar o assunto.

Também aqui não colocamos o valor da URL diretamente em `category.value`. Escolher sempre um option do select evita que um service key desconhecido ou um valor inválido entre nos dados enviados.

## Fazer o prefill no cliente

Um pequeno script inicializa o formulário após o carregamento.

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

Há quatro pontos:

- Verificar `data-service-prefill-initialized` para evitar inicialização dupla
- Processar somente quando `category=service`
- Fazer fallback para `サービス全般について` diante de um service key desconhecido
- Preencher o assunto somente quando estiver vazio

O último ponto é importante. Se a navegação de retorno ou o preenchimento do navegador conservar o assunto, sobrescrevê-lo piora a experiência.

Com Astro View Transitions ou navegação no cliente, também inicializamos em `astro:page-load`.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Ir ao formulário usando o hash

A URL do CTA inclui `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Como a página pode ter FAQ, LINE, explicações e outros meios de contato, é natural levar diretamente ao formulário quem veio de um CTA de serviço.

Quando o formulário também é inicializado, é preciso cuidar do momento da rolagem. Usamos `requestAnimationFrame` para rolar após o elemento ser renderizado.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

É um comportamento pequeno, mas o usuário se perde quando a intenção do CTA e a posição visível não coincidem. URL, seleção inicial e posição de rolagem são tratadas em conjunto.

## Decidir não aumentar campos hidden

Não adicionamos um campo hidden `相談対象サービス`.

Queríamos identificar o serviço apenas pela categoria.

Adicionar campos também adiciona verificações:

- Se aparece no e-mail de notificação
- Se requer uma coluna no painel ou planilha
- Se afeta modelos de resposta automática
- Se é tratado por CRM ou Webhook
- Como separar nomes multilíngues e valores recebidos

Se os campos existentes expressam a informação, não adicionar outro estabiliza a operação. Dividimos `お問い合わせ種別` entre consultas gerais e categorias específicas.

Um hidden pode ser adequado quando é necessário selecionar vários serviços, guardar um ID de campanha ou usar um campo separado no CRM.

## Abordagem para sites multilíngues

Separar três valores evita confusão.

| Tipo           | Exemplo                       | Depende do locale   |
| -------------- | ----------------------------- | ------------------- |
| URL key        | `web`, `server`, `aceserver`  | Não                 |
| Rótulo exibido | `About Website Design`, etc.  | Sim                 |
| Valor enviado  | `Webサイト制作・運用について` | Depende da operação |

É mais estável não traduzir a URL key, usada ao compartilhar, medir e comparar no formulário.

O rótulo exibido sempre é traduzido porque é o texto visto pelo usuário.

O valor enviado segue a operação. Aqui usamos valores japoneses estáveis. Separar a exibição multilíngue da operação interna posterior facilita o gerenciamento.

O fluxo de tradução também é descrito em [Como operar um blog multilíngue com Sveltia CMS](/blog/copilot-translation-pipeline/).

## Verificar o HTML gerado

Não basta olhar o componente. Após o build, confirme que os links e option foram gerados.

Verificamos:

- Sete CTAs específicos em `/services/`
- Cada CTA contém `?category=service&service=...#contact-form`
- Sete option com `data-service-key` em `/contact/`
- `サービス全般について` e categorias específicas aparecem
- Nenhum hidden `相談対象サービス` aparece

Por exemplo, use `rg`.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

A última verificação confirma a ausência do que decidimos não adicionar. Mudanças em formulários devem conferir tanto o que foi incluído quanto o que foi deliberadamente omitido.

## Divisão de papéis com o chat de IA

Esta jornada combina com o [projeto técnico do chat de atendimento com IA](/blog/astro-ai-contact-chat/), mas os papéis são diferentes.

| Jornada        | No que é boa                                  |
| -------------- | --------------------------------------------- |
| Chat de IA     | Organiza por conversa qual serviço consultar  |
| CTA de serviço | Leva ao formulário o contexto do serviço lido |
| Formulário     | Recebe a consulta formal e mantém o registro  |

O chat é forte quando o usuário ainda está indeciso. Para quem já terminou a página e decidiu consultar aquele serviço, ir diretamente ao formulário é mais natural.

Ao adicionar jornadas, não dê a todas o mesmo papel. Use conversa, CTA e formulário conforme o estado do usuário.

## Resumo

Levar o contexto da página ao formulário tem mais efeito do que a pequena mudança visual sugere.

Os pontos importantes foram:

- Transformar o CTA em componente e centralizar URL e atributos de medição
- Usar service key estável na URL em vez do texto exibido
- Mapear service key para um option no formulário
- Separar valor enviado, rótulo e nome usado no assunto
- Fazer fallback para consultas gerais diante de service key desconhecido
- Preencher o assunto apenas quando vazio
- Classificar pela categoria sem adicionar hidden
- Verificar após o build quantidades de links e option e ausência de campos desnecessários

Melhorar um formulário não é apenas reduzir campos. Levar o contexto que o usuário estava lendo até a equipe receptora facilita o atendimento real.

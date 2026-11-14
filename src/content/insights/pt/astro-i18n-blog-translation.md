---
title: "Como oferecer um blog Astro em 9 idiomas — registro da implementação de tradução, URLs e hreflang"
description: "Registro da implementação de um blog Astro em 9 idiomas. Explica o desenho de URLs com prefixDefaultLocale, a organização dos arquivos de tradução, as condições para não gerar URLs de artigos, sitemap e hreflang em localidades sem tradução, a alternância de exibição com componentes View e os cuidados com imagens OG, CMS e RSS. Distingue a configuração de julho de 2026 (mês 7) das diferenças atuais e apresenta elementos para avaliar uma configuração semelhante."
date: 2026-03-25T10:00
lastUpdated: "2026-10-25T06:10:55Z"
author: gui
tags: ["Tecnologia", "Astro", "i18n", "Sites"]
image: "/images/insights/covers/astro-i18n-blog-translation-cover-v2.webp"
processFigure:
  title: Fluxo de internacionalização
  steps:
    - title: Criação da infraestrutura de i18n
      description: Configuração do roteamento i18n integrado do Astro e dos utilitários de tradução.
      icon: i-lucide-globe
    - title: Tradução dos textos da interface
      description: Tradução dos textos exibidos no cabeçalho, no rodapé e em todos os componentes.
      icon: i-lucide-languages
    - title: Tradução dos artigos do blog
      description: Na implementação inicial, foram gerados 21 artigos × 8 idiomas = 168 arquivos de tradução.
      icon: i-lucide-file-text
    - title: Verificação do CMS e do build
      description: Adaptação do Pages CMS a vários idiomas e verificação do build de todas as páginas.
      icon: i-lucide-check-circle
compareTable:
  title: Comparação antes e depois da internacionalização
  before:
    label: Apenas japonês
    items:
      - Apenas 1 idioma, japonês
      - 23 artigos no blog
      - 523 páginas geradas (após a tradução da interface)
      - 1 coleção de blog no Pages CMS
      - Tags e dados de autores apenas em japonês
      - 1 feed RSS
  after:
    label: Suporte a 9 idiomas (na implementação inicial)
    items:
      - Japonês + 8 idiomas (en, zh-cn, es, pt, fr, ko, de, ru)
      - 23 artigos do blog + 168 traduções = 191 artigos
      - 621 páginas geradas (na implementação inicial)
      - 9 coleções por idioma no Pages CMS
      - 25 tipos de tags e dados de autores traduzidos para cada idioma
      - Feeds RSS multilíngues (para 9 idiomas)
callout:
  type: info
  title: Idiomas disponíveis
  text: "Há suporte a 9 idiomas: japonês (padrão), inglês, chinês simplificado, espanhol, português, francês, coreano, alemão e russo."
statBar:
  items:
    - value: "9"
      label: Número de idiomas disponíveis
    - value: "208"
      label: Artigos traduzidos (em 29/7/2026)
    - value: "652"
      label: Páginas geradas (em 29/7/2026)
faq:
  title: Perguntas frequentes
  items:
    - question: Por que escolheram 9 idiomas?
      answer: "Para maximizar o alcance global, cobrimos as principais comunidades linguísticas do mundo. Inglês, chinês, espanhol e português abrangem grande parte da população da internet, enquanto francês, alemão, russo e coreano complementam os demais mercados principais."
    - question: Como garantem a qualidade das traduções?
      answer: "Adotamos a tradução por IA com o GitHub Copilot. Criamos uma versão em inglês como idioma intermediário e, a partir dela, traduzimos para cada idioma, reduzindo as variações de qualidade. Mantemos os valores das tags no frontmatter em japonês e não alteramos URLs, blocos de código nem caminhos de imagens. Esse era o método em 7/2026. A geração atual de traduções usa o OpenAI Batch."
    - question: O que acontece quando um artigo traduzido não existe?
      answer: "Não geramos a URL do artigo para localidades sem arquivo de tradução. A versão japonesa permanece publicada na URL original e, ao trocar de idioma, o usuário é direcionado à lista de artigos do blog da localidade selecionada."
    - question: É necessário traduzir um artigo novo?
      answer: "A tradução não é obrigatória para publicar a versão japonesa. Para adicionar uma tradução, coloque um arquivo Markdown com o mesmo nome no diretório do idioma correspondente; a URL do artigo, o sitemap e o hreflang desse idioma passarão a ser gerados."
---

Este é um registro de implementação para quem deseja tornar um blog japonês em Astro multilíngue e operar URLs de artigos traduzidos, troca de idioma, sitemap e hreflang sem comprometer seu funcionamento. Primeiro, alinhe o conteúdo, os metadados e a troca de idioma em um artigo representativo e verifique se os usuários não são direcionados a páginas sem tradução. Use [Astro: Internationalization Routing](https://docs.astro.build/en/guides/internationalization/) como referência para o desenho das URLs e amplie gradualmente as traduções da interface e dos artigos de forma separada. Os números e a configuração antiga do CMS abaixo são exemplos da época da implementação.

> **Atualização de 26/9/2026:** O Astro 7.1.3, a quantidade de artigos e a tradução com Copilot descritos no texto refletem o estado em 7/2026. A [declaração atual de dependências](https://github.com/acecore-systems/acecore-net/blob/main/package.json) usa Astro ^7.3.3 e Tailwind CSS 4.3.3; o processo de tradução está descrito no [artigo sobre a atualização para OpenAI Batch](/insights/copilot-translation-pipeline/). Consulte o código-fonte atual e as páginas publicadas antes de usar os exemplos de implementação ou os números abaixo como configuração atual.

## Registro da implementação em 7/2026

Ampliamos o site oficial da Acecore, antes disponível apenas em japonês, para 9 idiomas. Na implementação inicial, traduzimos 21 artigos do blog para 8 idiomas, totalizando 168 traduções. Em 29/7/2026, havia 29 artigos em japonês e 208 traduções, num total de 237 artigos, e o build gerava 652 páginas. Não geramos URLs de artigos para localidades às quais ainda não foi adicionada uma tradução; publicamos apenas as versões em idiomas que existem.

## Estratégia de internacionalização e desenho das URLs

A internacionalização foi realizada gradualmente nas 3 áreas abaixo.

1. **Criação da infraestrutura de i18n**: configuração do roteamento i18n integrado do Astro, utilitários de tradução e arquivos JSON de tradução para 9 idiomas
2. **Tradução dos textos da interface**: textos dos componentes do cabeçalho, rodapé, barra lateral e de todas as páginas
3. **Tradução dos artigos do blog**: na implementação inicial, 21 artigos foram traduzidos para 8 idiomas (168 arquivos gerados)

### Desenho das URLs

Adotamos `prefixDefaultLocale: false` do Astro: o japonês é servido diretamente na raiz (`/blog/...`) e os demais idiomas usam prefixos (`/en/blog/...`, `/zh-cn/blog/...` etc.).

```
# 日本語（デフォルト）
/blog/astro-performance-tuning/

# 英語
/en/blog/astro-performance-tuning/

# 簡体字中国語
/zh-cn/blog/astro-performance-tuning/
```

Como todos os idiomas usam o mesmo slug, o mapeamento de URLs na troca de idioma é simples.

A automação com Copilot para manter o processo de tradução está descrita em [Como operar um blog multilíngue com Sveltia CMS](/insights/copilot-translation-pipeline/).

## Configurar a infraestrutura de i18n do Astro

### Configuração de i18n do Astro

Configure o roteamento i18n em `astro.config.mjs`.

```javascript
// astro.config.mjs
export default defineConfig({
  i18n: {
    defaultLocale: "ja",
    locales: ["ja", "en", "zh-cn", "es", "pt", "fr", "ko", "de", "ru"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### Utilitários de tradução

Reunimos os arquivos de configuração, as funções utilitárias e os arquivos JSON de tradução em `src/i18n/`.

```typescript
// src/i18n/utils.ts
export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? translations[defaultLocale][key] ?? key;
}
```

Os arquivos de tradução de cada idioma são armazenados em formato JSON em `src/i18n/locales/`. Gerenciamos cerca de 100 chaves para navegação, rodapé, interface do blog, metadados e outros elementos.

### Padrão de componentes View

A implementação das páginas usa o **padrão de componentes View**. Centralizamos o layout e a lógica em `src/views/`, enquanto os arquivos de rota (`src/pages/`) são wrappers simples que apenas passam a localidade.

```astro
---
// src/pages/[locale]/about.astro（ルートファイル）
import AboutPage from "../../views/AboutPage.astro";
const { locale } = Astro.params;
---

<AboutPage locale={locale} />
```

Esse desenho elimina a duplicação de lógica entre a rota japonesa (`/about`) e a rota multilíngue (`/en/about`).

## Traduzir artigos do blog em diretórios por idioma

### Estrutura de diretórios

Os artigos traduzidos são armazenados em subdiretórios identificados pelo código do idioma. O carregador glob do Astro os detecta automaticamente de forma recursiva com o padrão `**/*.md`. A [Content Loader API](https://docs.astro.build/en/reference/content-loader-reference/) do Astro explica que é possível especificar um globstar como `**/*.md` em `pattern` do carregador `glob()` para carregar Markdown e outros arquivos de diretórios.

```
src/content/blog/
  astro-performance-tuning.md          # 日本語（ベース）
  website-renewal.md
  en/
    astro-performance-tuning.md        # 英語版
    website-renewal.md
  zh-cn/
    astro-performance-tuning.md        # 簡体字中国語版
    website-renewal.md
  es/
    ...
```

### Utilitários de resolução de conteúdo

Implementamos 3 funções em `src/utils/blog-i18n.ts`.

```typescript
// ベース記事かどうかを判定（IDにスラッシュが無い = ベース）
export function isBasePost(post: CollectionEntry<"blog">): boolean {
  return !post.id.includes("/");
}

// IDからロケールプレフィックスを除去してベーススラッグを取得
export function getBaseSlug(postId: string): string {
  const idx = postId.indexOf("/");
  return idx !== -1 ? postId.slice(idx + 1) : postId;
}

// ベース記事のローカライズ版を取得（無ければ原文にフォールバック）
export function localizePost(
  post: CollectionEntry<"blog">,
  allPosts: CollectionEntry<"blog">[],
  locale: Locale,
): CollectionEntry<"blog"> {
  if (locale === defaultLocale) return post;
  return allPosts.find((p) => p.id === `${locale}/${post.id}`) ?? post;
}
```

`localizePost()` retorna o original como medida de segurança, mas as rotas públicas e as listas usam `isPostAvailableInLocale()` e filtros para incluir apenas traduções existentes. Assim, URLs de artigos não são geradas para localidades sem tradução.

O ponto principal é **não alterar o esquema existente da coleção de conteúdo**. Como o carregador glob do Astro reconhece automaticamente os arquivos nos subdiretórios com IDs como `en/astro-performance-tuning`, não foi necessário alterar a configuração.

### Regras dos arquivos de tradução

Os arquivos de tradução foram gerados de acordo com as seguintes regras:

- As **chaves do frontmatter** permanecem em inglês (`title`, `description`, `date` etc.)
- Os **valores das tags** permanecem em japonês (`['技術', 'Astro']` etc.)
- **URLs, caminhos de imagens, blocos de código e HTML** não são alterados
- **Datas e autores** não são alterados
- O **corpo do texto e os valores textuais do frontmatter** (title, description, callout, FAQ etc.) são traduzidos

### Fluxo de tradução

O processo de tradução funciona da seguinte forma:

1. **Criar uma versão em inglês como idioma intermediário**: traduzir o original japonês para o inglês
2. **Traduzir do inglês para cada idioma**: usar o inglês como ponto de partida para 7 idiomas
3. **Processamento em lote**: processar de 5 a 6 artigos por lote com o GitHub Copilot

A tradução em 2 etapas, do japonês para o inglês e depois para cada idioma, reduz a variação na qualidade. Usar o inglês como idioma intermediário proporcionou uma qualidade mais consistente do que traduzir diretamente do japonês para cada idioma.

<figure class="article-diagram" data-layout="branches" data-tone="teal" data-count="3" aria-labelledby="diagram-astro-i18n-blog-translation">
  <figcaption>
    <strong id="diagram-astro-i18n-blog-translation">Confira as traduções com a versão mais recente do original japonês antes de publicar</strong>
    <span>As URLs públicas e as referências para mecanismos de busca correspondem aos arquivos de tradução existentes.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M9 12h6 M9 16h6"/></svg>
      </span>
      <strong>Atualizar o original japonês</strong>
      <span>Confira as alterações no original japonês e identifique primeiro as versões em outros idiomas afetadas e os artigos que precisam ser revisados.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z M3 12h18 M12 3a14 14 0 0 1 0 18 M12 3a14 14 0 0 0 0 18"/></svg>
      </span>
      <strong>Conferir as traduções de cada localidade</strong>
      <span>Verifique title, description e o corpo do texto e gere apenas as URLs de localidades que correspondam a arquivos de tradução existentes.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z M14 3v5h5 M8 16l8-8"/></svg>
      </span>
      <strong>Quando não há arquivo de tradução</strong>
      <span>Não crie URL, sitemap nem hreflang para essa localidade. Não publique automaticamente páginas sem tradução.</span>
    </li>
  </ol>
</figure>

## Suporte multilíngue dos componentes View

### Implementação de BlogPostPage

Na página do artigo, usamos `localizePost()` para obter o conteúdo da localidade e atribuí-lo às variáveis do template.

```astro
---
// src/views/BlogPostPage.astro
const localizedPost = localizePost(basePost, allPosts, locale);
const post = localizedPost; // テンプレートの既存参照がそのまま動く
---
```

Essa abordagem permitiu oferecer suporte a vários idiomas sem alterar nenhuma referência a `post.data.title` ou `post.body` no template.

### Adaptação das páginas de listagem

Nas páginas de listagem do blog, de tags, de autores e de arquivo, usamos `isBasePost()` para filtrar apenas os artigos originais e, na exibição, substituímos cada um pela versão traduzida com `localizePost()`.

```astro
---
const allPosts = await getCollection("blog");
const basePosts = allPosts.filter(isBasePost);
const displayPosts = basePosts.map((p) => localizePost(p, allPosts, locale));
---
```

## Problemas de YAML e imagens OG durante o build

### Escape no frontmatter YAML

Nas traduções para o francês, os apóstrofos (`l'atelier`, `qu'on` etc.) entraram em conflito com as aspas simples do YAML.

```yaml
# NG：YAML パースエラー
title: 'Le métavers est plus proche qu'on ne le pense'

# OK：ダブルクォートに変更
title: "Le métavers est plus proche qu'on ne le pense"
```

Corrigimos todos os arquivos de uma só vez com um script Node.js. Expressões em inglês como `Acecore's` apresentam o mesmo problema, portanto é preciso prestar atenção ao tipo de aspas ao gerar os arquivos de tradução.

### Filtragem das rotas de imagens OG

`/blog/og/[slug].png.ts` também capturava os slugs dos artigos traduzidos (`en/aceserver-hijacked` etc.), causando erros de parâmetros. Resolvemos o problema filtrando com `isBasePost()`.

```typescript
export const getStaticPaths: GetStaticPaths = async () => {
  const allPosts = await getCollection("blog");
  const posts = allPosts.filter(isBasePost);
  return posts.map((post) => ({
    params: { slug: post.id },
    props: { title: post.data.title },
  }));
};
```

## Suporte multilíngue no Pages CMS

Como o Pages CMS (`.pages.yml`) considera apenas os arquivos diretamente no diretório especificado por `path`, registramos os subdiretórios de tradução como coleções separadas.

```yaml
content:
  - name: blog
    label: ブログ（日本語）
    path: src/content/blog
  - name: blog-en
    label: Blog（English）
    path: src/content/blog/en
  - name: blog-zh-cn
    label: 博客（简体中文）
    path: src/content/blog/zh-cn
  # ... 各言語ごとに設定
```

Ao escrever os rótulos em cada idioma, é possível identificar de imediato no CMS a qual idioma cada coleção pertence.

## Interface de troca de idioma

Adicionamos o componente `LanguageSwitcher` ao cabeçalho e implementamos uma interface de troca de idioma para desktop e dispositivos móveis. Ao trocar de idioma, o usuário é direcionado à localidade correspondente da mesma página. Na primeira visita, o sistema detecta `navigator.language` do navegador e redireciona automaticamente.

## Exibição multilíngue de tags

Adotamos uma abordagem que mantém os slugs japoneses das tags nas URLs e **traduz apenas os nomes exibidos**. Assim, evitamos complicar o roteamento e mostramos as tags aos usuários em seu idioma nativo.

As definições das tags estão centralizadas em `src/content/tags/{tagId}.json`, e cada tag possui `i18n.name`. Isso permite que a coleção de tags, em vez dos arquivos JSON de tradução, seja a fonte de referência das traduções de tags.

```json
{
  "id": "technology",
  "name": "技術",
  "i18n": {
    "en": { "name": "Technology" },
    "fr": { "name": "Technologie" }
  }
}
```

Os cartões de artigos, a barra lateral, a lista de tags e os detalhes dos artigos consultam a coleção de tags para alternar os nomes exibidos. Assim, todas as tags são exibidas de forma consistente no idioma da localidade.

## Suporte multilíngue aos dados dos autores

Também implementamos a troca por idioma dos nomes, das biografias (bio) e das listas de habilidades dos autores. Adicionamos o campo `i18n` a `src/content/authors/{authorId}.json` para armazenar as traduções de cada idioma.

```json
{
  "id": "hatt",
  "name": "ハット",
  "bio": "代表取締役。Web制作・サーバー運用…",
  "skills": ["TypeScript", "Astro", "..."],
  "i18n": {
    "en": {
      "name": "Hatt",
      "bio": "CEO and representative director. Web development...",
      "skills": ["TypeScript", "Astro", "..."]
    }
  }
}
```

O utilitário `getLocalizedAuthor()` obtém as informações do autor de acordo com a localidade.

```typescript
// src/utils/blog-i18n.ts
export function getLocalizedAuthor(author: Author, locale: Locale) {
  const localized = author.i18n?.[locale];
  return localized ? { ...author, ...localized } : author;
}
```

## Implementação de SEO multilíngue

Para maximizar os benefícios de SEO da internacionalização, criamos mecanismos que permitem aos motores de busca reconhecer e indexar corretamente cada versão linguística.

### Suporte a hreflang no sitemap

Configuramos a opção `i18n` de `@astrojs/sitemap` e um filtro que verifica a existência dos arquivos de tradução. O sitemap inclui apenas as versões linguísticas existentes e gera automaticamente as tags `xhtml:link rel="alternate"` correspondentes.

```javascript
// astro.config.mjs
sitemap({
  filter(page) {
    return !isMissingLocalizedBlogPost(page);
  },
  i18n: {
    defaultLocale: "ja",
    locales: {
      ja: "ja",
      en: "en",
      "zh-cn": "zh-CN",
      es: "es",
      pt: "pt",
      fr: "fr",
      ko: "ko",
      de: "de",
      ru: "ru",
    },
  },
});
```

Para artigos disponíveis em todos os 9 idiomas, são gerados valores hreflang para os 9 idiomas. Para artigos sem tradução, apenas a URL japonesa é incluída; versões inexistentes não aparecem no sitemap nem no hreflang.

### Suporte a idiomas nos dados estruturados JSON-LD

Adicionamos o campo `inLanguage` aos dados estruturados `BlogPosting` dos artigos para informar aos motores de busca em que idioma cada artigo está escrito.

```javascript
// BlogPostPage.astro（JSON-LD 抜粋）
{
  "@type": "BlogPosting",
  "inLanguage": htmlLangMap[locale],  // "ja", "en", "zh-CN" など
  "headline": post.data.title,
  // ...
}
```

### Feeds RSS multilíngues

Além de `/rss.xml` da versão japonesa, geramos feeds RSS para cada idioma (`/en/rss.xml`, `/zh-cn/rss.xml` etc.). Os títulos e as descrições dos feeds também são traduzidos, e a tag `<language>` fornece um código de idioma compatível com BCP47.

```typescript
// src/pages/[locale]/rss.xml.ts
export const getStaticPaths = () =>
  locales
    .filter((l) => l !== defaultLocale)
    .map((l) => ({ params: { locale: l } }));
```

`<link rel="alternate" type="application/rss+xml">` de `BaseLayout.astro` também configura automaticamente a URL do RSS de acordo com a localidade.

## Resumo

Na implementação de 7/2026, usamos os recursos integrados de i18n do Astro 7.1.3 para oferecer suporte a vários idiomas mesmo em um site estático.

- **Infraestrutura de i18n**: com `prefixDefaultLocale: false` do Astro, o japonês não usa prefixo
- **Tradução da interface**: o padrão de componentes View elimina a duplicação de lógica
- **Tradução de conteúdo**: a organização em subdiretórios não exige alterações no esquema existente
- **Tradução de tags**: as URLs mantêm os slugs japoneses; apenas os nomes exibidos são traduzidos
- **Tradução dos dados dos autores**: bio e skills são alternados conforme o idioma
- **SEO**: hreflang no sitemap, `inLanguage` em JSON-LD e feeds RSS multilíngues
- **Localidades sem tradução**: URLs de artigos não são geradas e a versão japonesa continua publicada na URL original
- **Suporte ao CMS**: os artigos de cada idioma podem ser editados separadamente no Pages CMS

Ao adicionar novos artigos, os arquivos de tradução também serão adicionados gradualmente. Até que a tradução esteja concluída, apenas a versão japonesa será publicada; as URLs dos artigos, o sitemap e o hreflang serão ativados para cada localidade à medida que seu arquivo de tradução for adicionado.

## Atualização de 6/10/2026: idioma e erros nas telas de autenticação

Além da tradução dos artigos publicados, as telas de autenticação também precisam de uma seleção de idioma consistente. Em uma alteração anonimizada, selecionamos, nessa ordem, `ui_locales`, `Accept-Language` ou o idioma padrão, conforme a disponibilidade, com uma alternativa segura para valores não suportados. Os erros conhecidos de OIDC são convertidos em mensagens de exibição comuns, e mesmo erros desconhecidos não exibem mensagens internas brutas.

Verificamos em conjunto os rótulos das páginas, os erros recebidos pela API e as orientações após a conclusão do cadastro. O suporte do blog a 9 idiomas, por si só, não significa que a aceitação de todas as telas de autenticação e dos fluxos reais de cadastro esteja concluída.

O idioma também é mantido no login, no gerenciamento de conta, no consentimento e nos códigos de uso único, preservando locale e state do OIDC durante as transições. Distinguimos o escopo verificado em URLs, Content-Language e exibição em telas estreitas da aceitação pelos usuários em todos os idiomas.

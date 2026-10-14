---
title: "Como operar um blog multilíngue com Sveltia CMS"
description: "Publicar oito traduções estáticas do japonês: proteção de números, URL e código no OpenAI Batch, validação completa antes de gravar, PR, CI e publicação conectada ao GitHub."
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["Tecnologia", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: Tradução na UI não é publicação multilíngue
  text: "Tradução do navegador ou de widgets ajuda o leitor, mas não cria URLs, title, description, links internos, RSS, sitemap nem hreflang por idioma. Para os mecanismos de busca verem cada idioma como página real, publique HTML estático traduzido."
processFigure:
  eyebrow: Translation Workflow
  title: "Da origem japonesa ao PR de tradução validado"
  description: "Restaurar números, URL e código; validar tudo antes de gravar."
  variant: inline
  steps:
    - title: "Editar japonês"
      description: "Usar main atual e agrupar edições consecutivas."
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "Proteger e enviar Batch"
      description: "Tokenizar números, URL, placeholders e código."
      icon: i-lucide-shield-check
      accent: amber
    - title: "Validar tudo e gravar"
      description: "Conferir sourceHash, tokens e conteúdo; registrar falhas e parar."
      icon: i-lucide-languages
      accent: emerald
    - title: "PR, CI e publicação"
      description: "Publicar pelo GitHub e revisar conteúdo."
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: Diferença entre tradução da interface e geração de páginas específicas por idioma
  before:
    label: Tradução da interface
    items:
      - "O navegador ou widget de tradução do usuário traduz durante a exibição"
      - "URL, title, description e OGP tendem a permanecer no idioma de origem"
      - "É difícil publicar páginas específicas por idioma em sitemap, RSS e hreflang"
      - "O texto de URLs compartilhadas e resultados de pesquisa tende ao idioma original"
  after:
    label: Páginas multilíngues estáticas
    items:
      - "É possível publicar URLs por idioma como `/{locale}/blog/{slug}/`"
      - "title, description, corpo, FAQ e dados estruturados podem existir por idioma"
      - "hreflang informa aos mecanismos de pesquisa a relação entre as versões linguísticas"
      - "RSS, sitemap, links internos e Search Console podem ser tratados por idioma"
checklist:
  title: Decisões para a adoção
  items:
    - text: "Tratar o artigo em japonês como fonte da tradução"
      checked: true
    - text: "Manter o slug dos arquivos traduzidos igual ao do artigo japonês"
      checked: true
    - text: "Iniciar tradução por mudanças japonesas no main"
      checked: true
    - text: "Não quebrar URLs, path de imagens, blocos de código nem IDs de tags na tradução"
      checked: true
    - text: "Verificar no build a saída de hreflang, canonical, RSS e sitemap"
      checked: true
linkCards:
  - href: /pt/blog/cms-selection-and-turnstile/
    title: Guia de instalação do Sveltia CMS
    description: Como adicionamos Sveltia CMS a um site Astro estático.
    icon: i-lucide-badge-check
  - href: /pt/blog/astro-i18n-blog-translation/
    title: Arquitetura multilíngue com Astro
    description: Rotas, fallback, hreflang, RSS e sitemap para 9 idiomas.
    icon: i-lucide-globe-2
faq:
  title: Perguntas frequentes
  items:
    - question: Tradução na UI é suficiente?
      answer: "É útil para leitura, mas não cria ativos por idioma para SEO, RSS, sitemap e links internos. Para isso, é melhor publicar páginas localizadas reais."
    - question: Tradução com IA prejudica SEO?
      answer: "O risco não é usar IA; é publicar muitas páginas sem valor. Termos, fatos, links e naturalidade precisam de revisão."
    - question: Páginas traduzidas são duplicadas?
      answer: "Segundo a documentação do Google, páginas localizadas só são duplicadas quando o conteúdo principal não está traduzido. Use hreflang para conectar as variantes."
---

Para iniciar um fluxo multilíngue, gere HTML localizado pelas traduções de um artigo representativo e confira texto, title, description e links internos. Relacione somente versões existentes segundo [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions); verifique separadamente o sucesso do serviço e as páginas públicas concluídas.

> **Verificado em 14 de outubro de 2026:** A tradução atual usa OpenAI Batch. Os passos do Copilot permanecem como registro de junho de 2026. Os diagramas e o fluxo atuais protegem a origem e validam todos os resultados antes da gravação.

## Fluxo atual: proteção, validação e PR

No Systems, atualizações de artigos ou UI em japonês no main aguardam 15 minutos antes de o [workflow de envio](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml) usar o main atual. A [coleta](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml), prevista aos minutos 2, 17, 32 e 47 de cada hora, confere sourceHash e cria um PR. A [integração](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml) encaminha PRs válidos por CI e publicação ligada ao GitHub. Horário previsto, Batch concluído, merge e publicação são estados distintos.

Antes de enviar, números, URL, placeholders existentes, inline code e fenced code viram tokens únicos. A coleta restaura os originais da fonte japonesa correspondente e rejeita tokens ausentes, duplicados, alterados ou adicionais. A proteção evita mudanças do modelo nesses detalhes; validação após restauração e revisão continuam necessárias.

A [documentação OpenAI Batch](https://developers.openai.com/api/docs/guides/batch) informa que a ordem pode mudar; `custom_id` associa idioma, source path e sourceHash. A [mudança de proteção e coleta](https://github.com/acecore-systems/acecore-systems/pull/131) valida todos os resultados antes de gravar. Resultado inválido, duplicado ou obsoleto no fim não deixa traduções anteriores parcialmente aplicadas. Um artifact registra idioma, source path, Batch ID e causa. Isso não garante uma transação de arquivos contra falhas de disco durante a escrita.

Foram verificados 27 testes e a ida e volta offline de 55 fontes japonesas × 8 locales, 440 resultados. Não foi uma retradução completa com novas chamadas ao modelo. Traduções existentes são revisadas com o japonês no mesmo PR e depois atualiza-se o hash da origem formatada; nunca apenas o hash.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">Conferir origem protegida e todos os resultados</strong>
    <span>Falha não deve atualizar apenas alguns idiomas. Batch concluído não é publicação.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Proteger origem</strong>
      <span>Tokens únicos para números, URL e código.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Validar origem atual e resultados</strong>
      <span>Conferir custom_id, sourceHash e tokens; restaurar.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>PR no fluxo de publicação</strong>
      <span>Gravar após validar, depois CI e revisão.</span>
    </li>
  </ol>
</figure>

## Registro da implantação de junho de 2026

O conteúdo da Acecore é editado principalmente em japonês, mas o blog é publicado em 9 idiomas. O ponto principal é que **traduzir a tela** e **publicar conteúdo multilíngue** são coisas diferentes.

Tradução do navegador ajuda o leitor naquele momento. Mas ela não cria URLs localizadas, metadados, RSS, sitemap, dados estruturados ou hreflang.

Se o objetivo inclui busca orgânica, a tradução deve ser parte do processo de publicação.

## Estrutura

- Fonte em japonês: `src/content/blog/{slug}.md`
- Traduções: `src/content/blog/{locale}/{slug}.md`
- URLs: `/blog/{slug}/`, `/en/blog/{slug}/`, `/pt/blog/{slug}/`
- Edição: Sveltia CMS
- Tradução: PRs do GitHub Copilot
- Publicação: build e revisão

Sveltia CMS edita a fonte japonesa. As traduções ficam em PRs para que o time consiga revisar, testar e reverter.

## Quando tradução na UI basta

Ela funciona bem para leitura interna, navegação ocasional, telas administrativas e páginas que não buscam tráfego orgânico.

O custo operacional é baixo, porque não há arquivos traduzidos. Mas também não há páginas por idioma para indexação.

## Benefícios para mecanismos de busca

Buscadores, previews sociais e leitores RSS lidam com URLs e HTML.

Se só existe a página japonesa, o navegador pode traduzi-la para o usuário, mas `title`, `description`, RSS e sitemap continuam ligados à página japonesa.

Com páginas estáticas, cada idioma tem seu próprio URL.

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/pt/blog/copilot-translation-pipeline/
/fr/blog/copilot-translation-pipeline/
```

### 1. Crawlers acessam cada idioma diretamente

Google processa JavaScript, mas a documentação também fala das limitações e recomenda renderização estática ou server-side como soluções mais estáveis. Para outros crawlers e leitores RSS, HTML inicial traduzido é ainda mais importante.

### 2. Metadados são localizados

O frontmatter também é traduzido:

```yaml
title: "Como operar um blog multilíngue com Sveltia CMS"
description: "Fluxo com Sveltia CMS e GitHub Copilot para PRs de tradução."
```

Isso afeta resultados de busca, OGP, cards relacionados e RSS.

### 3. hreflang mostra a relação entre idiomas

Quando idiomas têm URLs diferentes, o Google recomenda `hreflang`. Com tradução apenas na UI, não há URL de outro idioma para conectar.

### 4. RSS e sitemap ficam multilíngues

Arquivos traduzidos permitem gerar `/pt/rss.xml` e URLs localizadas no sitemap.

## Papel do Sveltia CMS

Sveltia CMS não traduz. Ele mantém simples a edição do conteúdo japonês:

- artigos japoneses
- autores
- tags
- JSON fonte em japonês
- imagens
- frontmatter como data, FAQ e links

A configuração do CMS está em [Guia de instalação do Sveltia CMS](/pt/blog/cms-selection-and-turnstile/).

## Regras para Copilot

O PR de tradução deve preservar identificadores e localizar apenas texto.

```md
Keep:

- slug
- image path
- author id
- tag ids
- external URLs
- code blocks

Localize:

- title
- description
- FAQ
- body text
- internal blog URLs when locale-specific URLs exist
```

## Lições dos PRs

- Artigos antigos ainda mencionavam Pages CMS mesmo após a migração para Sveltia CMS.
- Se `date` fica antigo, o artigo não aparece no topo do blog.
- O slug deve continuar igual entre idiomas.
- Links internos devem apontar para o locale do leitor.
- IA acelera a tradução, mas revisão continua obrigatória.

## Referências

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Guia de instalação do Sveltia CMS](/pt/blog/cms-selection-and-turnstile/)

## Resumo

Tradução na UI ajuda a ler. Páginas estáticas localizadas transformam cada idioma em conteúdo real do site.

Sveltia CMS cuida do japonês, GitHub Copilot cria PRs de tradução e Astro build valida o resultado antes da publicação.

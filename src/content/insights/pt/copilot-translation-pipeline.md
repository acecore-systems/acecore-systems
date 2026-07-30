---
title: "Como operar um blog multilíngue com Sveltia CMS"
description: "Um fluxo prático para editar artigos fonte em japonês no Sveltia CMS, gerar PRs de tradução com GitHub Actions e GitHub Copilot, e publicar páginas estáticas localizadas com benefícios para busca em relação à tradução apenas na UI."
date: 2026-06-07T17:00
author: gui
tags: ["Tecnologia", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: /uploads/acecore-generated/blog-copilot-translation-pipeline.webp
callout:
  type: tip
  title: Tradução na UI não é publicação multilíngue
  text: "Tradução do navegador ou de widgets ajuda o leitor, mas não cria URLs, title, description, links internos, RSS, sitemap nem hreflang por idioma. Para os mecanismos de busca verem cada idioma como página real, publique HTML estático traduzido."
processFigure:
  eyebrow: Translation Workflow
  title: Fluxo do Sveltia CMS até o PR de tradução
  description: O japonês permanece como source of truth, e a tradução é separada no fluxo de PR do GitHub.
  variant: inline
  steps:
    - title: Editar apenas o japonês
      description: Atualizar `src/content/blog/{slug}.md` pelo Sveltia CMS ou Markdown.
      icon: i-lucide-file-pen-line
      accent: brand
    - title: Detectar o commit do CMS
      description: "Usar o prefix `cms:` e o path alterado como contrato do lado do GitHub Actions."
      icon: i-lucide-git-commit-horizontal
      accent: amber
    - title: Criar um PR de tradução
      description: Fornecer ao Copilot source path, locale e regras de tradução para gerar os arquivos traduzidos.
      icon: i-lucide-languages
      accent: emerald
    - title: Aplicar após o build
      description: Integrar ao main somente PRs que passem por Astro build, Pagefind e verificação de links.
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
    - text: "Fixar as condições de início do workflow, como commits `cms:`"
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

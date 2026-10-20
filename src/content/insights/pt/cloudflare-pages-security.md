---
title: "Configuração de cabeçalhos de segurança no Cloudflare Pages: diferenças
  entre _headers e Functions"
description: "Saiba como diagnosticar cabeçalhos de segurança que não são
  aplicados no Cloudflare Pages. Entenda a diferença entre _headers para ativos
  estáticos e Response das Functions, onde verificar a configuração atual e o
  que conferir após a publicação."
date: 2026-03-15T00:00
author: gui
tags: ["Tecnologia", "Cloudflare", "Segurança"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Quando as configurações de CSP ou cache não são aplicadas no Cloudflare Pages, a primeira coisa a verificar é se a resposta vem de um ativo estático ou de uma Pages Function. Este artigo organiza o escopo de aplicação de `_headers` e de `Response` da Function, onde consultar a configuração atual e o que conferir após a publicação. Verifique os cabeçalhos tanto das respostas bem-sucedidas quanto das respostas de erro para identificar configurações ausentes após adicionar uma API.

Este artigo registra como, em março de 2026, o formulário de contato foi transferido para um formulário externo e o site voltou à entrega estática no Cloudflare Pages. Desde então, a estrutura do site mudou. **Em setembro de 2026, o site oficial da Acecore usa Pages Functions junto com páginas estáticas** para lidar com contato, comentários, busca, assistência por IA e APIs do CMS. A seguir, explicamos os motivos da decisão tomada na época e os limites da configuração de cabeçalhos que continuam relevantes.

## Qual é a diferença entre cabeçalhos para respostas estáticas e para Functions no Cloudflare Pages?

`public/_headers` aplica-se às **respostas de ativos estáticos** servidos pelo Pages. A [fonte publicada da documentação do Cloudflare sobre Headers](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx) explica que as regras de `_headers` são aplicadas às respostas de ativos estáticos. A [documentação do Cloudflare Pages sobre Headers](https://developers.cloudflare.com/pages/configuration/headers/) também informa que essas regras não se aplicam às respostas geradas por Pages Functions, mesmo quando o padrão de URL corresponde. Configure na `Response` da Function os cabeçalhos de CORS, cache e segurança necessários às respostas da API.

Por isso, não presuma que basta configurar `_headers` uma vez para que a regra se aplique a todas as páginas e APIs do site. Confira separadamente os cabeçalhos reais das respostas do HTML estático e de `/api/*`.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Limites de configuração entre respostas estáticas e respostas de Functions</strong>
    <span>Arquivos estáticos e APIs têm locais diferentes para configurar cabeçalhos. Após a publicação, confira cada tipo de resposta separadamente.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Resposta de arquivo estático</strong>
      <span>Configure com _headers e confira a resposta retornada pelo Pages.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Resposta da API da Function</strong>
      <span>Configure na Response da Function e confira a resposta da API separadamente.</span>
    </li>
  </ol>
</figure>

## Onde consultar a configuração atual de cabeçalhos?

O [arquivo `_headers` atual](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) define revalidação para HTML e cache de longa duração para os ativos `_astro/` com hash. A interface administrativa tem uma CSP diferente da das páginas comuns, e `X-Frame-Options` está definido como `SAMEORIGIN`. Não copie como valores atuais o antigo `form-action https://ssgform.com`, o cache de HTML de uma hora ou `DENY`.

As rotas dinâmicas podem ser consultadas no [código das Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Confira também se os domínios externos permitidos na CSP correspondem aos scripts, imagens, frames e destinos de comunicação realmente usados. Não transfira a configuração publicada aqui diretamente para outro site.

## O que conferir após a implantação?

O site oficial publica `main` pelo Cloudflare Pages conectado ao GitHub. A [versão atual do Node](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) está em `.node-version`; as etapas de build estão em `package.json`, e a CI valida com `npm run build`. A tabela de março de 2026 com “Node.js 22 / npx astro build” não descreve o procedimento atual de publicação.

Para confirmar a publicação, verifique separadamente a prévia do PR, o build de `main`, a implantação de produção no Pages e os cabeçalhos e o conteúdo da URL pública. A [documentação oficial do Cloudflare Pages sobre Headers](https://developers.cloudflare.com/pages/configuration/headers/) explica a configuração de `_headers`.

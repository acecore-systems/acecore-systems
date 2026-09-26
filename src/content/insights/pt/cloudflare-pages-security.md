---
title: "Cabeçalhos de segurança para arquivos estáticos e Functions do Cloudflare Pages"
description: "Diferencie respostas estáticas do Pages e de Functions e revise _headers, CSP e a configuração atual."
date: 2026-03-15T00:00
author: gui
tags: ["Tecnologia", "Cloudflare", "Segurança"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
lastUpdated: "2026-09-26T19:12:47+09:00"
---

Este artigo registrava a mudança, em março de 2026, de um formulário com Worker para um serviço externo e para a publicação estática no Cloudflare Pages. A arquitetura mudou desde então. **Em setembro de 2026, o site corporativo da Acecore usa Pages Functions junto com páginas estáticas** para contato, comentários, busca, assistência de IA e APIs do CMS. A decisão anterior é um registro histórico.

## Separe respostas estáticas e Functions

`public/_headers` aplica-se às **respostas de arquivos estáticos** do Pages. A Cloudflare informa que as regras não se aplicam às respostas geradas por Pages Functions, mesmo quando o padrão de URL coincide. Defina CORS, cache e cabeçalhos de segurança necessários no `Response` da Function.

Não presuma que `_headers` protege todas as páginas e APIs. Verifique separadamente os cabeçalhos reais do HTML estático e de `/api/*`.

## Consulte a configuração atual

O [arquivo `_headers` atual](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) revalida HTML e mantém em cache por mais tempo os arquivos `_astro/` com hash. O CMS tem uma CSP própria e `X-Frame-Options` está como `SAMEORIGIN`. Não copie como valores atuais o antigo `form-action https://ssgform.com`, o cache HTML de uma hora ou `DENY`.

As rotas dinâmicas estão no [código de Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Ajuste as fontes de CSP aos scripts, imagens, frames e conexões reais do seu site, sem transplantar a política da Acecore.

## Publicação e verificação

O site publica `main` pelo Cloudflare Pages conectado ao GitHub. A versão atual de Node consta em [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version); a CI executa `npm run build` do `package.json`. A tabela de março de 2026 com “Node.js 22 / npx astro build” é histórica.

Verifique separadamente o preview do PR, o build de main, o deploy de produção e a URL pública. Consulte a [documentação de cabeçalhos do Pages](https://developers.cloudflare.com/pages/configuration/headers/) da Cloudflare.

---
title: "Como conectamos guias de IA entre sites e exibimos respostas em fluxo"
description: "Um registro da integração de guias de IA de sites públicos a um serviço compartilhado e da exibição progressiva das respostas."
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## Entradas próprias e processamento compartilhado

Os sites públicos da Acecore usam guias de IA para ajudar visitantes a encontrar páginas e contatos. Em agosto de 2026, os guias da Acecore e dos sites especializados passaram a usar processamento comum no servidor. Cada site mantém perguntas e destinos adequados; uma API da mesma origem encaminha a solicitação a um Worker compartilhado. O Alpha da Aceserver usa outro serviço compartilhado pelo portal e pela Wiki.

## Texto provisório e resposta final

Com SSE, o texto chega aos poucos na mesma mensagem. Durante a geração ele aparece como texto simples; os links são validados e exibidos apenas após a conclusão. Assim, a saída incompleta do modelo não vira HTML confiável. A resposta JSON anterior continua compatível.

## Encaminhar para informações oficiais

No site público da Systems, confirmamos o guia e uma resposta que leva ao contato. A interface pede que não sejam inseridas informações pessoais ou confidenciais. Preços e contratos devem ser conferidos nas páginas oficiais e com a equipe. O [artigo anterior de design](/insights/astro-ai-contact-chat/) registra junho de 2026; as mudanças posteriores estão em [Acecore](https://github.com/acecore-systems/acecore-net/pull/240), [Systems](https://github.com/acecore-systems/acecore-systems/pull/58), [portal](https://github.com/acecore-systems/aceserver-portal/pull/111) e [Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81).

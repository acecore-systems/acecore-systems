---
title: "Como migramos a busca semântica de vários sites para o Cloudflare Workers AI"
description: "O processo de migração dos embeddings de busca dos sites públicos da Acecore para o BGE-M3, incluindo implantação e avaliação."
date: 2026-09-25T12:00
author: gui
tags: ["Tecnologia", "Cloudflare", "Vectorize", "Busca"]
image: /images/insights/vectorize-rag-hero.webp
---

Vários sites públicos da Acecore usam Cloudflare Vectorize para encontrar páginas relacionadas mesmo quando a pergunta não repete as palavras do título. Em agosto de 2026, migramos gradualmente o modelo de embeddings de consultas e páginas publicadas para o BGE-M3 no Cloudflare Workers AI.

## Preparar um índice separado

A troca de modelo também altera as dimensões dos vetores. Criamos novos índices em vez de reutilizar os antigos, sincronizamos os dados de busca gerados das páginas publicadas e conferimos os IDs. Testamos consultas reais antes da mudança e mantivemos os índices anteriores para recuperação.

## Avaliar com perguntas reais

No Acecore Systems, avaliamos 12 consultas representativas. A página esperada ficou em primeiro lugar em 10 delas e entre as cinco primeiras em todas as 12. Quatro consultas sem relação foram bloqueadas pelo limite usado na época. Foi uma avaliação pequena durante a migração, não uma garantia para toda consulta futura.

## Atualizar as informações ao visitante

Atualizamos a interface de busca e os avisos de privacidade de acordo com o local real do processamento. A busca comum por palavras-chave continua disponível ao lado da busca semântica. Continuamos a verificar relevância, tempo de resposta e se o índice contém apenas informações públicas.

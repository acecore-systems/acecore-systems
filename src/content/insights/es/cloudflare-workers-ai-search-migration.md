---
title: "Cómo migramos la búsqueda semántica de varios sitios a Cloudflare Workers AI"
description: "El proceso de migración de las representaciones de búsqueda de los sitios públicos de Acecore a BGE-M3 y su evaluación."
date: 2026-09-25T00:00
author: gui
tags: ["Tecnología", "Cloudflare", "Vectorize", "Búsqueda"]
image: /images/insights/vectorize-rag-hero.webp
---

Varios sitios públicos de Acecore usan Cloudflare Vectorize para encontrar páginas relacionadas aunque la pregunta no repita las palabras del título. En agosto de 2026 migramos, sitio por sitio, el modelo de representaciones de consultas y páginas publicadas a BGE-M3 en Cloudflare Workers AI.

## Preparar un índice nuevo

Al cambiar de modelo también cambian las dimensiones de los vectores. Creamos índices nuevos en lugar de reutilizar los anteriores, sincronizamos los datos generados a partir de páginas publicadas y comprobamos los identificadores. Probamos consultas reales antes de cambiar el tráfico y conservamos los índices anteriores para poder recuperarnos.

## Evaluar con preguntas reales

En Acecore Systems evaluamos 12 consultas representativas. La página esperada apareció en primer lugar en 10 casos y entre los cinco primeros en los 12. Cuatro consultas no relacionadas quedaron excluidas por el umbral vigente entonces. Fue una evaluación pequeña durante la migración, no una garantía para todas las consultas futuras.

## Actualizar la información visible

Actualizamos la interfaz de búsqueda y los avisos de privacidad para reflejar dónde se procesan los datos. La búsqueda normal por palabras clave sigue disponible junto a la búsqueda semántica. Seguimos comprobando relevancia, tiempo de respuesta y que el índice solo incluya información pública.

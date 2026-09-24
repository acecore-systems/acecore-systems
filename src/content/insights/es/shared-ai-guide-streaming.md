---
title: "Cómo unificamos las guías de IA y mostramos las respuestas en tiempo real"
description: "Un resumen de la conexión de las guías de IA de sitios públicos a un servicio compartido y de la visualización progresiva de respuestas."
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## Entradas propias y procesamiento compartido

Los sitios públicos de Acecore ofrecen guías de IA para encontrar páginas y vías de contacto. En agosto de 2026, las guías de Acecore y sus sitios especializados comenzaron a usar un procesamiento común en el servidor. Cada sitio conserva preguntas y destinos adecuados; una API del mismo origen envía las solicitudes a un Worker compartido. Alpha de Aceserver usa otro servicio compartido entre el portal y la Wiki.

## Texto provisional y respuesta final

Con SSE, el texto se añade progresivamente a un mismo mensaje. Durante la generación se muestra como texto sin formato; los enlaces se validan y representan solo al terminar. Así, la salida incompleta del modelo no se trata como HTML de confianza. Se mantiene la compatibilidad con la respuesta JSON anterior.

## Remitir a información oficial

En el sitio público de Systems comprobamos la guía y una respuesta con enlace de contacto. La interfaz pide no introducir datos personales ni confidenciales. Los precios y contratos deben confirmarse en las páginas oficiales y con el equipo. El [artículo anterior sobre el chat](/insights/astro-ai-contact-chat/) documenta junio de 2026; los cambios posteriores constan en [Acecore](https://github.com/acecore-systems/acecore-net/pull/240), [Systems](https://github.com/acecore-systems/acecore-systems/pull/58), [el portal](https://github.com/acecore-systems/aceserver-portal/pull/111) y [la Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81).

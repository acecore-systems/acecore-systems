---
title: "How We Connected AI Guides Across Sites and Streamed Answers"
description: "A record of connecting public-site AI guides to shared processing and progressively displaying answers, with a check on the live site."
date: 2026-09-25T12:00
author: gui
image: https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80
tags: ["Technology", "AI", "Cloudflare", "Websites"]
---

## A shared service, distinct site entry points

Acecore’s public sites use AI guides to help visitors find relevant pages and contact routes. In August 2026, the Acecore and specialist-site guides moved toward shared server-side processing. Each site keeps questions and destinations suited to its audience; a same-origin API passes requests to a shared Worker. Aceserver’s Alpha guide uses a separate shared service across the portal and Wiki.

## Separate provisional text from the final answer

The interface uses SSE to add incoming text to one message. While generation is in progress, it displays plain text. Only after completion does it render validated links. This avoids treating unfinished model output as trusted HTML. The implementation also accepts the earlier fixed JSON response.

## Guide people to authoritative information

The live Systems site shows the guide and an answer leading to a contact page. Its interface asks visitors not to enter personal or confidential information. Prices and contract terms should be checked on the official pages and with the team. The earlier [AI contact design article](/insights/astro-ai-contact-chat/) describes the June 2026 architecture; the [Acecore streaming change](https://github.com/acecore-systems/acecore-net/pull/240), [Systems integration](https://github.com/acecore-systems/acecore-systems/pull/58), [Aceserver portal](https://github.com/acecore-systems/aceserver-portal/pull/111), and [Wiki](https://github.com/acecore-systems/aceserver-wiki/pull/81) record the later work.

---
title: "Заголовки безопасности для статических ресурсов и Functions в Cloudflare Pages"
description: "Различайте статические ответы Pages и ответы Functions; проверяйте _headers, CSP и текущую конфигурацию."
date: 2026-03-15T00:00
author: gui
tags: ["Технологии", "Cloudflare", "Безопасность"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
lastUpdated: "2026-09-26T19:12:47+09:00"
---

Изначально статья описывала переход в марте 2026 года от контактной формы на Worker к внешнему сервису и статической выдаче через Cloudflare Pages. Архитектура с тех пор изменилась. **В сентябре 2026 года корпоративный сайт Acecore использует Pages Functions вместе со статическими страницами** для связи, комментариев, поиска, ИИ-помощника и API CMS. Прежнее решение следует читать как историю.

## Различайте статические ответы и Functions

`public/_headers` применяется к **ответам статических ресурсов**, которые выдаёт Pages. Cloudflare прямо указывает, что правила не действуют на ответы Pages Functions, даже если шаблон URL совпадает. Нужные заголовки CORS, кэша и безопасности задаются в `Response` функции.

Не считайте, что `_headers` защищает все страницы и API. Проверяйте фактические заголовки статического HTML и `/api/*` отдельно.

## Где смотреть текущие настройки

[Текущий файл `_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) требует повторной проверки HTML и дольше кэширует ресурсы `_astro/` с хешем в имени. Для CMS задана отдельная CSP, а `X-Frame-Options` равен `SAMEORIGIN`. Не копируйте старые значения `form-action https://ssgform.com`, часовой кэш HTML или `DENY` как актуальные.

Динамические маршруты находятся в [коде Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Проверяйте источники CSP по реально используемым скриптам, изображениям, фреймам и соединениям своего сайта, не перенося политику Acecore без проверки.

## Развёртывание и проверка

Сайт публикует `main` через Cloudflare Pages с подключением к GitHub. Текущая версия Node указана в [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version); CI выполняет `npm run build` из `package.json`. Таблица марта 2026 года «Node.js 22 / npx astro build» — историческая.

Отдельно проверяйте предпросмотр PR, сборку main, производственное развёртывание Pages и публичный URL. См. [документацию Cloudflare по заголовкам Pages](https://developers.cloudflare.com/pages/configuration/headers/).

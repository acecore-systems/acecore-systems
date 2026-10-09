---
title: "Заголовки безопасности для статических ресурсов и Functions в Cloudflare Pages"
description: "Различайте статические ответы Pages и ответы Functions; проверяйте _headers, CSP и текущую конфигурацию."
date: 2026-03-15T00:00
author: gui
tags: ["Технологии", "Cloudflare", "Безопасность"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Если CSP или кеширование в Cloudflare Pages не действуют, сначала определите, возвращает URL статический ресурс или ответ Functions. Выберите место настройки по [Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/) и проверьте заголовки успешных и ошибочных ответов, чтобы обнаружить пропуски после добавления API.

Изначально статья описывала переход в марте 2026 года от контактной формы на Worker к внешнему сервису и статической выдаче через Cloudflare Pages. Архитектура с тех пор изменилась. **В сентябре 2026 года корпоративный сайт Acecore использует Pages Functions вместе со статическими страницами** для связи, комментариев, поиска, ИИ-помощника и API CMS. Прежнее решение следует читать как историю.

## Различайте статические ответы и Functions

`public/_headers` применяется к **ответам статических ресурсов**, которые выдаёт Pages. Cloudflare прямо указывает, что правила не действуют на ответы Pages Functions, даже если шаблон URL совпадает. Нужные заголовки CORS, кэша и безопасности задаются в `Response` функции.

Не считайте, что `_headers` защищает все страницы и API. Проверяйте фактические заголовки статического HTML и `/api/*` отдельно.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Заголовки для статики и Functions задаются по-разному</strong>
    <span>Для статики и API заголовки настраиваются в разных местах. После публикации проверьте оба ответа отдельно.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Ответ статического файла</strong>
      <span>Настройте через _headers и проверьте ответ, который отдает Pages.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Ответ API в Function</strong>
      <span>Задайте заголовки в Response функции и отдельно проверьте ответ API.</span>
    </li>
  </ol>
</figure>

## Где смотреть текущие настройки

[Текущий файл `_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) требует повторной проверки HTML и дольше кэширует ресурсы `_astro/` с хешем в имени. Для CMS задана отдельная CSP, а `X-Frame-Options` равен `SAMEORIGIN`. Не копируйте старые значения `form-action https://ssgform.com`, часовой кэш HTML или `DENY` как актуальные.

Динамические маршруты находятся в [коде Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Проверяйте источники CSP по реально используемым скриптам, изображениям, фреймам и соединениям своего сайта, не перенося политику Acecore без проверки.

## Развёртывание и проверка

Сайт публикует `main` через Cloudflare Pages с подключением к GitHub. Текущая версия Node указана в [`.node-version`](https://github.com/acecore-systems/acecore-net/blob/main/.node-version); CI выполняет `npm run build` из `package.json`. Таблица марта 2026 года «Node.js 22 / npx astro build» — историческая.

Отдельно проверяйте предпросмотр PR, сборку main, производственное развёртывание Pages и публичный URL. См. [документацию Cloudflare по заголовкам Pages](https://developers.cloudflare.com/pages/configuration/headers/).

---
title: "Заголовки безопасности в Cloudflare Pages: различия между _headers и
  Functions"
description: "Как разобраться, почему CSP и кеширование не применяются в
  Cloudflare Pages: область действия _headers для статических ответов, различия
  с Functions и проверка настроек после публикации."
date: 2026-03-15T00:00
author: gui
tags: ["Технологии", "Cloudflare", "Безопасность"]
image: "/images/insights/covers/cloudflare-pages-security-cover-v2.webp"
lastUpdated: "2026-10-20T09:59:18Z"
---

Если в Cloudflare Pages не применяются настройки CSP или кеширования, сначала выясните, является ли ответ статическим ресурсом или ответом Pages Functions. В этой статье рассматриваются области применения `_headers` и `Response` функции, где проверить текущую конфигурацию и что проверить после публикации. Проверяйте заголовки не только успешных ответов, но и ответов с ошибками: это помогает обнаружить пропущенные настройки после добавления API.

Статья описывает историю перехода в марте 2026 года на внешнюю форму для обращений и возврата к статической выдаче через Cloudflare Pages. С тех пор структура сайта изменилась. **По состоянию на сентябрь 2026 года официальный сайт Acecore использует Pages Functions наряду со статическими страницами** для обработки обращений, комментариев, поиска, ИИ-помощника и API CMS. Ниже объясняются причины тогдашнего выбора и границы настройки заголовков, актуальные и сейчас.

## Чем отличаются заголовки для статических ответов Cloudflare Pages и Functions?

`public/_headers` применяется к **ответам статических ресурсов**, которые выдаёт Pages. В [публичном исходном файле Cloudflare Docs о заголовках](https://github.com/cloudflare/cloudflare-docs/blob/production/src/content/docs/pages/configuration/headers.mdx) сказано, что правила `_headers` применяются к ответам статических ресурсов. В [документации Cloudflare Pages: Headers](https://developers.cloudflare.com/pages/configuration/headers/) также сказано, что эти правила не применяются к ответам, создаваемым Pages Functions, даже если шаблон URL совпадает. Необходимые для API заголовки CORS, кеширования и безопасности задавайте в `Response` функции.

Поэтому не следует считать, что достаточно один раз настроить `_headers`, чтобы правила действовали для всех страниц и API сайта. Проверяйте фактические заголовки ответов для статического HTML и `/api/*` отдельно.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-cloudflare-pages-security">
  <figcaption>
    <strong id="diagram-cloudflare-pages-security">Настройка заголовков для статики и Functions</strong>
    <span>Для статических файлов и API заголовки задаются в разных местах. После публикации проверьте оба ответа отдельно.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h8"/></svg></span>
      <strong>Ответ статического файла</strong>
      <span>Настройте заголовки через _headers и проверьте ответ, который возвращает Pages.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 9h8M8 12h4M8 16h8"/></svg></span>
      <strong>Ответ API в Function</strong>
      <span>Задайте заголовки в Response функции и отдельно проверьте ответ API.</span>
    </li>
  </ol>
</figure>

## Где проверить текущие настройки заголовков?

В [текущем файле `_headers`](https://github.com/acecore-systems/acecore-net/blob/main/public/_headers) для HTML настроена повторная проверка, а для ресурсов `_astro/` с хешем в имени — длительное кеширование. Для панели управления задана отдельная CSP, а `X-Frame-Options` установлен в `SAMEORIGIN`. Не копируйте значения из старой статьи — `form-action https://ssgform.com`, кеширование HTML на один час и `DENY` — как текущие настройки.

Текущие динамические маршруты можно проверить в [коде Pages Functions](https://github.com/acecore-systems/acecore-net/tree/main/functions). Разрешённые в CSP внешние домены также проверяйте по фактически загружаемым скриптам, изображениям, фреймам и адресам соединений. Не переносите опубликованные настройки на другой сайт без проверки.

## Что проверить после развёртывания?

Официальный сайт публикует ветку `main` через Cloudflare Pages, подключённый к GitHub. [Текущая версия Node](https://github.com/acecore-systems/acecore-net/blob/main/.node-version) указана в `.node-version`, а команды сборки — в `package.json`; CI проверяет проект с помощью `npm run build`. Таблица из марта 2026 года «Node.js 22 / npx astro build» не описывает текущую процедуру публикации.

При проверке публикации отдельно проверяйте предпросмотр PR, сборку `main`, производственное развёртывание Pages, а также заголовки и содержимое по публичному URL. В [официальной документации Cloudflare Pages о заголовках](https://developers.cloudflare.com/pages/configuration/headers/) описана настройка `_headers`.

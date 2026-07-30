---
title: "Как добавить комментарии в Astro-блог только на Cloudflare"
description: "Как мы добавили комментарии в Astro-блог без внешнего сервиса: Cloudflare Pages Functions, D1, Turnstile и конфигурация Wrangler."
date: 2026-06-07T18:00
author: gui
tags: ["Технологии", "Cloudflare", "Astro", "Безопасность", "Веб-сайт"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Без внешнего сервиса комментариев
  text: "Статический Astro-сайт может иметь собственные комментарии. Pages Functions дает API, D1 хранит данные, Turnstile защищает отправку, а Wrangler управляет bindings."
processFigure:
  eyebrow: Cloudflare Comments
  title: Архитектура комментариев, созданная только на Cloudflare
  description: "Astro отображает интерфейс, Cloudflare Pages Functions образуют границу API, а D1 и Turnstile соединяются как компоненты Cloudflare."
  variant: inline
  steps:
    - title: Разместить интерфейс в Astro
      description: "Разместить под статьёй список комментариев, форму отправки и виджет Turnstile."
      icon: i-lucide-message-square-text
      accent: brand
    - title: Принимать через Pages Function
      description: "`/api/comments` обрабатывает GET/POST/OPTIONS, проверяет ввод и отвечает за CORS."
      icon: i-lucide-cloud
      accent: slate
    - title: Сохранять в D1
      description: "Через binding `COMMENTS_DB` сохранять комментарии, hash и время создания в совместимой с SQLite D1."
      icon: i-lucide-database
      accent: emerald
    - title: Защищать с помощью Turnstile
      description: "Выполнять server-side validation token Cloudflare Turnstile и проверять hostname allowlist."
      icon: i-lucide-shield-check
      accent: amber
compareTable:
  title: Разница между внешним сервисом комментариев и собственной реализацией на Cloudflare
  before:
    label: Внешний сервис комментариев
    items:
      - "Быстро внедряется, но интерфейс, хранилище, условия и скорость отображения зависят от сервиса"
      - "Внешние script и iframe легко влияют на загрузку страницы статьи"
      - "Многоязычный интерфейс и единство с дизайном сайта часто ограничены"
      - "Обработка, удаление и миграция комментариев зависят от спецификации сервиса"
  after:
    label: Реализация только на Cloudflare
    items:
      - "Pages Functions, D1 и Turnstile обеспечивают API и хранилище"
      - "HTML и CSS Astro естественно встраиваются в дизайн сайта"
      - "Конфигурация Wrangler позволяет согласовать D1 binding с именем базы на Cloudflare"
      - "Команда сама определяет защиту от спама, удаление и объём сохраняемых персональных данных"
checklist:
  title: Что решить до реализации
  items:
    - text: "Хранить комментарии в собственной архитектуре Cloudflare, не передавая их внешнему сервису"
      checked: true
    - text: "Использовать D1 как хранилище, а Cloudflare Pages Functions как границу API"
      checked: true
    - text: "Всегда выполнять server-side validation token Turnstile"
      checked: true
    - text: "Отклонять URL, адреса электронной почты, HTML, Markdown-ссылки и рекламные формулировки до отправки"
      checked: true
    - text: "Согласовать имя базы D1 и binding COMMENTS_DB с конфигурацией Cloudflare"
      checked: true
linkCards:
  - href: /ru/blog/cloudflare-pages-security/
    title: Безопасность Cloudflare Pages
    description: Заголовки безопасности и статическая доставка через Cloudflare Pages.
    icon: i-lucide-shield
  - href: /ru/blog/cms-selection-and-turnstile/
    title: Руководство по внедрению Sveltia CMS
    description: CMS и компоненты Cloudflare на сайте.
    icon: i-lucide-badge-check
  - href: /ru/blog/astro-ai-contact-chat/
    title: AI-чат для контактов на Astro
    description: Другой пример API на Pages Functions.
    icon: i-lucide-bot
faq:
  title: Вопросы
  items:
    - question: Почему не внешний виджет?
      answer: "Внешний сервис быстро подключается, но UI, данные, скрипты, модерация и миграция зависят от него. Здесь все остается в сайте и Cloudflare."
    - question: Достаточно ли D1?
      answer: "Для выборки по post_slug, сортировки, soft delete, rate limit и дубликатов D1 хорошо подходит."
    - question: Достаточно ли Turnstile в браузере?
      answer: "Нет. Pages Function должна проверить token через Siteverify перед записью в D1."
---

Комментарии добавляют состояние в статический сайт.

Acecore не стал подключать внешний сервис комментариев. В [PR #101](https://github.com/acecore-systems/acecore-net/pull/101) функция реализована только на Cloudflare.

- Astro показывает UI.
- Cloudflare Pages Functions предоставляет `/api/comments`.
- Cloudflare D1 хранит комментарии.
- Cloudflare Turnstile защищает POST.
- `wrangler.jsonc` задает binding `COMMENTS_DB`.

Главное преимущество: комментарии не становятся сторонним виджетом внутри страницы.

## Архитектура

| Слой             | Файл или сервис                            |
| ---------------- | ------------------------------------------ |
| UI               | `src/components/BlogComments.astro`        |
| Вставка в статью | `src/views/BlogPostPage.astro`             |
| API              | `functions/api/comments.ts`                |
| Хранилище        | D1 binding `COMMENTS_DB`                   |
| Защита           | Cloudflare Turnstile                       |
| Schema           | `migrations/0001_create_blog_comments.sql` |

UI читает через `GET /api/comments?slug=...&locale=...` и отправляет через `POST /api/comments`.

Function проверяет origin, payload, Turnstile, лимиты, дубликаты и запрещенный контент.

## Почему D1

Комментарии удобно хранить в SQL: фильтр по статье, сортировка по времени, soft delete через `deleted_at`, дубликаты через `body_hash`, лимиты через `client_hash`.

Видимые строки имеют `deleted_at IS NULL`. Spam можно скрыть без физического удаления.

Запросы используют prepared statements и `bind()`, поэтому пользовательский ввод не склеивается с SQL.

## Wrangler и окружения

`COMMENTS_DB` задается в `wrangler.jsonc` и указывает на единственную D1-базу `acecore-comments`.

Так имя binding остается стабильным, а Cloudflare dashboard и репозиторий используют одно имя базы.

## Turnstile на сервере

Widget в браузере недостаточен.

Pages Function отправляет token в Cloudflare Siteverify с `TURNSTILE_SECRET_KEY`, а также проверяет hostname из результата.

## Anti-spam

Первая версия строгая:

- без URL
- без email
- без HTML
- без Markdown-ссылок
- без длинных повторов
- без рекламных слов
- honeypot поле

Rate limit есть в памяти и в D1. IP не сохраняется напрямую; используется salted hash.

## SEO

Комментарии загружаются на клиенте, а блок помечен `data-pagefind-ignore`. Они не индексируются как основной текст статьи.

Для корпоративного блога это безопаснее: статья — редакционный контент, комментарии — взаимодействие.

## Итог

Внешний сервис комментариев удобен, но не обязателен.

Если сайт уже работает на Cloudflare Pages, Pages Functions + D1 + Turnstile + Wrangler достаточно для легкой системы комментариев.

## Ссылки

- [Cloudflare Pages: Configuration](https://developers.cloudflare.com/pages/functions/wrangler-configuration/)
- [Cloudflare Pages Functions: Bindings](https://developers.cloudflare.com/pages/functions/bindings/)
- [Cloudflare D1: Prepared statement methods](https://developers.cloudflare.com/d1/worker-api/prepared-statements/)
- [Cloudflare D1: Wrangler commands](https://developers.cloudflare.com/d1/wrangler-commands/)
- [Cloudflare Turnstile: Server-side validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Cloudflare Turnstile: Any Hostname](https://developers.cloudflare.com/turnstile/additional-configuration/hostname-management/any-hostname/)
- [PR #101: комментарии на Cloudflare](https://github.com/acecore-systems/acecore-net/pull/101)

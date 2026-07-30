---
title: "Как вести многоязычный блог с Sveltia CMS"
description: "Практический процесс: редактировать японский исходный материал в Sveltia CMS, создавать PR с переводами через GitHub Actions и GitHub Copilot и публиковать локализованные статические страницы, которые понятнее поисковым системам, чем перевод только в интерфейсе."
date: 2026-06-07T17:00
author: gui
tags: ["Технологии", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: /uploads/acecore-generated/blog-copilot-translation-pipeline.webp
callout:
  type: tip
  title: Перевод интерфейса и многоязычная публикация различаются
  text: "Перевод браузера или виджета помогает читателю, но не создает отдельные URL, title, description, внутренние ссылки, RSS, sitemap и hreflang для каждого языка. Для поисковых систем лучше публиковать переведенный статический HTML."
processFigure:
  eyebrow: Translation Workflow
  title: Поток от Sveltia CMS до PR с переводом
  description: Японский остаётся source of truth, а перевод выносится в PR-процесс на стороне GitHub.
  variant: inline
  steps:
    - title: Редактировать только японский
      description: Обновлять `src/content/blog/{slug}.md` через Sveltia CMS или Markdown.
      icon: i-lucide-file-pen-line
      accent: brand
    - title: Обнаружить CMS commit
      description: "Сделать prefix `cms:` и изменённый path контрактом на стороне GitHub Actions."
      icon: i-lucide-git-commit-horizontal
      accent: amber
    - title: Создать PR с переводом
      description: Передать Copilot source path, locale и правила перевода для генерации переведённых файлов.
      icon: i-lucide-languages
      accent: emerald
    - title: Применить после build
      description: Включать в main только PR, прошедшие Astro build, Pagefind и проверку ссылок.
      icon: i-lucide-check-check
      accent: slate
compareTable:
  title: Разница между переводом интерфейса и генерацией отдельных страниц для каждого языка
  before:
    label: Перевод интерфейса
    items:
      - "Браузер или переводческий widget пользователя переводит страницу при отображении"
      - "URL, title, description и OGP часто остаются на исходном языке"
      - "Трудно выводить языковые страницы отдельно в sitemap, RSS и hreflang"
      - "Текст в общих URL и результатах поиска склоняется к исходному языку"
  after:
    label: Статические многоязычные страницы
    items:
      - "Можно публиковать языковые URL вида `/{locale}/blog/{slug}/`"
      - "title, description, текст, FAQ и структурированные данные могут быть отдельными для каждого языка"
      - "hreflang сообщает поисковым системам о соответствии языковых версий"
      - "RSS, sitemap, внутренние ссылки и Search Console можно проверять по языкам"
checklist:
  title: Что решить при внедрении
  items:
    - text: "Считать японскую статью источником перевода"
      checked: true
    - text: "Согласовать slug переведённых файлов со slug японской статьи"
      checked: true
    - text: "Зафиксировать условия запуска workflow, например commits с `cms:`"
      checked: true
    - text: "Не повреждать при переводе URL, path изображений, блоки кода и ID тегов"
      checked: true
    - text: "Проверять в build вывод hreflang, canonical, RSS и sitemap"
      checked: true
linkCards:
  - href: /ru/blog/cms-selection-and-turnstile/
    title: Руководство по внедрению Sveltia CMS
    description: Как добавить Sveltia CMS в статический сайт Astro.
    icon: i-lucide-badge-check
  - href: /ru/blog/astro-i18n-blog-translation/
    title: Многоязычная архитектура Astro
    description: Маршруты, fallback, hreflang, RSS и sitemap для 9 языков.
    icon: i-lucide-globe-2
faq:
  title: FAQ
  items:
    - question: Достаточно ли перевода интерфейса?
      answer: "Для чтения он полезен. Но для SEO, RSS, sitemap и внутренних ссылок по языкам нужны настоящие локализованные страницы."
    - question: Вредит ли AI-перевод SEO?
      answer: "Проблема не в AI, а в массовой публикации страниц без ценности. Термины, факты, ссылки и естественность нужно проверять."
    - question: Являются ли переводы дублями?
      answer: "Google указывает, что локализованные страницы считаются дубликатами только если основной контент не переведен. Варианты следует связывать через hreflang."
---

Acecore редактирует контент в основном на японском, но публикует блог на 9 языках. Важно различать **перевод текста в интерфейсе** и **публикацию локализованных страниц**.

Перевод браузера помогает пользователю прочитать текущую страницу. Но он не создает `/ru/blog/.../`, локализованные метаданные, RSS, sitemap или hreflang.

Если многоязычность нужна не только для чтения, но и для поиска, перевод должен быть частью процесса публикации.

## Структура

- Японский источник: `src/content/blog/{slug}.md`
- Переводы: `src/content/blog/{locale}/{slug}.md`
- URL: `/blog/{slug}/`, `/en/blog/{slug}/`, `/ru/blog/{slug}/`
- Редактирование: Sveltia CMS
- Перевод: PR от GitHub Copilot
- Публикация: build и review

Sveltia CMS отвечает за редактирование японского source. Переводы идут через pull requests, чтобы сохранить историю, review и CI.

## Когда достаточно UI-перевода

Он подходит для внутреннего чтения, разового просмотра, админских страниц и страниц без SEO-цели.

Это легко поддерживать, потому что нет переведенных файлов. Но также нет языковых страниц для индексации.

## SEO-преимущества статических переводов

Поисковые системы, social previews и RSS-читалки работают с URL и HTML.

Если существует только японская страница, браузер может показать перевод пользователю, но `title`, `description`, structured data, RSS и sitemap останутся японскими.

Со статическими переводами каждый язык получает свой URL.

```txt
/blog/copilot-translation-pipeline/
/en/blog/copilot-translation-pipeline/
/ru/blog/copilot-translation-pipeline/
/de/blog/copilot-translation-pipeline/
```

### 1. Каждый язык можно crawлить напрямую

Google умеет обрабатывать JavaScript, но в документации также описывает ограничения и рекомендует static rendering или server-side rendering как более стабильные варианты. Другие crawlers и RSS-сервисы могут быть менее способны.

### 2. Метаданные локализуются

Frontmatter можно переводить по языкам:

```yaml
title: "Как вести многоязычный блог с Sveltia CMS"
description: "Workflow для переводческих PR с Sveltia CMS и GitHub Copilot."
```

Это влияет на search snippets, OGP, связанные карточки и RSS.

### 3. hreflang связывает версии

Google рекомендует `hreflang`, когда разные URL обслуживают разные языки или регионы. При переводе только в UI отдельного URL нет.

### 4. RSS и sitemap становятся многоязычными

Файлы переводов позволяют генерировать `/ru/rss.xml` и локализованные URL в sitemap.

## Роль Sveltia CMS

Sveltia CMS не переводит. В этом процессе он упрощает редактирование японского источника:

- японские статьи
- авторы
- теги
- японские source JSON
- изображения
- frontmatter: date, FAQ, linkCards

Настройка CMS описана в [руководстве по внедрению Sveltia CMS](/ru/blog/cms-selection-and-turnstile/).

## Правила для Copilot

В переводческом PR нужно явно указать, что сохранять, а что локализовать.

```md
Keep:

- slug
- image path
- author id
- tag ids
- external URLs
- code blocks

Localize:

- title
- description
- FAQ
- body text
- internal blog URLs when locale-specific URLs exist
```

## Уроки из PR

- Старые статьи продолжали упоминать Pages CMS после перехода на Sveltia CMS.
- Если `date` старый, переписанная статья не появится наверху блога.
- Slug должен оставаться одинаковым между языками.
- Внутренние ссылки должны вести в locale читателя.
- AI ускоряет перевод, но review остается обязательным.

## Ссылки

- [Google Search Central: Localized Versions of your Pages](https://developers.google.com/search/docs/advanced/crawling/localized-versions?hl=en&rd=1&visit_id=638856769088389068-716743185)
- [Google Search Central: Managing Multi-Regional and Multilingual Sites](https://developers.google.com/search/docs/advanced/crawling/managing-multi-regional-sites)
- [Google Search Central: JavaScript SEO Basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google Search Central: Spam Policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [Руководство по внедрению Sveltia CMS](/ru/blog/cms-selection-and-turnstile/)

## Итог

Перевод интерфейса помогает читать страницу. Локализованные статические страницы превращают каждый язык в настоящий контент сайта.

Sveltia CMS редактирует японский source, GitHub Copilot создает PR с переводами, а Astro build проверяет результат перед публикацией.

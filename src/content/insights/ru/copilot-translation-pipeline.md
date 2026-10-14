---
title: "Как вести многоязычный блог с Sveltia CMS"
description: "Восемь статических переводов из японского источника: защита чисел, URL и кода в OpenAI Batch, проверка всех результатов до записи, PR, CI и публикация через GitHub."
date: 2026-06-07T17:00
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
tags: ["Технологии", "GitHub Copilot", "i18n", "CMS", "SEO"]
image: "/images/insights/covers/copilot-translation-pipeline-cover-v2.webp"
callout:
  type: tip
  title: Перевод интерфейса и многоязычная публикация различаются
  text: "Перевод браузера или виджета помогает читателю, но не создает отдельные URL, title, description, внутренние ссылки, RSS, sitemap и hreflang для каждого языка. Для поисковых систем лучше публиковать переведенный статический HTML."
processFigure:
  eyebrow: Translation Workflow
  title: "От японского источника к проверенному PR"
  description: "Восстановить числа, URL и код; проверить все перед записью."
  variant: inline
  steps:
    - title: "Редактировать японский"
      description: "Использовать текущий main, объединять правки."
      icon: i-lucide-file-pen-line
      accent: brand
    - title: "Защитить и отправить Batch"
      description: "Заменить числа, URL, placeholders и код tokens."
      icon: i-lucide-shield-check
      accent: amber
    - title: "Все проверить, затем записать"
      description: "Сверить sourceHash, tokens и содержание; записать сбои и остановиться."
      icon: i-lucide-languages
      accent: emerald
    - title: "PR, CI и публикация"
      description: "Публиковать через GitHub и проверять содержание."
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
    - text: "Запускать перевод по изменениям японского источника в main"
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

Начните многоязычный блог с генерации HTML из переводов показательной статьи и проверки текста, title, description и внутренних ссылок. По [Google: Localized Versions](https://developers.google.com/search/docs/specialty/international/localized-versions) связывайте только существующие языковые версии, отдельно принимая результат службы перевода и готовые публичные страницы.

> **Проверено 14 октября 2026 года:** Для переводов сейчас используется OpenAI Batch. Шаги Copilot ниже сохранены как отчет за июнь 2026 года. Актуальные схемы защищают источник и проверяют все результаты до записи.

## Текущий процесс: защита, проверка и PR

На Systems после обновления японской статьи или UI в main ожидаются 15 минут, затем [workflow отправки](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/submit-openai-translation-batch.yml) использует текущий main. [Сбор](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/collect-openai-translation-batch.yml) запланирован на минуты 2, 17, 32 и 47 каждого часа, сверяет sourceHash и создает PR. [Merge-workflow](https://github.com/acecore-systems/acecore-systems/blob/main/.github/workflows/merge-openai-translation-pr.yml) проводит подходящий PR через CI и существующую публикацию GitHub. Плановое время, завершение Batch, merge и публикация различаются.

Перед отправкой числа, URL, существующие placeholders, inline code и fenced code заменяются уникальными tokens. При сборе оригиналы восстанавливаются из совпадающего японского источника; отсутствующие, повторные, измененные и добавленные tokens отклоняются. Защита не дает модели менять эти детали, но проверка после восстановления и review содержания сохраняются.

[Документация OpenAI Batch](https://developers.openai.com/api/docs/guides/batch) допускает другой порядок выхода; `custom_id` сопоставляет язык, source path и sourceHash. [Изменение защиты и сбора](https://github.com/acecore-systems/acecore-systems/pull/131) проверяет все результаты до начала записи. Поздний неверный, повторный или устаревший результат не оставляет ранние переводы частично примененными. Artifact хранит язык, source path, Batch ID и причину. Это не гарантия файловой транзакции от дискового сбоя при записи.

Проверены 27 тестов и офлайн-цикл защиты и восстановления для 55 японских источников × 8 locale, 440 результатов. Это не новая полная трансляция через API модели. Существующие переводы меняются с японским в том же PR, затем обновляется hash форматированного источника; не только hash.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-copilot-translation-pipeline">
  <figcaption>
    <strong id="diagram-copilot-translation-pipeline">Сверить защищенный источник и все результаты</strong>
    <span>Сбой проверки не должен менять лишь часть языков. Batch завершен — еще не опубликовано.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Защита источника</strong>
      <span>Уникальные tokens для чисел, URL и кода.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Проверка источника и всех результатов</strong>
      <span>Сверить custom_id, sourceHash и tokens, восстановить.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>PR на публикацию</strong>
      <span>Запись после проверки, затем CI и review.</span>
    </li>
  </ol>
</figure>

## История внедрения в июне 2026 года

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

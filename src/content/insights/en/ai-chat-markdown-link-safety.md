---
title: "Implementation Design for Safely Rendering Markdown Links in AI Chat Responses"
description: "Implementation notes on safely converting Markdown links in AI chat responses to HTML. By allowing whitespace around URLs and treating trimming, allowlisting, DOM creation, fallbacks, and test cases as separate concerns, you can build a renderer that is easy to reuse on other sites."
date: 2026-06-07T14:30
lastUpdated: "2026-11-12T00:00:00+09:00"
author: gui
tags: ["Technology", "Website", "AI", "Security", "Astro"]
image: "/images/insights/covers/ai-chat-markdown-link-safety-cover-v2.webp"
callout:
  type: tip
  title: Key Takeaways
  text: AI responses are not trusted HTML. Even when Markdown links are useful, trim each URL before checking it against an allowlist, and leave URLs that cannot be allowed as text rather than turning them into links.
processFigure:
  title: AI Response Link Rendering Flow
  steps:
    - title: Text
      description: Treat model responses as plain text first.
      icon: i-lucide-message-square-text
      accent: brand
    - title: Parse
      description: Use a small parser to pick out only the Markdown syntax you need.
      icon: i-lucide-brackets
      accent: amber
    - title: Validate
      description: Trim href and allow only internal URLs and approved domains.
      icon: i-lucide-shield-check
      accent: emerald
    - title: Render
      description: Create only safe elements with the DOM API instead of innerHTML.
      icon: i-lucide-code-2
      accent: slate
compareTable:
  title: Decisions to Make When Rendering Markdown Links
  before:
    label: Naive rendering
    items:
      - Directly inserting AI responses into innerHTML
      - Trying to implement the entire Markdown specification at once
      - Failing to turn links into links because of whitespace around URLs
      - "Treating external URLs and javascript: the same way"
  after:
    label: Small-scale, safe rendering
    items:
      - Treat responses as text and create DOM elements only for the syntax you need
      - Support only the Markdown features used in chat
      - Validate URLs for safety after trimming them
      - Display URLs that cannot be allowed as text rather than turning them into links
checklist:
  title: Implementation Checklist
  items:
    - text: Do not trust AI responses as HTML
    - text: Allow whitespace around URLs in Markdown links
    - text: Always trim href before validating it
    - text: Allow only internal paths, same-origin URLs, and required external domains
    - text: Explicitly set target and rel on external links
    - text: Leave links that cannot be allowed as text
    - text: Test unsafe URLs and malformed Markdown, not just the happy path
linkCards:
  - href: /blog/astro-ai-contact-chat/
    title: Technical Design for an AI Chat for Contact Requests
    description: The parent article covers AI responses, API boundaries, and prompt controls.
    icon: i-lucide-sparkles
  - href: /insights/cloudflare-pages-security/
    title: Cloudflare Pages Security Settings
    description: A related article covering CSP and security headers.
    icon: i-lucide-shield
  - href: /contact/
    title: Contact Us
    description: The live contact flow featuring the AI chat and form.
    icon: i-lucide-message-square
faq:
  title: Frequently Asked Questions
  items:
    - question: Is using markdown-it or marked enough?
      answer: Even when you use a library, you still need to separately decide how to handle its HTML output, which link destinations to allow, how to set target and rel, and how to reject unsafe URLs. For chat use, a small custom renderer may be sufficient.
    - question: Does allowing whitespace around URLs create a security risk?
      answer: The key is not whether whitespace itself is allowed, but what you allow after trimming. If you validate the trimmed href against an allowlist, you can handle variations in the model's formatting while preserving security.
    - question: Should URLs that cannot be allowed be removed?
      answer: In many cases, displaying them as text rather than removing them makes debugging easier and preserves the response context for users. However, if your policy is to hide suspicious strings completely, you may instead choose to drop the entire link.
---

If a link in an AI response remains a plain string, first pass the same input through parsing, URL validation, and DOM rendering in sequence to identify which stage is failing. Use a text-oriented API such as [MDN: textContent](https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent) for displayed text, and keep the decision to turn a URL into a link separate from HTML interpretation. This is the starting point for applying the approach to an existing chat.

If an AI chat responds with “For more details, see the [service list](/services/),” the link may not render, leaving the Markdown string as-is.

Acecore's website also encountered Markdown links with whitespace around URLs in responses from its contact AI chat, so we adjusted the renderer in [the PR that fixed Markdown link rendering in the AI chat](https://github.com/acecore-systems/acecore-net/pull/99).

Using that small fix as a starting point, this article summarizes how to safely convert AI responses into DOM.

## AI responses are not trusted HTML

First, treat AI responses as text, not HTML.

With a chat UI, it's tempting to support links, bold text, and bullet lists. But if you put a response directly into `innerHTML`, you are letting the browser interpret a string generated by the model.

What's needed is not a complete implementation of Markdown. It's a small parser that picks out only the syntax needed in chat and creates only safe DOM.

## The problem is not just whitespace

The immediate issue was a link like this.

```md
[サービス一覧](/services/)
```

These make sense to a human as Markdown, but if a regular expression captures the URL portion as a “string with no whitespace,” it won't match.

Before the fix, the logic looked like this.

```js
/\[([^\]]+)\]\(([^)\s]+)\)/;
```

`[^)\s]+` does not allow whitespace, so it cannot pick up `( /services/ )` as a link. We therefore allow whitespace at the start and end inside the parentheses, then trim the URL that will actually be used.

```js
/\[([^\]]+)\]\(\s*([^)]+?)\s*\)/;
```

The important thing is not to stop at loosening the regular expression. After loosening it, always normalize the URL and perform a safety check.

## Trim href before validating it

Keep the link-generation order fixed.

1. Extract the label and raw href from Markdown
2. Trim the raw href with `trim()`
3. Validate the trimmed href against the allowlist
4. Create `<a>` only if the URL is allowed

```js
const href = String(rawHref || "").trim();

if (label && isSafeMarkdownHref(href)) {
  const link = document.createElement("a");
  link.href = href;
  link.rel = "noopener noreferrer";

  if (/^https?:\/\//i.test(href)) {
    link.target = "_blank";
  }

  link.textContent = label;
  parent.appendChild(link);
}
```

Validate the value that will actually go into the DOM, not the value from before `trim()`. If the value you validate differs from the value you render, the safety check loses its meaning.

## Define allowlists per product

The URLs an AI chat should be allowed to point to vary from site to site.

For Acecore's contact AI, we generally limit them to the following.

| Type                | Example                   | Decision                                       |
| ------------------- | ------------------------- | ---------------------------------------------- |
| Internal path       | `/services/`              | Allow                                          |
| Same origin         | `https://acecore.net/...` | Allow                                          |
| Official LINE       | `https://lin.ee/...`      | Allow because the purpose is clear             |
| mailto              | `mailto:info@acecore.net` | Allow only specific fixed recipients as needed |
| tel                 | `tel:0120987370`          | Allow only specific fixed numbers as needed    |
| Other external URLs | Any URL                   | Generally, do not turn them into links         |

An implementation example.

```js
function isSafeMarkdownHref(rawHref) {
  const href = String(rawHref ?? "").trim();
  if (!href || /[\u0000-\u001f\u007f\\]/u.test(href)) return false;
  if (href === "mailto:info@acecore.net" || href === "tel:0120987370") {
    return true;
  }

  try {
    if (href.startsWith("/")) {
      if (href.startsWith("//")) return false;
      const url = new URL(href, window.location.origin);
      return (
        url.origin === window.location.origin && !url.username && !url.password
      );
    }

    const url = new URL(href);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      !url.port &&
      [
        window.location.origin,
        "https://acecore.net",
        "https://lin.ee",
      ].includes(url.origin)
    );
  } catch {
    return false;
  }
}
```

This function should be tailored to each site. A recruitment site might allow job platforms, an e-commerce site might allow payment or delivery-tracking services, and a SaaS site might allow documentation or status pages.

## Leave links that cannot be allowed as text

How to handle links that fail the safety check is also part of the design.

For the contact AI, leaving Markdown that cannot be turned into a link as its original text is easier to work with than removing it entirely. Users retain the context, and developers can see what the AI produced.

In other words, the parser's responsibility is not only to “create safe links,” but also to “output them as ordinary text when they cannot be created safely.”

## Prepare test cases from the start

With this kind of renderer, checking only the happy path can cause you to miss issues.

At a minimum, test the following cases.

| Input                               | Expected result                          |
| ----------------------------------- | ---------------------------------------- |
| `[サービス一覧](/services/)`        | Becomes an internal link                 |
| `[サービス一覧]( /services/ )`      | Trimmed and rendered as an internal link |
| `[LINE]( https://lin.ee/example )`  | Opens as an external link                |
| `[危険](javascript:alert(1))`       | Not rendered as a link                   |
| `[外部](https://example.com/)`      | Not rendered as a link unless allowed    |
| `[壊れたリンク](/services/`         | Displayed as text                        |
| `` `code` と [link]( /contact/ ) `` | code and link are rendered separately    |

In PR #99, we confirmed that `[サービス一覧]( /services/ )`, `[サービス一覧](/services/)`, and `[LINE]( https://lin.ee/DjIrdqj )` are treated as the same URL.

## The decision not to implement all of Markdown

The Markdown needed in an AI chat can be limited.

- Paragraphs
- Bullet lists
- Bold
- Inline code
- Links

Supporting tables, images, HTML, footnotes, and deeply nested headings makes the renderer's responsibilities grow rapidly. In a chat UI, providing readable guidance is enough.

If the need arises, using an established Markdown library is another option. Even then, decide separately whether to allow HTML, how to restrict URLs, and what to add to external links.

## Summary

Rendering Markdown links in an AI chat may look like a small visual fix. In reality, though, it's a boundary-design question about how much to trust AI output.

Key implementation points:

- Treat AI responses as text, not HTML
- Create DOM only for the Markdown features you need
- Allow whitespace around URLs in Markdown links
- Trim href before performing a safety check
- Use an allowlist to permit only internal URLs and necessary external URLs
- Leave links that cannot be allowed as text
- Test malformed Markdown and unsafe URLs

The more AI is integrated into a site's user flows, the more important it becomes to decide how response text is rendered. Convenient Markdown support and safe link controls should be handled together in the same implementation.

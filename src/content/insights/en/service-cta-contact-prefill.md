---
title: "Technical design for carrying service CTA context into a contact form"
description: "An implementation design for carrying the context a visitor was reading on a service page into the contact form. It covers mini CTAs in an Astro site, the URL parameter contract, initial form-category selection, subject prefill, multilingual URLs, GA measurement, and generated-HTML checks in a reusable form."
date: 2026-06-07T13:00
author: gui
tags: ["Technology", "Website", "Services", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Key point of this article
  text: A CTA on a service page is a weak journey if it merely sends visitors to a form. Passing the service context they were reading through the URL, then initializing the inquiry category and subject in the form, reduces uncertainty during entry and sorting work on the receiving side at the same time.
processFigure:
  title: Flow for passing context from a service CTA to the form
  steps:
    - title: Service
      description: Give the CTA in each service section a service key.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Pass it through a URL contract such as /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: Initially populate the matching inquiry category and subject in the form.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: The receiving team can identify the service context from the inquiry category alone.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Difference when connecting a CTA to a form
  before:
    label: Merely sending visitors to the form
    items:
      - The visitor must select the same service name again in the form
      - The subject remains blank, making the nature of the inquiry unclear
      - The receiving team must read the message before identifying the relevant service
      - Measurement of each service CTA remains ambiguous
  after:
    label: Carrying the context forward
    items:
      - The inquiry category can be preselected from the CTA service key
      - The service name can be placed in the subject to organize the inquiry
      - The receiving team can classify it by looking at the inquiry category
      - The GA label and URL parameters make each CTA easier to review
checklist:
  title: Design checklist for adoption
  items:
    - text: Use only short, stable service keys in URL parameters
    - text: Use operationally stable values, rather than user-facing labels, as submitted form values
    - text: Fall back to general service inquiries for an unknown service key
    - text: Prefill the subject only when it is blank
    - text: Before adding hidden fields, check whether the existing inquiry category can provide the classification
    - text: Generate the contact URL for each locale on the server
    - text: Add a GA label and location to each CTA so its performance can be measured
    - text: Check the CTA count, option count, and absence or presence of hidden fields in the generated HTML after the build
linkCards:
  - href: /services/
    title: Services
    description: The entry point to the journey containing service-specific CTAs.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contact
    description: The form that receives URL parameters and initializes the category and subject.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Technical design of an inquiry AI chat
    description: A related article about a conversational journey that helps visitors identify where to ask.
    icon: i-lucide-sparkles
faq:
  title: Frequently asked questions
  items:
    - question: Why not send the target service in a hidden field?
      answer: This avoids increasing the number of fields the receiving team must review and lets the existing inquiry category provide the classification. Every extra form field also adds checks to operations and notification templates.
    - question: Is it safe if someone tampers with the URL parameters?
      answer: An unknown service key falls back to general service inquiries. Because the submitted value is selected from the options in the form, the URL value itself is never used directly as a submitted value.
    - question: How should this work on a multilingual site?
      answer: Generate CTA destinations for each locale and translate the labels displayed in the form. Meanwhile, keeping submitted values aligned to stable Japanese classification names helps the receiving operation remain consistent.
---

When a visitor reading a service page decides, "I want to ask about this," simply sending them to a contact form loses some of the context.

The visitor must reselect the service type in the form and write the subject again. The receiving team also cannot easily tell whether the message concerns website production, server operations, or Aceserver until they read the body.

On the Acecore website, we improved this journey in the [PR that carries the target of a service CTA into the contact form](https://github.com/acecore-systems/acecore-net/pull/100). This article presents it not only as an Astro implementation record, but also as a journey design that can be reused on other websites.

## The goal is not merely to reduce form entry

The purpose of this implementation is not simply to make the form appear easier by filling fields automatically.

The essential goal is to pass the context created on the service page correctly into both the contact form and the receiving operation.

| Perspective          | What should improve                                                   |
| -------------------- | --------------------------------------------------------------------- |
| Visitor              | Reduce the need to select the service they were reading again         |
| Form                 | Initialize the inquiry category and subject to match the consultation |
| Receiving team       | Make the target easier to classify from the inquiry category alone    |
| Measurement          | Make it easier to trace which service CTA started the inquiry         |
| Multilingual journey | Send the visitor to a contact URL matching the locale                 |

Although it appears as a small mini CTA, the design scope spans the CTA, URL, form, translation, measurement, and receiving operation.

## Isolate responsibilities in a CTA component

Place a "Contact us about this service" CTA at the end of each service section.

The first thing to avoid is writing the same link generation and GA attributes directly into every section of the service page. If there are seven services, the same implementation appears seven times. That makes omissions likely when the wording or URL specification changes.

We therefore created `ServiceSectionActions` to centralize the contact CTA.

```astro
---
import Icon from "./Icon.astro";
import { t, getLocalizedUrl, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  gaLabel: string;
  gaLocation: string;
  serviceKey: string;
}

const { locale, gaLabel, gaLocation, serviceKey } = Astro.props;
const u = (path: string) => getLocalizedUrl(path, locale);
const contactUrl = `${u("/contact/")}?category=service&service=${encodeURIComponent(serviceKey)}#contact-form`;
---

<a
  href={contactUrl}
  class="ac-btn-outline gap-2 text-sm sm:w-auto"
  data-ga-event="cta_click"
  data-ga-label={gaLabel}
  data-ga-location={gaLocation}
  data-ga-destination={contactUrl}
>
  <Icon name="message-circle" class="text-sm" />
  {t(locale, "pages.services.miniCta")}
</a>
```

This component has three responsibilities:

- Generate a contact URL matching the locale
- Put the service key into a URL parameter
- Carry the label and location used for GA measurement

Because a CTA is a user action point, it is also a measurement point, not just UI. We retain `data-ga-label` and `data-ga-location` so we can later see which service initiated the inquiry.

## Make URL parameters the contract with the form

The values passed from the CTA to the contact form are URL parameters.

```txt
/contact/?category=service&service=web#contact-form
```

The important point is not to put a display label in the URL.

A label such as `Webサイト制作・運用について` is affected by translation, differences in wording, and future name changes. Put only a short service key such as `web` or `server` in the URL.

| Parameter  | Role                                                       |
| ---------- | ---------------------------------------------------------- |
| `category` | Indicates the entry point for processing a service inquiry |
| `service`  | A stable key representing the target service               |
| hash       | Used to scroll to the form                                 |

Users can edit URL parameters. For that reason, the form does not use a URL value directly as a submitted value; instead, it maps the value to an existing option.

## Keep a classification table on the form side

The contact form keeps service classifications in an array.

```ts
const serviceCategoryOptions = [
  {
    key: "server",
    value: "サーバー構築・運用について",
    label: t(locale, "pages.contact.formCategoryServiceServer"),
    subject: t(locale, "pages.services.server.title"),
  },
  {
    key: "web",
    value: "Webサイト制作・運用について",
    label: t(locale, "pages.contact.formCategoryServiceWeb"),
    subject: t(locale, "pages.services.web.title"),
  },
];
```

`key`, `value`, `label`, and `subject` each have a different role.

| Field     | Role                                                                            |
| --------- | ------------------------------------------------------------------------------- |
| `key`     | A stable identifier used to look up the URL parameter                           |
| `value`   | The inquiry category delivered to the receiving team when the form is submitted |
| `label`   | The translated option displayed on screen                                       |
| `subject` | The service name used to initialize the subject                                 |

On a multilingual site, `label` is translated for the locale. Meanwhile, because `value` is used for classification by the receiving team, we keep it as a stable Japanese value.

This decision varies by product. If a CRM or external form supports multilingual classifications, `value` can also vary by locale. When the goal is to keep receiving operations simple, as in this case, separating the display label from the submitted value is easier to manage.

## Put data attributes on each option

The form select outputs an option for each service.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {
    serviceCategoryOptions.map((option) => (
      <option
        value={option.value}
        data-service-key={option.key}
        data-service-subject={option.subject}
      >
        {option.label}
      </option>
    ))
  }
</select>
```

`data-service-key` is used to compare the option with `service` in the URL. `data-service-subject` is used to create the subject.

Again, the important point is not to place the URL value directly in `category.value`. Always selecting an option already present in the select prevents an unknown service key or an invalid value from entering the submitted value.

## Prefill on the client

A small script initializes the form after the page loads.

```js
function initContactServicePrefill() {
  const form = document.getElementById("contact-form");
  if (!form || form.dataset.servicePrefillInitialized === "true") return;

  form.dataset.servicePrefillInitialized = "true";

  const url = new URL(window.location.href);
  const requestedCategory = url.searchParams.get("category");
  const requestedService = url.searchParams.get("service") || "";
  const category = document.getElementById("category");
  const subject = document.getElementById("subject");

  if (
    requestedCategory === "service" &&
    category instanceof HTMLSelectElement
  ) {
    const serviceOption = Array.from(category.options).find((option) => {
      return option.dataset.serviceKey === requestedService;
    });

    category.value = serviceOption?.value || "サービス全般について";
    category.dispatchEvent(new Event("input", { bubbles: true }));
    category.dispatchEvent(new Event("change", { bubbles: true }));

    if (
      serviceOption &&
      subject instanceof HTMLInputElement &&
      !subject.value.trim()
    ) {
      const template = form.dataset.serviceSubjectTemplate || "{service}";
      const serviceName =
        serviceOption.dataset.serviceSubject ||
        serviceOption.textContent?.trim() ||
        "";
      subject.value = template.replace("{service}", serviceName);
    }
  }
}
```

There are four implementation points:

- Check `data-service-prefill-initialized` to avoid initializing twice
- Run the process only when `category=service`
- Fall back to `サービス全般について` for an unknown service key
- Prefill the subject only when it is blank

The final point—only filling an empty subject—is important. If browser autofill or a back navigation has retained a subject, overwriting it without permission creates a poor experience.

When using Astro View Transitions or client navigation, initialize on `astro:page-load` as well as on the normal initial load.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Move to the form with the hash

The CTA URL includes `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Because a contact page can also contain FAQs, LINE, explanatory text, and other contact methods, it is more natural for visitors from a service CTA to move directly to the form.

When the form performs initialization, however, the scroll timing needs some attention. We use `requestAnimationFrame` so scrolling happens after the element has rendered.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Moving to the form is a small behavior, but visitors become confused when the CTA's intent and the visible form position do not match. Journey design treats the URL, initial selection, and scroll position as a single unit.

## Why we did not add a hidden field

We did not add a hidden `相談対象サービス` field in this implementation.

The reason was to make the target service identifiable from the inquiry category alone.

Adding form fields also adds checks:

- Whether to include the field in notification emails
- Whether to add a column to an admin screen or spreadsheet
- Whether it affects existing automatic-reply templates
- Whether it is handled by CRM integration or webhooks
- How multilingual display names and submitted values should be separated

If existing fields can express the required information, not adding another field makes operations more stable. Here, we split `お問い合わせ種別` into general service inquiries and service-specific categories, allowing the receiving team to identify the target.

Of course, a hidden field may be appropriate when the requirements include selecting multiple services, retaining an advertising campaign ID, or using a separate CRM field.

## Approach for multilingual sites

When creating this journey on a multilingual site, separating three values avoids confusion.

| Type            | Example                       | Locale-dependent      |
| --------------- | ----------------------------- | --------------------- |
| URL key         | `web`, `server`, `aceserver`  | No                    |
| Display label   | `About Website Design`, etc.  | Yes                   |
| Submitted value | `Webサイト制作・運用について` | Depends on operations |

It is more stable not to translate the URL key because links are shared, measured, and matched on the form side.

Always translate the display label because it is what visitors see in the form.

Set the submitted value according to operations. We use stable Japanese values in this implementation. Designing multilingual display separately from post-submission internal operations makes the form easier to manage.

The translation flow itself is also described in [How to operate a multilingual blog with Sveltia CMS](/blog/copilot-translation-pipeline/).

## Check the generated HTML

Inspecting only the component is insufficient for this type of implementation. Check the HTML after the build to confirm that the links and options are actually generated.

We checked the following:

- Seven service-specific CTAs appear on `/services/`
- Every CTA contains `?category=service&service=...#contact-form`
- Seven options with `data-service-key` appear on `/contact/`
- General service inquiries and the service-specific categories are present
- No hidden `相談対象サービス` field is present

For example, use `rg` against the generated HTML.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

The final check verifies that something which must not appear is absent. A form change should verify not only what was added, but also what the design deliberately chose not to add.

## Division of roles with the AI chat

This journey works well with the [technical design for the inquiry AI chat](/blog/astro-ai-contact-chat/), but their roles differ.

| Journey     | What it does well                                            |
| ----------- | ------------------------------------------------------------ |
| AI chat     | Uses conversation to help determine which service to consult |
| Service CTA | Passes the context of the service being read into the form   |
| Form        | Receives the formal inquiry and keeps a record               |

The AI chat is strong when visitors are still uncertain. By contrast, once someone has finished reading a service page and decided to ask about that service, sending them directly to the form without another conversation is more natural.

When adding journeys, do not give all of them the same role. Use conversation, CTAs, and forms according to the visitor's state.

## Summary

Carrying context from a service page into a contact form is more effective than its small visual change suggests.

The important design points were:

- Componentize the CTA to centralize URL generation and measurement attributes
- Put a stable service key in the URL instead of a display label
- Map the service key to an option on the form side
- Separate the submitted value, display label, and service name used for the subject
- Fall back to general service inquiries for an unknown service key
- Prefill the subject only when it is blank
- Classify using the inquiry category without adding another hidden field
- Verify the link count, option count, and absence of unnecessary fields in generated HTML after the build

Improving a contact form is not merely about reducing input fields. Carrying the context the visitor was reading all the way to the receiving team makes real inquiry handling easier.

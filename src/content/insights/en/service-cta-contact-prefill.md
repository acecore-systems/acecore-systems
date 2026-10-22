---
title: "Technical Design for Carrying Context from Service CTAs into the Contact Form"
description: "An implementation design for carrying the context a user was reading on a service page into the contact form. It organizes reusable patterns for other sites, covering mini CTAs on Astro sites, the URL parameter contract, initial inquiry-type selection, subject prefill, multilingual URLs, GA measurement, and generated HTML verification."
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Technology", "Website", "Services", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Key Takeaways
  text: A CTA on a service page is a weak path if it only sends users to a form. Pass the service context they were reading through the URL, then initialize the inquiry type and subject on the form. This reduces both hesitation during entry and triage work for the receiving team.
processFigure:
  title: Flow for Passing Context from a Service CTA to the Form
  steps:
    - title: Service
      description: Give each service section's CTA a service key.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Pass it through a URL contract, such as /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: Initialize the matching inquiry type and subject in the form.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: The receiving team can identify the service context from the inquiry type alone.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: What Changes When CTAs and Forms Are Connected
  before:
    label: When simply sending users to the form
    items:
      - Users have to select the same service name again in the form
      - The subject is left blank, making it difficult to tell what the inquiry is about
      - The receiving team has to read the message to identify the target service
      - It is difficult to measure the effectiveness of CTAs for individual services
  after:
    label: When context is carried forward
    items:
      - The inquiry type can be selected initially from the CTA's service key
      - The service name can be added to the subject to organize the inquiry
      - The receiving team can classify the inquiry by its type
      - GA labels and URL parameters make it easier to review each CTA's performance
checklist:
  title: Implementation Design Checklist
  items:
    - text: Use only short, stable service keys in URL parameters
    - text: Use operationally stable values for submitted form values, not user-facing labels
    - text: Fall back to general services for unknown service keys
    - text: Prefill the subject only when it is blank
    - text: Before adding hidden fields, check whether existing inquiry types can provide the classification
    - text: Generate locale-specific contact URLs on the server side
    - text: Attach a GA label and location to each CTA so its performance can be measured
    - text: After the build, verify the number of CTAs and options, and whether hidden fields are present, in the generated HTML
linkCards:
  - href: /services/
    title: Services
    description: The entry point for pathways with CTAs for individual services.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Contact
    description: A form that accepts URL parameters and initializes the inquiry type and subject.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Technical Design for an AI Contact Chat
    description: A related article about a path that uses conversation to clarify where to direct an inquiry.
    icon: i-lucide-sparkles
faq:
  title: Frequently Asked Questions
  items:
    - question: Why not send the service being asked about in a hidden field?
      answer: "As of 2026 6, the design classified inquiries using only the existing inquiry type and did not add hidden fields. The current Systems form stores service, from, and entry in integration hidden fields, separately from the classification value."
    - question: Is it safe if URL parameters are tampered with?
      answer: Unknown service keys fall back to general services. Since the submitted value is selected from the form's options, the URL value is not used directly as the submitted value.
    - question: How should this work on a multilingual site?
      answer: Generate a locale-specific destination URL for each CTA and translate the labels shown in the form. At the same time, using stable Japanese values for submissions helps keep operations consistent for the receiving team.
---

> **Added in 2026 9:** The examples below for `ServiceSectionActions` and `service=web` document the configuration used on the official Acecore site in 2026 6. On the current Acecore Systems site, the [service detail CTAs](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro) add `category`, `service`, `from`, and `entry`, and the [contact form](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro) validates a short service key and initializes the inquiry type and subject. The current implementation also uses hidden fields for measurement and integrations, so do not copy the design below that avoids hidden fields as the current specification. The principle of not trusting URL values and mapping them to the form's choices remains valid.

When a user reading a service page thinks, I want to ask about this, simply sending them to the contact form loses some of the context.

The user has to select the service type again in the form and write the subject again. The receiving team also has difficulty determining whether the inquiry is about web development, server operations, or Aceserver until they read the message.

On the Acecore site, we improved this path with a [PR to carry inquiry context from a service CTA to the contact form](https://github.com/acecore-systems/acecore-net/pull/100). This article organizes the approach not only as an implementation record for Astro, but also as a pathway design that can be used on other websites.

## Verify Form Initialization from a Single CTA

Test a valid service key, an unknown key, and a back-navigation case where the subject is already filled in. Confirm that the type maps to an approved option and that the subject is not overwritten; use the same value contract for locale-specific URLs. Do not put personal information or free-form text in URLs. Pass context using only short identifiers.

[MDN URLSearchParams: URL parameter reading specification](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## The Goal Is Not Merely to Reduce Form Entry

The goal of this implementation is not just to autofill form fields and make the process feel easier.

The real goal is to pass the context created on the service page accurately to the contact form and the operations that handle incoming inquiries.

| Perspective       | What to Improve                                                               |
| ----------------- | ----------------------------------------------------------------------------- |
| User              | Reduce the effort of selecting the service they were just reading about again |
| Form              | Initialize the inquiry type and subject to match the inquiry                  |
| Receiving team    | Make it easier to classify the inquiry by its type alone                      |
| Measurement       | Make it easier to track which service CTA started the inquiry                 |
| Multilingual path | Send users to a contact URL that matches their locale                         |

These may look like small mini CTAs, but the design spans the CTA, URL, form, translation, measurement, and intake operations.

## Separate Responsibilities into a CTA Component

Place a CTA at the end of each service section that says, Consult us about this service.

The first thing to avoid is hardcoding the same link generation and GA attributes into every section of the service page. If there are 7 services, the same pattern appears 7 times. This makes it easy to miss a section when changing the wording or URL specification.

So we created an `ServiceSectionActions` to consolidate the contact CTAs.

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

This component has 3 responsibilities.

- Generate a contact URL that matches the locale
- Add the service key to the URL parameters
- Add a label and location for GA measurement

A CTA is a point of user action, so it is also a measurement point, not just UI. We keep `data-ga-label` and `data-ga-location` so we can later see which service an inquiry started from.

## Make URL Parameters the Contract with the Form

We used URL parameters to pass values from the CTA to the contact form.

```txt
/contact/?category=service&service=web#contact-form
```

The important point here is not to put display text in the URL.

Display text such as `Webサイト制作・運用について` is affected by translation, variations in wording, and future name changes. Put only a short service key such as `web` or `server` in the URL.

| Parameter  | Role                                                          |
| ---------- | ------------------------------------------------------------- |
| `category` | Indicates the entry point for processing as a service inquiry |
| `service`  | Stable key identifying the target service                     |
| hash       | Used to scroll to the form                                    |

Users can edit URL parameters. That is why the form does not use the URL value directly as the submitted value, but maps it to an existing option.

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">Flow for Passing an Inquiry to a Management Record</strong>
    <span>This shows the implementation stages of the path. Actual contact with customers and completion of handling must be verified separately.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>Read CTA Context</strong>
      <span>Map a stable service key to the multilingual display URL and the allowlist of approved form options.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>Validate Input and Permissions</strong>
      <span>Prefill the subject only if it is blank, and verify the user's identity and operation permissions in the API as well.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>Pass It to the Intake Record</strong>
      <span>Record the intake in the CRM history and follow-up tasks, and track the assignee's actual completion of handling as a separate status.</span>
    </li>
  </ol>
</figure>

## Maintain a Classification Table on the Form Side

The contact form maintains service-specific classifications in an array.

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

`key`, `value`, `label`, and `subject` each have different roles.

| Field     | Role                                                |
| --------- | --------------------------------------------------- |
| `key`     | Stable identifier used to look up the URL parameter |
| `value`   | Inquiry type received when the form is submitted    |
| `label`   | Translated option shown on screen                   |
| `subject` | Service name used for the initial subject value     |

On multilingual sites, `label` is translated to match the locale. By contrast, `value` is used by the receiving team for classification, so it was kept as a stable Japanese value.

This is a decision that can vary by product. If the CRM or external form supports multilingual classifications, the value can also vary by locale. When the goal is to keep operations simple for the receiving team, separating the display label from the submitted value is easier to manage.

## Add Data Attributes to the Options

The form's select outputs options for each service.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {serviceCategoryOptions.map((option) => (
    <option
      value={option.value}
      data-service-key={option.key}
      data-service-subject={option.subject}
    >
      {option.label}
    </option>
  ))}
</select>
```

`data-service-key` is used to match the URL's `service`. `data-service-subject` is used to build the subject.

The key point here is not to put the URL value directly into `category.value`. By always selecting an option from the select, unknown service keys and invalid values are kept out of the submitted value.

## Prefill on the Client Side

Form initialization is handled by a small script that runs after the page loads.

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

The implementation has the following 4 key points.

- Check `data-service-prefill-initialized` to avoid double initialization
- Run only when `category=service`
- Fall back to About services in general for an unknown service key
- Prefill the subject only when it is blank

The last point, only prefilling the subject when it is blank, is important. If the subject has a value because the user navigated back or the browser autofilled it, overwriting it without permission makes for a poor experience.

If you use Astro View Transitions or client-side navigation, initialize not only on a normal initial page load but also on `astro:page-load`.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Use a Hash to Move to the Form

The CTA URL includes `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

The contact page includes FAQs, LINE, explanatory text, and contact methods other than the form. It is more natural for users arriving from a service CTA to go directly to the form.

However, when initializing the form, pay some attention to scroll timing. Since scrolling should happen after the element is rendered, we use `requestAnimationFrame`.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Moving to the form is a small behavior, but users can get lost if the CTA's intent and the form's position do not line up. In pathway design, consider the URL, initial selection, and scroll position together.

## The Decision Not to Add Hidden Fields

This time, we did not add a `相談対象サービス` hidden field.

The reason was that we wanted the target service to be identifiable from the inquiry type alone.

Adding form fields also increases the number of things to check.

- Whether to include the field in notification emails
- Whether to add a column to the admin screen or spreadsheet
- Whether it affects existing autoresponder templates
- Whether to handle it in CRM integrations or webhooks
- How to distinguish multilingual display names from submitted values

If the required information can be expressed using existing fields, operations are more stable when you do not add fields. In this case, we split `お問い合わせ種別` only into About services in general and service-specific types, allowing the receiving team to identify the service.

Of course, if the requirements include selecting multiple services at once, saving an advertising campaign ID, or using a separate field in the CRM, adding hidden fields may be appropriate.

## Considerations for Multilingual Sites

When building this path on a multilingual site, it helps to think about 3 types of values separately.

| Type            | Example                        | Locale-dependent      |
| --------------- | ------------------------------ | --------------------- |
| URL key         | `web`, `server`, `aceserver`   | No                    |
| Display label   | Such as `About Website Design` | Yes                   |
| Submitted value | `Webサイト制作・運用について`  | Depends on operations |

URL keys are more stable when they are not translated. They are used to share links, analyze traffic, and look up values on the form side.

Display labels must always be translated because they are the text users see in the form.

Submitted values should match operational needs. In this case, we used stable Japanese values. The form is easier to manage when translated display text and internal operations after submission are designed separately.

The translation workflow itself is also covered in [How to Run a Multilingual Blog with Sveltia CMS](/blog/copilot-translation-pipeline/).

## Verify the Generated HTML

For this type of implementation, looking only at the component is not enough. After the build, check the generated HTML to confirm that the links and options are actually output.

The checks in this case were as follows.

- `/services/` contains 7 service-specific CTAs
- Each CTA has `?category=service&service=...#contact-form`
- `/contact/` contains 7 options with `data-service-key`
- About services in general and service-specific types are present
- The `相談対象サービス` hidden field is absent

For example, you can check the generated HTML with `rg`.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

The final check is to make sure that things that should not appear are absent. When modifying a form, verify not only what you added, but also what you decided not to add.

## How This Fits with an AI Chat

This path works well alongside [Technical Design for an AI Contact Chat](/blog/astro-ai-contact-chat/). However, they serve different roles.

| Path        | What It Does Well                                                    |
| ----------- | -------------------------------------------------------------------- |
| AI chat     | Uses conversation to clarify which service the user should ask about |
| Service CTA | Passes the context of the service being read to the form             |
| Form        | Receives the formal inquiry and creates a record                     |

An AI chat is a strong path when users are still unsure. On the other hand, for users who have finished reading a service page and decided to ask about that service, sending them directly to the form without an intervening conversation is more natural.

When adding paths, it is important not to make them all serve the same role. Use conversation, CTAs, and forms to match the user's situation.

## Summary

Passing context from a service page to the contact form can have a greater impact than its appearance suggests.

The key points in this design were as follows.

- Turn the CTA into a component to consolidate URL generation and measurement attributes
- Put a stable service key in the URL, not display text
- Map the service key to an option on the form side
- Separate the submitted value, display label, and service name used for the subject
- Fall back to general services for unknown service keys
- Prefill the subject only when it is blank
- Classify inquiries by type without adding hidden fields
- After the build, verify the number of links and options, and confirm that unnecessary fields are absent, in the generated HTML

Improving a contact form is not just about reducing the number of fields. Passing along the context users were reading without losing it before it reaches the receiving team makes it easier to handle real inquiries.

## Added on 2026-10-6: From Inquiry Intake to Management Records

In an anonymized integration update, we treated inquiry intake, updates to CRM history and tasks, and the assignee's completion of handling as separate states. We validated URL input and inquiry routes, and mapped route values to stable enums. Merely knowing the admin-page URL does not grant permission to change history or tasks.

At the API level, we also verify the user and their permissions, and do not feed customer information into public search or public AI responses. Even when intake and record-keeping implementation is complete, that does not mean we claim end-to-end validation from contacting an actual customer through completing the work.

Distinguish form-prefilled values from user-entered values, and for inquiries that require a callback, carry the preferred contact channel forward into follow-up tasks as a required fixed choice. Align required-field rules in the UI and API with the assignee's read and update permissions, and verify the schema and constraints after DB changes. Separate necessary production verification from replicating the entire database of real customer data into a development environment.

---
title: "从服务 CTA 到咨询表单的上下文传递技术设计"
description: "这是一份将用户在服务页面阅读的上下文传递到咨询表单的实现设计。我们以可复用于其他网站的方式，梳理 Astro 网站中的迷你 CTA、URL 参数契约、表单类型的默认选择、主题预填、多语言 URL、GA 衡量，以及生成 HTML 的检查。"
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["技术", "网站", "服务", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: 本文要点
  text: 服务页面上的 CTA 如果只是将用户送到表单，导流效果就不够理想。通过 URL 传递用户正在阅读的服务上下文，并在表单侧预先设置咨询类型和主题，可以同时减少用户填写时的困惑和接收端的分类工作。
processFigure:
  title: 从服务 CTA 向表单传递上下文的流程
  steps:
    - title: 服务
      description: 为每个服务版块的 CTA 配置 service key（服务标识）。
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: 通过 URL 契约传递，例如 /contact/?category=service&service=web#contact-form。
      icon: i-lucide-link
      accent: amber
    - title: 表单
      description: 在表单侧预先填入相应的咨询类型和主题。
      icon: i-lucide-file-input
      accent: emerald
    - title: 运营
      description: 接收端只需查看咨询类型即可判断服务上下文。
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: CTA 与表单的连接方式对比
  before:
    label: 仅跳转到表单时
    items:
      - 用户需要在表单中重新选择同一个服务名称
      - 主题为空，难以了解咨询内容
      - 接收端往往要阅读正文才能判断目标服务
      - 难以清楚衡量各服务 CTA 的效果
  after:
    label: 传递上下文时
    items:
      - 可以根据 CTA 的 service key 默认选择咨询类型
      - 在主题中填入服务名称，便于整理咨询内容
      - 接收端查看咨询类型即可进行分类
      - 可通过 GA label 和 URL 参数更方便地逐个 CTA 查看效果
checklist:
  title: 上线时的设计检查清单
  items:
    - text: URL 参数只使用简短且稳定的 service key
    - text: 表单接收值应使用运营上稳定的值，而不是面向用户显示的文案
    - text: 未知的 service key 应回退到服务综合咨询
    - text: 仅在主题为空时预填
    - text: 增加 hidden 字段前，先确认是否可以通过现有咨询类型进行分类
    - text: 在服务器端生成各 locale 对应的咨询 URL
    - text: 为 CTA 添加 GA label 和 location，以便衡量效果
    - text: 检查构建后的 HTML 中 CTA 数量、option 数量以及 hidden 字段是否存在
linkCards:
  - href: /services/
    title: 服务
    description: 放置各服务专属 CTA 的导流入口。
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: 联系我们
    description: 接收 URL 参数并预先设置类型和主题的表单。
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: 咨询 AI 聊天的技术设计
    description: 介绍通过对话梳理咨询方向的相关文章。
    icon: i-lucide-sparkles
faq:
  title: 常见问题
  items:
    - question: 为什么不通过 hidden 字段发送咨询对象服务？
      answer: "截至2026年6月，当时的设计只通过现有咨询类型进行分类，不增加 hidden 字段。目前的 Systems 表单会将 service、from、entry 与分类值分别保存到用于集成的 hidden 字段中。"
    - question: 即使 URL 参数被篡改也没问题吗？
      answer: 未知的 service key 会回退到服务综合咨询。发送值会从表单侧的 option 中选择，因此不会将 URL 值直接作为接收值。
    - question: 多语言网站应该如何处理？
      answer: 按 locale 生成 CTA 链接目标，并翻译表单显示标签。另一方面，如果接收值统一为稳定的日语分类名称，接收端的运营就不容易出现偏差。
---

> **2026年9月补充：** 以下 `ServiceSectionActions` 和 `service=web` 的示例，记录了2026年6月 Acecore 官方网站使用的结构。目前的 Acecore Systems 中，[服务详情页 CTA](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro)会附带 `category`、`service`、`from`、`entry`，[咨询表单](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro)会验证简短的 service key，并预先设置类型和主题。目前还会使用用于衡量和集成的 hidden 字段，因此请勿将下文中“不使用 hidden 字段”的设计照搬为当前规格。不信任 URL 中的值、而是将其映射到表单侧选项的原则仍然有效。

用户阅读服务页面后，如果想要“就这里介绍的内容进行咨询”，仅仅将他们送到咨询表单，多少会丢失一些上下文。

用户需要在表单中重新选择服务类型，还得自己重新填写主题。接收端也很难在阅读正文之前判断“这是 Web 制作方面的咨询”“服务器运维方面的咨询”，还是“Aceserver 方面的咨询”。

Acecore 的网站通过[从服务 CTA 向咨询表单传递咨询对象的 PR](https://github.com/acecore-systems/acecore-net/pull/100)优化了这一导流流程。本文不仅整理 Astro 的实现记录，也将其归纳为可供其他网站采用的导流设计。

## 用一个 CTA 验证表单初始化

使用有效的 service key、未知 key，以及已填写主题后返回的情形进行测试。确认类型是否映射到允许的选项、主题是否不会被覆盖，并在各语言的 URL 中使用相同的值契约。URL 中不要放入个人信息或自由文本，只通过简短标识符传递咨询上下文。

[MDN URLSearchParams：URL 参数读取规范](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## 目的不只是减少表单填写

这项实现的目的并不只是自动填写表单项目，让填写过程看起来更轻松。

核心在于将服务页面上形成的上下文，准确传递到咨询表单和接收端的运营流程中。

| 角度       | 希望改善的内容                               |
| ---------- | -------------------------------------------- |
| 用户       | 减少再次选择正在阅读的服务的麻烦             |
| 表单       | 根据咨询内容预先设置咨询类型和主题           |
| 接收端     | 只查看咨询类型也能更轻松地对咨询对象进行分类 |
| 数据分析   | 更容易追踪咨询是从哪个服务 CTA 发起的        |
| 多语言导流 | 跳转至符合 locale 的咨询 URL                 |

外观上这只是一个小型 CTA，但设计范围涉及 CTA、URL、表单、翻译、数据衡量和接收端运营等多个环节。

## 将职责拆分到 CTA 组件

在每个服务版块的末尾放置“咨询此服务”CTA。

首先要避免的是在服务页面的各个版块中重复硬编码相同的链接生成逻辑和 GA 属性。如果有7项服务，同样的写法就会出现7次。今后想修改文案或 URL 规范时，很容易遗漏。

因此，我们创建了一个集中处理咨询 CTA 的 `ServiceSectionActions`。

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

这个组件负责3件事。

- 生成符合 locale 的咨询 URL
- 将 service key 放入 URL 参数
- 添加用于 GA 衡量的 label 和 location

CTA 是用户采取行动的触点，因此不仅是 UI，也是数据衡量触点。我们保留 `data-ga-label` 和 `data-ga-location`，以便之后查看“咨询是从哪个服务发起的”。

## 将 URL 参数作为与表单之间的契约

从 CTA 传递到咨询表单的值使用 URL 参数。

```txt
/contact/?category=service&service=web#contact-form
```

这里的重点是，不要把“显示文案”放进 URL。

像 `Webサイト制作・運用について` 这样的显示文案会受到翻译、写法不一致和未来名称变更的影响。URL 中只放入 `web` 或 `server` 这样简短的 service key。

| 参数       | 作用                   |
| ---------- | ---------------------- |
| `category` | 表示这是服务咨询的入口 |
| `service`  | 表示目标服务的稳定 key |
| hash       | 用于滚动到表单位置     |

用户可以编辑 URL 参数。因此，表单侧不会将 URL 值直接作为发送值，而是映射到现有的 option。

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">将咨询受理信息传递到管理记录的流程</strong>
    <span>展示链路的实现阶段。是否已联系实际客户并完成处理，仍需另行确认。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>读取 CTA 上下文</strong>
      <span>将稳定的 service key 映射到多语言显示 URL 和表单已允许选项的 allowlist。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>验证输入与权限</strong>
      <span>仅在主题为空时预填，并在 API 中验证使用者身份和操作权限。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>写入受理记录</strong>
      <span>将受理内容同步到 CRM 历史记录和后续任务，并将负责人实际完成处理记录为独立状态。</span>
    </li>
  </ol>
</figure>

## 在表单侧维护分类表

在咨询表单侧，通过数组维护各服务的分类。

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

`key`、`value`、`label`、`subject` 分别承担不同作用。

| 字段      | 作用                              |
| --------- | --------------------------------- |
| `key`     | 用于根据 URL 参数查找的稳定标识符 |
| `value`   | 表单提交时发送给接收端的咨询类型  |
| `label`   | 显示在界面上的已翻译选项          |
| `subject` | 用于预填主题的服务名称            |

在多语言网站中，`label` 会根据 locale 翻译。另一方面，`value` 用于接收端分类，因此统一为稳定的日语值。

这一点会因产品而有不同的取舍。如果 CRM 或外部表单支持多语言分类，value 也可以按 locale 设置。如果像本例一样希望简化接收端运营，将显示标签和接收值分开会更容易处理。

## 为 option 添加 data 属性

在表单的 select 中输出各服务对应的 option。

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

`data-service-key` 用于与 URL 中的 `service` 对照。`data-service-subject` 用于生成主题。

这里的要点同样是不要将 URL 值直接放入 `category.value`。始终从 select 内的 option 中选择，避免将未知的 service key 或非法值混入接收值。

## 在客户端进行预填

表单初始化通过页面加载后运行的一小段脚本完成。

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

实现上的要点有以下4项。

- 为避免重复初始化，检查 `data-service-prefill-initialized`
- 仅在 `category=service` 时处理
- 未知的 service key 回退到“服务综合咨询”
- 仅在主题为空时预填

最后一点“仅在主题为空时”非常重要。如果用户通过返回操作或浏览器自动填充保留了主题，擅自覆盖就会破坏使用体验。

如果使用 Astro 的 View Transitions 或客户端导航，除了常规的初次加载，也要在 `astro:page-load` 时进行初始化。

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## 使用 hash 跳转到表单位置

CTA 的 URL 中附加了 `#contact-form`。

```txt
/contact/?category=service&service=web#contact-form
```

咨询页面上除了表单，还有 FAQ、LINE、说明文字和其他联系方式。因此，从服务 CTA 跳转而来的用户直接前往表单位置会更自然。

不过，如果需要在表单侧进行初始化，就要稍微留意滚动时机。为了在元素渲染后再滚动，我们使用了 `requestAnimationFrame`。

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

跳转到表单位置只是一个小动作，但 CTA 的意图和表单显示位置不一致时，用户就会感到困惑。设计导流流程时，应将 URL、默认选择和滚动位置作为整体考虑。

## 决定不增加 hidden 字段

本次没有添加 `相談対象サービス` hidden 字段。

原因是希望只通过咨询类型就能判断目标服务。

增加表单字段后，也会增加以下检查事项。

- 是否显示在通知邮件中
- 是否要在管理界面或电子表格中增加一列
- 是否会影响现有的自动回复模板
- 是否要在 CRM 集成或 Webhook 中处理
- 如何区分多语言显示名称和接收值

如果现有字段能够表达所需信息，不增加字段会让运营更加稳定。本次只将 `お問い合わせ種別` 区分为“服务综合咨询”和各服务类别，让接收端能够进行判断。

当然，如果有同时选择多个服务、保存广告活动 ID，或在 CRM 中使用独立字段等需求，也可以考虑增加 hidden 字段。

## 多语言网站的处理方式

为多语言网站设计这类导流流程时，将3类值分开考虑，就不会混乱。

| 类型     | 示例                          | 是否依赖 locale |
| -------- | ----------------------------- | --------------- |
| URL key  | `web`, `server`, `aceserver`  | 否              |
| 显示标签 | `About Website Design` 等     | 是              |
| 接收值   | `Webサイト制作・運用について` | 视运营需要      |

URL key 不翻译会更稳定，因为需要共享链接、进行分析并在表单侧进行匹配。

显示标签必须翻译，因为这是用户在表单中看到的文案。

接收值则应根据运营方式决定。本次采用了稳定的日语值。将多语言显示与接收后的内部运营视为不同事项来设计，表单就会更易于处理。

关于翻译流程，[如何使用 Sveltia CMS 运营多语言博客](/blog/copilot-translation-pipeline/) 中也有介绍。

## 检查生成的 HTML

此类实现只检查组件还不够。需要在构建后的 HTML 中确认链接和 option 是否已实际输出。

本次检查了以下内容。

- `/services/` 中输出了7个服务专属 CTA
- 各 CTA 都带有 `?category=service&service=...#contact-form`
- `/contact/` 中输出了7个带有 `data-service-key` 的 option
- 已输出“服务综合咨询”和各服务类别
- 未输出 `相談対象サービス` hidden 字段

例如，可以使用 `rg` 检查生成的 HTML。

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

最后一项检查是确认不应出现的内容确实没有出现。改造表单时，不仅要检查新增的内容，也要检查那些决定不新增的内容。

## 与 AI 聊天的分工

这条导流流程与[咨询 AI 聊天的技术设计](/blog/astro-ai-contact-chat/) 相辅相成。不过，两者的作用不同。

| 导流方式 | 擅长的事情                       |
| -------- | -------------------------------- |
| AI 聊天  | 通过对话梳理应该咨询哪项服务     |
| 服务 CTA | 将正在阅读的服务上下文传递到表单 |
| 表单     | 接收正式的咨询内容并保留记录     |

AI 聊天适合用户仍在犹豫的阶段。另一方面，对于读完服务页面并决定“咨询这项服务”的用户，不插入对话、直接跳转表单会更自然。

增加导流方式时，重要的是不要让所有方式承担相同的作用。应根据用户所处的阶段灵活使用对话、CTA 和表单。

## 总结

从服务页面向咨询表单传递上下文的实现，效果远比外观看起来更加显著。

本次设计的重点如下。

- 将 CTA 组件化，集中处理 URL 生成和衡量属性
- URL 中放入稳定的 service key，而不是显示文案
- 在表单侧将 service key 映射到 option
- 将接收值、显示标签和用于主题的服务名称区分开
- 未知的 service key 回退到服务综合咨询
- 仅在主题为空时预填
- 不增加 hidden 字段，通过咨询类型进行分类
- 在构建后的 HTML 中确认链接数量、option 数量以及不需要的字段确实不存在

改进咨询表单不只是减少输入栏。将用户正在阅读的上下文一路传递到接收端，才能让实际咨询处理更加轻松。

## 2026年10月6日补充：从咨询受理到管理记录

在匿名化的集成改造中，我们将咨询受理、写入 CRM 历史记录和任务、负责人完成处理作为不同状态来处理。对 URL 输入和咨询来源路径进行验证，并将来源路径的值映射到稳定的 enum。仅仅知道管理界面的 URL，并不意味着拥有修改历史记录或任务的权限。

在 API 中也会确认使用者身份和操作权限，不将客户信息混入公开搜索或公开 AI 回答的素材。即使咨询受理或记录的实现已经完成，也不能据此声称已端到端验证从联系实际客户到业务处理完成的全流程。

区分表单预填与用户本人填写的内容。对于需要回电的受理事项，将首选联系方式设置为必填的固定选项，并传递到后续任务。统一 UI 和 API 的必填条件，以及负责人的查看和追加权限；数据库变更后，确认 schema 和 constraint。还要将必要的生产环境验证与把实际客户的全部 DB 复制到开发环境区分开来。

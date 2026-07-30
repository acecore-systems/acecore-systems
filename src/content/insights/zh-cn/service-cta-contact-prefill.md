---
title: "将服务CTA上下文传递到咨询表单的技术设计"
description: "这是将用户在服务页面中阅读的上下文传递到咨询表单的实现设计。内容涵盖Astro网站中的迷你CTA、URL参数契约、表单类别的初始选择、主题prefill、多语言URL、GA计量和生成HTML检查，可复用于其他网站。"
date: 2026-06-07T13:00
author: gui
tags: ["技术", "网站", "服务", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: 本文要点
  text: 服务页面的CTA若只是把用户送到表单，导流仍然较弱。通过URL传递用户正在阅读的服务上下文，并在表单侧初始化咨询类别与主题，可同时减少填写时的犹豫和接收方的分类工作。
processFigure:
  title: 从服务CTA向表单传递上下文的流程
  steps:
    - title: Service
      description: 为各服务区块的CTA设置service key。
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: 通过 /contact/?category=service&service=web#contact-form 这样的URL契约传递。
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: 在表单中初始填入相应的咨询类别与主题。
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: 接收方只看咨询类别即可判断服务上下文。
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: 连接CTA与表单时的区别
  before:
    label: 只发送到表单
    items:
      - 用户需要在表单中重新选择同一个服务名称
      - 主题为空，难以看出咨询内容
      - 接收方必须阅读正文才能判断目标服务
      - 各服务CTA的效果测量不够明确
  after:
    label: 继承上下文
    items:
      - 可根据CTA的service key初始选择咨询类别
      - 可把服务名称放入主题，整理咨询内容
      - 接收方查看咨询类别即可分类
      - 可通过GA label和URL参数按CTA确认效果
checklist:
  title: 导入时的设计检查
  items:
    - text: URL参数只使用短且稳定的service key
    - text: 表单接收值使用运营上稳定的值，而非面向用户的显示文案
    - text: 未知service key回退到服务综合咨询
    - text: 仅在主题为空时进行初始填入
    - text: 增加hidden字段前，确认现有咨询类别是否足以分类
    - text: 在服务器侧按locale生成咨询URL
    - text: 为CTA添加GA label和location，以便测量效果
    - text: build后在生成HTML中检查CTA数量、option数量及hidden字段的有无
linkCards:
  - href: /services/
    title: 服务
    description: 放置各服务CTA的导流入口。
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: 联系我们
    description: 接收URL参数并初始化类别与主题的表单。
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: 咨询AI聊天的技术设计
    description: 通过对话帮助用户整理咨询方向的相关文章。
    icon: i-lucide-sparkles
faq:
  title: 常见问题
  items:
    - question: 为什么不通过hidden字段发送目标服务？
      answer: 这样不会增加接收方需要查看的字段，并可只用现有咨询类别完成分类。表单字段越多，运营和通知模板中的检查点也越多。
    - question: URL参数被篡改也没关系吗？
      answer: 未知service key会回退到服务综合咨询。发送值从表单侧的option中选择，因此不会把URL值直接当作接收值。
    - question: 多语言网站应如何处理？
      answer: 按locale生成CTA链接，并翻译表单显示标签。另一方面，将接收值统一为稳定的日语分类名称，可减少接收方运营上的偏差。
---

当阅读服务页面的用户产生“想就这项内容咨询”的想法时，如果只是把他们送到咨询表单，会丢失一部分上下文。

用户需要在表单中重新选择服务类型，并再次填写主题。接收方在阅读正文之前，也难以判断这是“网站制作”“服务器运营”还是“Aceserver”的咨询。

Acecore网站通过[把服务CTA的咨询对象传递到咨询表单的PR](https://github.com/acecore-systems/acecore-net/pull/100) 改善了这条导流。本文不仅记录Astro中的实现，也将其整理为可供其他网站使用的导流设计。

## 目的不只是减少表单输入

这一实现并不只是为了自动填写字段，让表单看起来更轻松。

本质是把服务页面中产生的上下文正确传递到咨询表单和接收运营中。

| 视角       | 希望改善的内容                         |
| ---------- | -------------------------------------- |
| 用户       | 减少再次选择刚才阅读的服务的麻烦       |
| 表单       | 按咨询内容初始化咨询类别和主题         |
| 接收方     | 只根据咨询类别就能更容易地分类目标服务 |
| 测量       | 更容易追踪咨询从哪个服务CTA开始        |
| 多语言导流 | 发送到符合locale的咨询URL              |

从外观上看它只是一个小型CTA，但设计范围横跨CTA、URL、表单、翻译、测量和接收运营。

## 将职责拆分到CTA组件

在每个服务区块末尾放置“咨询此服务”的CTA。

首先应避免在服务页面的每个区块中直接重复编写相同的链接生成和GA属性。如果有7项服务，同一种写法就会出现7次，日后修改文案或URL规范时容易遗漏。

因此我们创建了集中管理咨询CTA的 `ServiceSectionActions`。

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

该组件有三项职责：

- 生成符合locale的咨询URL
- 将service key放入URL参数
- 保存GA测量使用的label与location

CTA既是用户的行动点，也是测量点，而不只是UI。保留 `data-ga-label` 和 `data-ga-location`，可以在之后确认咨询从哪项服务开始。

## 将URL参数作为与表单的契约

从CTA传递到咨询表单的值使用URL参数。

```txt
/contact/?category=service&service=web#contact-form
```

关键是不把“显示文案”放入URL。

`Webサイト制作・運用について` 这样的显示文案会受到翻译、写法差异和未来名称变更的影响。URL中只放 `web` 或 `server` 这样的短service key。

| 参数       | 作用                     |
| ---------- | ------------------------ |
| `category` | 表示按服务咨询处理的入口 |
| `service`  | 表示目标服务的稳定key    |
| hash       | 用于滚动到表单位置       |

URL参数可以由用户编辑。因此表单不会直接把URL值作为发送值，而是把它映射到已有option。

## 在表单侧维护分类表

咨询表单以数组保存各服务分类。

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

`key`、`value`、`label` 和 `subject` 各有不同作用。

| 字段      | 作用                            |
| --------- | ------------------------------- |
| `key`     | 用于根据URL参数查找的稳定标识符 |
| `value`   | 表单发送时交给接收方的咨询类别  |
| `label`   | 显示在画面上的已翻译选项        |
| `subject` | 用于初始填写主题的服务名称      |

多语言网站的 `label` 按locale翻译。另一方面，`value` 用于接收方分类，所以我们将它统一为稳定的日语值。

这个判断会因产品而异。如果CRM或外部表单支持多语言分类，也可以让value按locale变化。像本例这样希望简化接收运营时，分开显示标签与接收值更容易管理。

## 为option设置data属性

表单select输出各服务的option。

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

`data-service-key` 用于与URL中的 `service` 比较，`data-service-subject` 用于生成主题。

这里的重点同样是不要把URL值直接放入 `category.value`。必须从select中的option选择，避免未知service key或非法值混入接收值。

## 在客户端执行prefill

页面加载后，用一段小脚本初始化表单。

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

实现上有四个要点：

- 检查 `data-service-prefill-initialized`，避免重复初始化
- 仅在 `category=service` 时处理
- 未知service key回退到 `サービス全般について`
- 仅当主题为空时初始填写

最后一点非常重要。若用户通过返回操作或浏览器自动填充保留了主题，擅自覆盖会损害体验。

使用Astro View Transitions或客户端导航时，除了通常的初次加载，还应在 `astro:page-load` 时初始化。

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## 使用hash移动到表单位置

CTA的URL包含 `#contact-form`。

```txt
/contact/?category=service&service=web#contact-form
```

咨询页面可能还包含FAQ、LINE、说明文字和其他联系方式，因此从服务CTA进入的用户直接移动到表单更自然。

不过，如果表单侧要初始化，需要稍微注意滚动时机。为了在元素渲染后滚动，我们使用 `requestAnimationFrame`。

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

移动到表单只是很小的行为，但若CTA的意图与表单显示位置不一致，用户会感到迷惑。导流设计应把URL、初始选择和滚动位置作为一个整体考虑。

## 不增加hidden字段的判断

本次没有增加 `相談対象サービス` 的hidden字段。

原因是希望只通过咨询类别就能判断目标服务。

增加表单字段时，以下检查点也会增加：

- 是否显示在通知邮件中
- 是否在管理界面或电子表格中增加列
- 是否影响现有自动回复模板
- CRM联动或Webhook是否处理该字段
- 如何区分多语言显示名称与接收值

如果现有字段能够表达所需信息，不增加字段会使运营更稳定。这次我们把 `お問い合わせ種別` 分为“服务综合”和各服务类别，使接收方能够判断。

当然，如果需要同时选择多个服务、保存广告活动ID或在CRM中使用独立字段，也可以选择增加hidden字段。

## 多语言网站的思路

在多语言网站中构建这条导流时，把三个值分开考虑即可避免混乱。

| 类型     | 示例                          | 是否依赖locale |
| -------- | ----------------------------- | -------------- |
| URL key  | `web`, `server`, `aceserver`  | 否             |
| 显示标签 | `About Website Design` 等     | 是             |
| 接收值   | `Webサイト制作・運用について` | 取决于运营     |

URL key不翻译更稳定，因为它用于共享链接、分析以及表单侧匹配。

显示标签必须翻译，因为这是用户在表单中看到的文案。

接收值应配合运营。本次统一为稳定的日语值。将多语言显示与提交后的内部运营分开设计，可使表单更易处理。

翻译流程本身也在[使用Sveltia CMS运营多语言博客的方法](/blog/copilot-translation-pipeline/)中介绍。

## 检查生成HTML

这种实现只看组件还不够。应在build后的HTML中确认链接和option是否实际输出。

本次检查的内容如下：

- `/services/` 中输出7个服务CTA
- 各CTA包含 `?category=service&service=...#contact-form`
- `/contact/` 中输出7个带 `data-service-key` 的option
- 输出 `サービス全般について` 和各服务类别
- 未输出 `相談対象サービス` 的hidden字段

例如，可以对生成HTML使用 `rg` 检查。

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

最后一项是检查不应出现的内容确实没有出现。修改表单时，不仅要检查新增内容，也要检查设计上决定不添加的内容。

## 与AI聊天的职责分工

这条导流与[咨询AI聊天的技术设计](/blog/astro-ai-contact-chat/)很契合，但两者职责不同。

| 导流    | 擅长的事情                       |
| ------- | -------------------------------- |
| AI聊天  | 通过对话整理应咨询哪项服务       |
| 服务CTA | 把正在阅读的服务上下文传递到表单 |
| 表单    | 正式接收咨询内容并留下记录       |

AI聊天适合仍在犹豫的用户。相反，对于读完服务页面并决定“咨询这项服务”的用户，不经对话直接送到表单更自然。

增加导流时，不要让所有导流承担相同角色。应根据用户状态分别使用对话、CTA和表单。

## 总结

将服务页面的上下文传递到咨询表单，其效果比视觉上的小变化更大。

本次设计中的重点如下：

- 将CTA组件化，集中URL生成与计量属性
- URL使用稳定的service key而非显示文案
- 在表单侧把service key映射到option
- 区分接收值、显示标签和主题用服务名称
- 未知service key回退到服务综合咨询
- 仅当主题为空时初始填写
- 不增加hidden字段，而是用咨询类别分类
- build后在生成HTML中检查链接数、option数和不必要字段不存在

改善咨询表单不只是减少输入栏。把用户正在阅读的上下文完整传递到接收方，才能真正让咨询处理更轻松。

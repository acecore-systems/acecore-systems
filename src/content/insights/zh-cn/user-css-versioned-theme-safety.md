---
title: "安全处理用户 CSS 与公开主题：共享正本、限定渲染和版本固定"
description: "说明GUI与手写CSS的共同正本、安全渲染和固定版商店主题的即时应用，以及页面与目录卡片独立、本人预览、草稿保存与发布操作。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "实现检查不等于真实用户的端到端验收"
  text: "CSS/GUI编辑、固定版商店、即时应用、页面与卡片独立及本人预览已集成、部署，并检查公开显示。认证操作使用合成资料测试；本人同意、应用、编辑保存、发布的完整验收及付费销售尚未实证。"
---

通过 GUI 调整个人资料的颜色和间距，并用 CSS 编辑整体布局的编辑器，必须同时考虑操作体验和公开页面代码的安全性。本文以匿名化实现为例，说明编辑与分发之间的边界。

## 分别选择样式自由度和分发功能

仅编辑自己的资料时，先验证作用域与保存冲突。向他人分发还需要固定版本ID、使用条件及停用后的默认显示。用包含Grid和伪元素的小主题测试外部导航不受影响，作者发布新版也不改变已应用版本。

[W3C Selectors：检查选择器作用范围](https://www.w3.org/TR/selectors-4/)

## GUI 与直接编辑共用同一个 CSS 正本

后续扩展把完整 CSS 作为主题的正本，并让 GUI 修改同一 CSS 中对应的声明。手写注释、GUI 不管理的声明以及响应式规则都会保留。旧版以 GUI 设置和额外 CSS 为基础的数据，也会迁移到可编辑的完整样式表中。只修改用于显示设置列表的辅助设置，不代表实际渲染 CSS 已发生变化。

CSS/GUI编辑与本人预览扩展已集成，并确认CI和生产部署。认证操作使用合成资料测试，不能证明真实本人完成编辑、保存和发布。

## 在渲染边界内支持丰富的 CSS 语法

初期基于小型属性允许列表的限制后来有所扩展，支持 Grid、Flex、变量、渐变、伪元素、变换、动画，以及 @media、@supports、@container 等规则。这不表示未经检查就插入任意 CSS。系统会解析语法树，将每个选择器分支限制在指定个人资料区域的后代元素内。条件规则内部也应用同一边界；外层运营入口和许可标记不属于主题范围。[W3C Selectors](https://www.w3.org/TR/selectors-4/)可作为查阅选择器规范的入口。

发布 CSS 时，变量名和 keyframes 名会改写为唯一名称，避免与外层界面的变量或其他主题的动画发生干扰。编辑时仍保留原始名称。渲染外围 wrapper 还会使用 containment 与 isolation，将宽泛布局规则的影响限制在个人资料区域内。

系统会拒绝外部资源获取、@import 和 @font-face 等全局规则、无法解析的语法、CSS nesting、HTML 的 style 结束标记，以及无法安全确定名称的动画引用。输入和生成后的容量也会经过检查。发布时和读取 snapshot 时，会再次核对作用域、唯一名称与已验证 canonical CSS 字符串是否一致。支持丰富语法并不保证所有浏览器中的显示完全相同。

## 区分试用、CSS保存与商店应用

手写CSS或GUI编辑、试用和草稿保存改变本人编辑中的视图。让访客看到已保存CSS需要独立的资料发布操作。检测保存冲突，避免重试重复更新版本或草稿。

选择商店中公开且可用的固定版主题，同意使用条件并应用后，已公开资料的外观立即改变。只更新主题，保留原公开内容，不发布编辑中的正文或图片，也不会把未公开资料转为公开。因此，商店应用和手写CSS的草稿保存必须分别说明。

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">CSS编辑与商店应用的生效范围</strong>
    <span>向公开资料应用商店主题，会立即更新所选用途的外观。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>CSS/GUI编辑</strong>
      <span>本人预览与草稿保存；发布是独立操作。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>应用固定版商店主题</strong>
      <span>确认可用公开版本及同意，不公开私有资料。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>页面与目录独立</strong>
      <span>按用途保留CSS、草稿和公开版本。</span>
    </li>
  </ol>
</figure>

## 页面与目录独立，并用本人内容预览

资料页面与目录卡片分别持有CSS、草稿、公开版本、来源和商店用途。选择页面主题不会改变目录；不兼容用途的版本应用和用途修改会被拒绝。卡片保持统一尺寸与响应式边界，用长名称、说明检查显示。

设置显示已保存的本人预览与主题名，可在同一屏幕选择商店主题并进入编辑。切换可视化和代码编辑时保留未保存的名称、CSS和冲突检测版本。除示例外还预览本人内容；保存仅更新所选用途的草稿。

## 不让其他作者的更新改变正在使用的设计

主题可编辑的列表信息与不可变版本相互分离。用户按版本 ID 导入；作者发布新版本时，现有草稿和已发布版本不会自动改变。编辑后仍保留所应用主题的来源、版本和使用条款出处。即使公开个人资料重新变为私有，作者草稿中的名称和图片也不能泄漏到分发的主题中。

## 区分下架与运营停用

作者下架主题会停止新的发现和应用，但不一定立即撤销已固定版本的现有使用。运营方停用危险主题则有不同边界：停止公开获取和现有 snapshot 中的 CSS，并恢复标准外观。回滚到旧 snapshot 时也会检查当前停用状态，避免恢复停用前的 CSS。

## 发布前的检查项目

检查越界选择器、外部请求、容量、保存冲突、重试、下架、停用及回退。固定版、CSS/GUI编辑、用途独立和本人预览已生产部署，并检查公开目录与实际列表卡片。认证测试使用合成资料，本人同意、应用、保存、发布仍未验收。使用条件不能保证完全防止复制已分发CSS。确认日期：2026年10月14日。

关于编辑输入侧，请参阅[个人资料信息的草稿导入](/insights/profile-import-draft-boundaries/)；关于 CMS 运维，请参阅[Sveltia CMS 指南](/insights/cms-selection-and-turnstile/)。

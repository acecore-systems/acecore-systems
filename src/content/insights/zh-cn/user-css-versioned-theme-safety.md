---
title: "安全处理用户 CSS 与公开主题：共享正本、限定渲染和版本固定"
description: "匿名化介绍一种个人资料编辑设计：GUI 与直接编辑共用同一 CSS 正本。涵盖限定在渲染区域内的丰富 CSS 语法、草稿与已发布版本、不可变主题版本、下架和运营停用。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/user-css-versioned-theme-safety-cover-v1.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "实现检查不等于真实用户的端到端验收"
  text: "已确认固定版本主题商店的数据库变更、生产部署和测试数据展示。共享 CSS 正本与 GUI 编辑扩展已确认合并到 main，且 CI 通过；在本次审计范围内，尚未确认该扩展的生产部署或登录用户验收。真实用户提交并应用主题的完整流程以及付费销售均未得到验证。"
---

通过 GUI 调整个人资料的颜色和间距，并用 CSS 编辑整体布局的编辑器，必须同时考虑操作体验和公开页面代码的安全性。本文以匿名化实现为例，说明编辑与分发之间的边界。

## 分别选择样式自由度和分发功能

仅编辑自己的资料时，先验证作用域与保存冲突。向他人分发还需要固定版本ID、使用条件及停用后的默认显示。用包含Grid和伪元素的小主题测试外部导航不受影响，作者发布新版也不改变已应用版本。

[W3C Selectors：检查选择器作用范围](https://www.w3.org/TR/selectors-4/)

## GUI 与直接编辑共用同一个 CSS 正本

后续扩展把完整 CSS 作为主题的正本，并让 GUI 修改同一 CSS 中对应的声明。手写注释、GUI 不管理的声明以及响应式规则都会保留。旧版以 GUI 设置和额外 CSS 为基础的数据，也会迁移到可编辑的完整样式表中。只修改用于显示设置列表的辅助设置，不代表实际渲染 CSS 已发生变化。

backend 与 frontend 扩展分别合并到各自的 main，并已检查 CI 和实现测试。在本次审计范围内，这不能证明已部署到生产环境，也不能证明登录用户已完成端到端流程。

## 在渲染边界内支持丰富的 CSS 语法

初期基于小型属性允许列表的限制后来有所扩展，支持 Grid、Flex、变量、渐变、伪元素、变换、动画，以及 @media、@supports、@container 等规则。这不表示未经检查就插入任意 CSS。系统会解析语法树，将每个选择器分支限制在指定个人资料区域的后代元素内。条件规则内部也应用同一边界；外层运营入口和许可标记不属于主题范围。[W3C Selectors](https://www.w3.org/TR/selectors-4/)可作为查阅选择器规范的入口。

发布 CSS 时，变量名和 keyframes 名会改写为唯一名称，避免与外层界面的变量或其他主题的动画发生干扰。编辑时仍保留原始名称。渲染外围 wrapper 还会使用 containment 与 isolation，将宽泛布局规则的影响限制在个人资料区域内。

系统会拒绝外部资源获取、@import 和 @font-face 等全局规则、无法解析的语法、CSS nesting、HTML 的 style 结束标记，以及无法安全确定名称的动画引用。输入和生成后的容量也会经过检查。发布时和读取 snapshot 时，会再次核对作用域、唯一名称与已验证 canonical CSS 字符串是否一致。支持丰富语法并不保证所有浏览器中的显示完全相同。

## 分开试用、草稿和发布

试用或应用主题会修改草稿。只有所有者执行发布操作后，公开页面才会改变。能够再次编辑手写 CSS，也不等于会把原始文本交给访客。保存契约会检测冲突，并防止重试操作重复更新版本或草稿。

## 不让其他作者的更新改变正在使用的设计

主题可编辑的列表信息与不可变版本相互分离。用户按版本 ID 导入；作者发布新版本时，现有草稿和已发布版本不会自动改变。编辑后仍保留所应用主题的来源、版本和使用条款出处。即使公开个人资料重新变为私有，作者草稿中的名称和图片也不能泄漏到分发的主题中。

## 区分下架与运营停用

作者下架主题会停止新的发现和应用，但不一定立即撤销已固定版本的现有使用。运营方停用危险主题则有不同边界：停止公开获取和现有 snapshot 中的 CSS，并恢复标准外观。回滚到旧 snapshot 时也会检查当前停用状态，避免恢复停用前的 CSS。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-user-css-versioned-theme-safety">
  <figcaption>
    <strong id="diagram-user-css-versioned-theme-safety">从编辑 CSS 到发布固定版本</strong>
    <span>已确认代码集成、CI 和旧版 Store 的生产发布。新版 CSS 扩展的生产/登录验收、用户应用及付费销售尚未确认。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m8 6-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/></svg></span>
      <strong>共用 CSS 正本</strong>
      <span>GUI 与直接编辑使用同一 CSS 正本，并保留手写规则。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M8 8h8M8 12h5M8 16h8"/></svg></span>
      <strong>解析并限定范围</strong>
      <span>支持 Grid/Flex、变量、伪元素、响应式规则和动画；拒绝外部、全局或无法解析的输入。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>明确发布版本</strong>
      <span>预览/草稿后发布不可变版本。下架与运营停用是不同操作。</span>
    </li>
  </ol>
</figure>

## 发布前的检查项目

检查越界选择器、外部请求、输入容量、保存冲突、重试、作者资料转为私有、下架、运营停用和回滚。已确认固定版本商店的生产部署及测试数据展示，但在本次审计范围内，CSS 编辑扩展的生产部署和登录用户验收尚未确认。早期一次检查时，公开主题数量为 0；这不代表当前公开数量。真实用户提交和应用主题的端到端测试以及付费销售均未得到验证。使用条款也无法保证 CSS 到达浏览器后绝不会被复制。

关于编辑输入侧，请参阅[个人资料信息的草稿导入](/insights/profile-import-draft-boundaries/)；关于 CMS 运维，请参阅[Sveltia CMS 指南](/insights/cms-selection-and-turnstile/)。

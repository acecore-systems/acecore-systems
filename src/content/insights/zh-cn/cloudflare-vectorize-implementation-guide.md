---
title: "在多个仓库中导入 Cloudflare Vectorize 后总结的实践经验"
description: "先说明 Cloudflare Vectorize 是什么，以及它如何帮助发现关键词搜索容易漏掉的改述和关联信息；再总结在多个 Astro／Cloudflare Pages 站点中安全导入它的经验。"
date: 2026-07-31T12:00
author: gui
tags: ["技术", "Cloudflare", "Vectorize", "OpenAI", "站内搜索"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: Vectorize 是按“语义”检索的搜索基础，而不只是按词匹配
  text: "Cloudflare 的向量数据库即使在关键词不完全一致时，也能返回语义接近问题的公开页面。它的价值在于用改述和关联信息发现来补强现有关键词搜索，而不是取代它。"
processFigure:
  eyebrow: Vectorize rollout
  title: 从已发布 HTML 到 Production index 的流程
  description: "不直接导入可编辑 source，而是以实际发布的 HTML 和已部署 commit 作为同步基准。"
  variant: inline
  steps:
    - title: build 已发布 HTML
      description: "生成反映 canonical、locale 和 noindex 的静态 HTML。"
      icon: i-lucide-file-code-2
      accent: slate
    - title: 确定性地生成 corpus
      description: "将正文分成 chunk，并添加源自 content hash 的 ID 和审计 metadata。"
      icon: i-lucide-boxes
      accent: brand
    - title: 确认 Preview 界面
      description: "在那里保持语义搜索关闭，并确认 Pagefind 候选项、fallback 和可见说明。"
      icon: i-lucide-flask-conical
      accent: amber
    - title: 将已发布 commit 同步到 Production
      description: "核对 build marker 与 corpus version，只有 mutation 收敛后才启用。"
      icon: i-lucide-shield-check
      accent: emerald
compareTable:
  title: 搜索功能与同步处理需要不同的失败策略
  before:
    label: 所有功能都依赖 Vectorize
    items:
      - "AI、Vectorize 或 D1 中任意一项停止，整个站内搜索就无法使用"
      - "CMS 草稿与已发布页面的差异会直接变成搜索结果的差异"
      - "同步脚本配置错误时，可能修改其他环境或大量 vector"
      - "容易在代码 merge 时就判断导入已经完成"
  after:
    label: fail-soft 搜索＋fail-closed 同步
    items:
      - "普通搜索使用 Pagefind，语义搜索作为由用户明确操作触发的辅助功能"
      - "从已发布 HTML 生成 corpus，反映 canonical、noindex 和 locale"
      - "在同步前后验证 Production allowlist、删除比例、已发布 commit 和 mutation 完成情况"
      - "将实现、本地验证、Preview 界面确认和 Production 运行记录为不同状态"
statBar:
  items:
    - value: "4 repos"
      label: 横向比较导入与试用记录
      description: "没有把 Production、本地验证、Preview 和事前调查视为同一状态，而是分别比较。"
      icon: i-lucide-git-branch
    - value: "36 → 250"
      label: Acecore Systems Production 首次同步
      description: "从36个已发布日语页面生成250 vectors，以删除0个的结果完成同步。"
      icon: i-lucide-database
    - value: "72 → 134"
      label: World Foundation 本地验证
      description: "从72 sources生成134 vectors，但将其记录为 Production 发布前状态。"
      icon: i-lucide-test-tube-2
    - value: "37 tests"
      label: 搜索契约验证
      description: "World Foundation 通过了搜索、corpus 和同步的37项契约测试。"
      icon: i-lucide-badge-check
checklist:
  title: 导入下一个仓库前的确认事项
  items:
    - text: "保留现有关键词搜索，确保 Vectorize 停止时搜索入口仍可使用"
      checked: true
    - text: "核对 embedding model 的实际输出与 index 的 dimensions／metric"
      checked: true
    - text: "从已发布 HTML 生成 corpus，并排除 noindex、外部 canonical 和管理画面"
      checked: true
    - text: "使用源自 content hash 的 ID，避免对未变化的 chunk 再次 embedding"
      checked: true
    - text: "让 Preview 只使用 Pagefind，并将 Vectorize、D1 和同步权限限制在 Production"
      checked: true
    - text: "确认 upsert 完成后再 delete，并要求明确批准大量删除"
      checked: true
    - text: "为搜索 API 设置 body、query、locale、origin、rate limit 和 kill switch"
      checked: true
    - text: "仅把已发布 commit 与 corpus version 一致的部署同步到 Production"
      checked: true
    - text: "分别记录已实现、已本地验证、已确认 Preview、正在 Production 运行"
      checked: true
linkCards:
  - href: https://developers.cloudflare.com/vectorize/
    title: Cloudflare Vectorize 官方文档
    description: "可确认 index、binding、query 和 metadata filtering 的现行规范。"
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/platform/limits/
    title: Vectorize 当前 limits
    description: "batch、topK、metadata 和 vector 数量上限会发生变化，实现时需要重新确认。"
    icon: i-lucide-gauge
  - href: /insights/astro-cloudflare-site-architecture/
    title: Astro＋Cloudflare 网站整体架构
    description: "整理静态 HTML、Pages Functions、D1 和搜索应该放在哪一层。"
    icon: i-lucide-layers-3
faq:
  title: 常见问题
  items:
    - question: 导入 Vectorize 后就不需要 Pagefind 了吗？
      answer: "我们保留了 Pagefind。Pagefind 是从静态 HTML 生成、依赖较少的普通搜索；Vectorize 则作为查找改写表达和相关概念的辅助搜索。即使 AI 或 Vectorize 失败，普通搜索仍然可用。"
    - question: 导入 Vectorize 必须使用 D1 或 R2 吗？
      answer: "不是必须。Acecore Systems 使用 D1 对搜索 API 进行 rate limit，但它并不是 Vectorize 本身必需的存储位置。原文也可以根据需求存放在已发布 HTML、JSON、D1、R2 等位置。"
    - question: 现行实现中的 embedding model 和 dimensions 应如何管理？
      answer: "现行 Acecore Systems 实现使用 OpenAI text-embedding-3-large，配置为1,536 dimensions／cosine。旧 BGE-M3 的1,024 dimensions index保留用于 rollback，不会把不同 dimensions 的 vector 混入同一个 index。index 设置在创建后无法更改，因此创建前要确认最新官方规范和实际输出 shape。"
    - question: 在什么阶段可以判断导入完成？
      answer: "merge 或本地 test 本身不代表完成。在 Preview 中确认 Pagefind 和 UI fallback；在 Production 中确认已发布 commit 与 corpus 一致、index 同步、mutation 收敛、相关搜索、rate limit 和停止步骤后，才记录为正在运行。"
---

## 先理解：Cloudflare Vectorize 是什么？

Cloudflare Vectorize 是 Cloudflare 的向量数据库。它保存 **embedding**（把文本、图像和其他数据的特征与语义表示为数值序列），并查找与输入语义相近的信息。如[官方概览](https://developers.cloudflare.com/vectorize/)所述，它可用于语义搜索、推荐、分类，以及未来 RAG 应用的检索层。

普通关键词搜索擅长快速找到包含产品名、专有名词或错误代码的页面。Vectorize 则适合词语不完全一致的情况。例如，用户询问“我想改进网站”时，即使表述不同，也可能找到“持续 Web 运营支持”或“技术顾问”页面。

> Vectorize 本身不是生成回答文本的聊天机器人。它是选择相关公开页面及其 URL 的搜索基础。以后即使加入生成式 AI，也可以把这些搜索结果作为回答的证据层。

## 加入它后有什么改善？

- **可找到改述和问句**：读者无需知道站点的准确术语，也更容易到达与意图相近的页面。
- **可跨内容连接相关知识**：表述不同的文章、FAQ 和服务页面仍可按语义相近性被发现。
- **补强而非取代现有搜索体验**：只把它用于明确的“查找相关信息”操作，同时保留关键词搜索，就无需重做整套 UI 也能提升可发现性。
- **可在以后复用检索层**：返回原页面和 URL 后，同一层可用于带引用的 AI 回答、相关文章或内容推荐。

语义搜索并非魔法。质量取决于正确选择的公开 corpus、合适的 embedding model，以及对真实搜索结果的评估。它不应取代查找准确产品名或代码的普通搜索。

## 先叠加在现有搜索之上

初次导入时，最容易使用的模式是保留现有关键词搜索，只在读者明确要求查找相关信息时调用 Vectorize。

1. 产品名、专有名词和短的精确词语使用 Pagefind 等普通搜索。
2. 问句、改述和相邻主题由 Vectorize 关联搜索补充。
3. embedding provider 或 Vectorize 失败时，仍保留普通搜索。

这些是导入时应先判断的价值和适用范围。之后，本文将 Acecore Systems、World Foundation、Acecore Schools 和 Aceserver Portal 的导入与调查记录汇总为可在其他 Astro／Cloudflare Pages 站点复用的实现与运维实践。

> **当前运行状态（2026年7月31日再次确认）：** 常规 Pages Preview 不拥有 Vectorize 或 D1 binding，保持 `SEARCH_ENABLED=false`，只使用 Pagefind。关联搜索和自动同步只对 Production index 运行。在更新本文前确认的最近一次 Production 同步中，核对已发布 commit 与 corpus 后，37个页面和256 vectors 已收敛：`current` 和 `expected` 均为256，upsert 1个，delete 1个。[GitHub Actions run #30604713256](https://github.com/acecore-systems/acecore-systems/actions/runs/30604713256) 下文提到的 Preview index 是导入阶段的记录，不是当前的完成条件。

在多个仓库导入和试用后会发现，仅仅“生成 embedding 并调用 `query()`”远远不够。还要决定如何构建搜索 corpus、如何让 Preview 只保留 Pagefind 同时保护 Production、如何防止错误同步导致大量删除，以及已发布页面是否真的与 index 一致。实际运维中，Vectorize API 调用前后的设计比调用本身更重要。

## 结论：搜索采用 fail-soft，同步与发布采用 fail-closed

最容易复用的原则，是让面向用户的搜索和面向运维人员的同步采用不同的失败策略。

| 对象            | 失败策略    | 原因                                                                      |
| --------------- | ----------- | ------------------------------------------------------------------------- |
| 普通站内搜索    | fail-soft   | 即使 Vectorize 停止，也继续使用 Pagefind 搜索                             |
| 相关搜索 API    | fail-soft   | 快速结束错误，不破坏普通搜索结果                                          |
| corpus 生成     | fail-closed | 对象页面、locale、数量或 metadata 不合法时不生成                          |
| index 同步      | fail-closed | 无法确认目标环境、现有 ID、删除比例和 mutation 时不做修改                 |
| Production 启用 | fail-closed | 仅在已发布 commit 与 corpus 一致、Production 同步与 mutation 收敛后才启用 |

这样既能满足“AI 搜索故障时站内搜索仍可使用”，又能满足“同步处理有疑点时一条记录也不修改”。

## 在四个仓库中确认的状态

把导入记录写成文章时，不将所有状态统称为“已导入”同样重要。本次记录中混合了 Production 运行、本地验证、Preview 界面确认和事前调查。

| 仓库             | 已记录和确认的状态                                                                                           | 获得的经验                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Acecore Systems  | OpenAI 1,536 dimensions index仅在 Production 运行；同步已在37个页面和256 vectors收敛，Preview只使用 Pagefind | 与 Pagefind 并用、已发布 HTML corpus、D1 rate limit、安全的 Production 同步与 dimensions 迁移 |
| Aceserver Portal | 确认用于 Acecore 信息的 Vectorize 搜索正在 Production 运行                                                   | 不要混合企业信息与 WIKI 规则搜索的搜索目标                                                    |
| World Foundation | 在本地从72 sources生成134 vectors并通过37 tests；尚未发布                                                    | content hash、fail-closed 同步、发布前门禁隔离                                                |
| Acecore Schools  | 仅完成现有架构调查；尚未创建 index 或开始实现                                                                | 添加 binding 前先确定 API、corpus、权限和环境架构                                             |

Acecore Systems 将导入分为三个阶段：[实现 PR #40](https://github.com/acecore-systems/acecore-systems/pull/40)、[Production 准备 PR #41](https://github.com/acecore-systems/acecore-systems/pull/41) 和 [Production 启用 PR #42](https://github.com/acecore-systems/acecore-systems/pull/42)。初始记录中的 Preview／Production 同步已不是现行运行方式：[PR #47](https://github.com/acecore-systems/acecore-systems/pull/47) 将常规 Pages Preview 改为只使用 Pagefind，现在只有 Production 会同步并提供相关搜索。

首次 Production 同步的 [GitHub Actions run](https://github.com/acecore-systems/acecore-systems/actions/runs/30539728752) 核对了已发布 commit 和 corpus version，并从36个已发布日语页面生成250 vectors。同步结果为 upsert 250个、delete 0个。将代码 merge、index 准备、首次同步和搜索启用拆分为不同变更后，各阶段的停止条件都更加明确。

## 不替换 Pagefind，而是划分职责

导入 Vectorize 的目的并不是丢弃现有搜索。

Pagefind 从 build 完成的 HTML 生成静态 index，并在浏览器中进行搜索。它适合作为查找产品名、服务名和专有名词等明确词语的普通搜索，而且不依赖 embedding provider 或 Vectorize 的状态。

Vectorize 适合搜索词与正文不完全一致，或需要通过相关概念查找页面的情况。不过，它需要生成 embedding 并执行 Vectorize query，因此还必须考虑外部服务的延迟、错误和使用量。

因此，我们也分开设计了 UI。

1. 输入时显示 Pagefind 候选项
2. 仅在用户明确执行相关搜索时调用 API
3. 为 API 设置较短的 timeout
4. API 失败时不移除 Pagefind 结果
5. 使用 kill switch 只停止相关搜索

当前搜索模态框在输入时仅使用浏览器内的 Pagefind 显示候选项。只有读者执行“搜索”时，才会按照界面说明把搜索词发送到 OpenAI Embeddings API，并在 Vectorize 中与本站公开信息进行比对。界面会提醒不要输入个人信息或机密信息，并将这类发送与普通关键词候选项区分开来。

采用这种架构，Vectorize 可以扩展搜索体验，但不会成为整个搜索的单点故障。

## 从已发布 HTML 而不是 CMS 草稿生成 corpus

在多个网站中差异特别明显的一点，是把什么作为搜索对象的事实来源。

如果将 CMS 草稿或 Markdown 直接放入 corpus，就会与实际发布页面产生差异。

- 混入 `draft` 或 `noindex` 内容
- 保留指向外部 canonical 的页面
- 混入来自 layout 的重复文本或管理 UI
- 无法反映只在转换后出现的 title、description 和 URL
- 多语言网站中的 locale 边界变得模糊

因此，我们读取 Astro build 后生成的 HTML，在反映发布条件后再生成 corpus。

Acecore Systems 只包含满足以下条件的日语页面。

- 具有 same-origin canonical
- `lang` 为日语
- 没有 `noindex`
- 不是 `/admin`、`/api`、404 或提交完成页面
- 可以排除导航和 `data-vectorize-ignore` 等非正文元素
- 具有已发布的 root-relative URL 和 title

正文以850字符为目标、1,200字符为最大值、120字符为 overlap 分成 chunk。这些数值并不是通用答案，而是根据本次页面长度和日语正文采用的运维值。在其他网站中，应根据实际文档结构和搜索评估进行调整。

## 使用 content hash 实现确定性的差量同步

如果 vector ID 使用连续编号或运行时 UUID，即使重新生成相同 corpus，所有记录也会得到不同 ID。这样连未变化的正文也需要重新 embedding，还会需要大量删除旧 ID。

因此，我们根据 locale、已发布 URL、chunk 编号和正文生成 SHA-256，并以确定性方式生成 ID 和 corpus version。

```js
const identity = [locale, url, String(chunkIndex), text].join("\u001f");
const digest = sha256(identity);

const vector = {
  id: `v1-${digest.slice(0, 48)}`,
  text,
  metadata: {
    locale,
    url,
    chunkIndex,
    contentHash: digest,
  },
};
```

同步时比较预期 ID 与当前 index ID。

- 对只存在于预期侧的 ID 进行 embedding 和 upsert
- 两侧都存在的 ID 视为未变化并 skip
- 只存在于 index 侧的 ID 作为删除候选
- 如果混入不属于 `v1-` 管理范围的 ID，则在 mutation 前停止

这样，相同已发布内容会生成相同 corpus，每项差异的原因也更容易说明。

## 将 embedding model 与 index 设置固定为契约

初始实现记录使用了 Workers AI 的 [`@cf/baai/bge-m3`](https://developers.cloudflare.com/workers-ai/models/bge-m3/)，并在确认实际输出 shape 后统一为1,024 dimensions／cosine。现行 Acecore Systems 实现在另行命名的目标 index中使用 [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings) 的 `text-embedding-3-large`，配置为1,536 dimensions／cosine。只有 Production index 用于同步和查询；Preview 只使用 Pagefind。旧 BGE-M3 index保留用于 rollback，不同 dimensions 的 vector 不会混入同一个 index。

比 model 名称本身更重要的是，让以下四处遵守同一契约。

| 位置            | 固定值                           |
| --------------- | -------------------------------- |
| corpus metadata | model、dimensions、metric        |
| Vectorize index | dimensions、metric               |
| 搜索 API        | model、embedding length          |
| 同步脚本        | 允许的 model、dimensions、metric |

正如 Cloudflare 的 [Create indexes](https://developers.cloudflare.com/vectorize/best-practices/create-indexes/) 所述，index 的 dimensions 和 metric 创建后无法更改。如果 model 资料不明确，不要依靠推测创建 index，而要检查现行文档和实际输出。

使用 metadata filtering 时，需要在导入 vector 前创建 metadata index。仅仅在之后添加 metadata index，并不会让先前导入的 vector 成为过滤对象，必须重新 upsert。

产品 limits 也会变化。截至2026年7月31日再次确认，Vectorize V2 的 Workers API upsert batch 上限为1,000，HTTP API 为5,000。普通 `topK` 上限为100；使用 `returnValues: true` 或 `returnMetadata: "all"` 时为50。实现时必须重新确认[现行 limits](https://developers.cloudflare.com/vectorize/platform/limits/)和[client API](https://developers.cloudflare.com/vectorize/reference/client-api/)。

Acecore Systems 使用 HTTP API 每批同步200个，搜索使用 `topK: 15`，并没有直接把产品上限作为处理数量。产品上限和团队能够安全重试、监控的 batch 数值应分别决定。

## 先 upsert 并等待收敛，然后再 delete

Vectorize 的 insert、upsert 和 delete 都是异步处理。API 返回成功，并不代表变更已经反映到 query。

安全同步采用以下顺序。

1. 验证 corpus 与 index 设置
2. 通过 pagination 获取当前全部 vector ID
3. 计算 upsert 对象和删除候选
4. 以 batch 执行 upsert
5. 等待返回的 `mutationId` 到达 `processedUpToMutation`
6. upsert 收敛后再执行 delete
7. 同样确认 delete mutation 收敛

Cloudflare 的 [Vectorize API](https://developers.cloudflare.com/vectorize/reference/client-api/) 也明确说明 mutation 是异步的。不要只使用固定秒数的 sleep，而应通过 mutation ID 确认完成。

此外，同步脚本还设置了以下停止条件。

- 目标 index 名称不完全匹配 Production index 的 allowlist
- 尝试由同步处理自动创建 Production index
- `--confirm-production` 的值与目标 index 名称不一致
- dimensions／metric 与契约不同
- corpus 的 locale、URL、metadata 或 content hash 不合法
- source page 数或 vector 数超过预期上限
- 现有 index 中混入非管理 ID
- 删除超过现有 vector 的20%
- 超过 retry 上限或 mutation 等待时间

即使是有意的大量删除，也应放入单独审查的迁移流程，而不是在普通 workflow 中 override。普通 push 或 schedule 不允许这样做。

## Preview 只使用 Pagefind，Production 才是唯一的高权限同步目标

导入初期分离 Preview 与 Production 有助于识别权限和停止条件。但常规 Pages Preview 并不需要 Vectorize 或 D1 binding。当前配置保持 `SEARCH_ENABLED=false`：Preview 用于确认 Pagefind 候选项、fallback 和布局。Vectorize／D1 binding、同步 token 和 Production Environment 都限制在 Production。

需要隔离以下对象。

- Vectorize index
- D1 等辅助资源
- Wrangler environment
- API token
- GitHub Environment
- 同步 workflow 的 concurrency
- 用于启用的 repository variable
- kill switch

同步 token 仅授予目标 Cloudflare account 的 Vectorize Read / Write，并与 OpenAI API key分离。Production 只能从受保护的 `main` 执行，并通过 GitHub Environment reviewer。

这里也存在运维上的 trade-off。如果 Production Environment 设置了 required reviewer，从 schedule 启动的同步也可能等待审批。在添加 cron 前，需要决定只批准首次发布、每次定期同步都批准，还是将定期同步拆分到其他 job。

## 只把与“当前已发布 commit”对应的 corpus 同步到 Production

GitHub 的 `main` 与 Cloudflare Pages 当前已发布的 commit 并不总是相同。push 后 build 可能仍在运行，也可能 deployment 失败，导致上一个 commit 仍在发布。

因此，Production 同步会在已发布网站放置 build marker，并确认以下事项。

- marker 中的 commit 是40字符 Git SHA
- 该 commit 存在于 repository
- 它是受保护 `main` 的祖先
- checkout 该 commit 后可以重新生成 corpus
- marker 的 corpus version 与重新生成结果一致
- mutation 前同一 commit 仍处于发布状态

完成条件是通过 GitHub repository 连接的 Cloudflare Pages deployment。我们不会把本地或 Direct Upload 临时发布的成果物作为 Production 同步基准。

这样可以防止“把新 corpus 同步到旧网站”或“只把 deployment 失败 commit 的内容显示在搜索结果中”等偏差。

## 为公开搜索 API 设置成本与隐私边界

搜索 API 是将用户输入发送到 embedding provider 的公开 endpoint。除了搜索准确度，还需要设计滥用、计费、日志和返回 URL。

Acecore Systems 实现了以下边界。

| 项目         | 实现示例                                                      |
| ------------ | ------------------------------------------------------------- |
| method／格式 | 只接受 same-origin JSON POST                                  |
| body         | 最大2KiB；即使没有 `Content-Length`，也会在读取 stream 时停止 |
| query        | NFKC 规范化后2～160字符                                       |
| locale       | 仅 `ja`                                                       |
| rate limit   | D1 固定窗口：client 每分钟20次、global 每分钟300次            |
| 停止         | 使用 `SEARCH_ENABLED` 只停止相关搜索                          |
| query        | 不把 raw query 保存到日志、corpus 或 Vectorize metadata       |
| 结果 URL     | 只允许 same-origin 的已发布 root-relative URL                 |
| 错误         | 返回各阶段的结构化 code，不把正文写入日志                     |

client 侧 UUID 可以由用户修改，因此不能成为强有力的计费边界。应结合根据 Cloudflare 连接信息生成的 client key、global limit 和使用量监控。还可根据规模与威胁模型考虑 Turnstile、WAF 或 Durable Objects。

本架构使用 D1 进行 rate limit，但 D1 并不是导入 Vectorize 的必备条件，R2 也一样。应根据原文从哪里获取、rate limit 状态放在哪里进行选择。

## 为 Vectorize 搜索和 AI 引导建立不同的契约

Acecore Systems 具有独立于站内“相关内容”搜索的 AI 引导功能。后者仅在读者明确执行搜索时将搜索词发送到 OpenAI Embeddings API，并在 Vectorize 中与本站公开信息比对 embedding。前者则将问题和最近对话发送到 Acecore 共用 AI API，并使用 OpenAI 生成回答。

不要把两者模糊地合并为“AI 搜索”。应分别设计传输的数据、信息源范围、失败时的显示、使用量和隐私说明；绝不能在 Vectorize 搜索失败时悄悄把 fallback 发送给 AI 引导。

## 不要混合搜索目标的职责

在 Aceserver Portal 中，我们分开了 Acecore 服务信息与 Minecraft 服务器规则和步骤的搜索目标。

- 关于 Acecore 的问题使用 Vectorize 搜索
- 服务器规则使用官方 WIKI 搜索
- Vectorize 失败时，不 fallback 到无关的 WIKI 回答
- 只链接被选为依据的 WIKI 文章
- 不推测无法在 WIKI 中确认的规则

这一点在 RAG 和引导聊天中也很重要。可搜索位置越多，越需要先决定哪些问题发送到哪个信息源，以及找不到信息时哪些内容不能回答。

## 实际发生的失败与后续改进

根据多个 repo 的记录，可以整理出容易重复发生的问题。

| 症状                                | 原因                                     | 后续措施                                                         |
| ----------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| 添加了 binding，但没有形成搜索功能  | API、corpus、reindex、权限和 UI 尚未设计 | 创建 index 前先决定搜索契约和运维流程                            |
| 创建 index 时推测 dimensions        | 只看 model 名称，没有检查实际输出        | 创建前检查实际 embedding length                                  |
| metadata filter 无法检索现有 vector | vector 在 metadata index 之前导入        | 先创建 metadata index，再重新 upsert 现有 vector                 |
| 同步后的 query 不稳定               | mutation 为异步处理                      | 通过 `mutationId` 和 index info 等待收敛                         |
| 发生大量重新 embedding 和 delete    | vector ID 每次运行都变化                 | 使用源自 content hash 的确定性 ID                                |
| schedule 一直处于 waiting           | Production Environment 要求审批          | 同时设计定期同步与审批策略                                       |
| Windows 上 test 或 Git 失败         | `spawn EPERM`、lock、cache 等环境因素    | 比较 baseline、固定 Node version，并通过全新的 `npm ci` 隔离问题 |
| API timeout 后直接判断为代码故障    | 临时故障、payload 错误或 provider 延迟   | 使用正确 contract 重新测试，区分单次结果与可复现问题             |

同样重要的是，不要把依赖关系或执行环境的问题错误归因于 Vectorize 变更。检查变更前 baseline 是否也出现相同错误，并区分代码故障与环境故障。

## 将“已导入”分为四个阶段记录

在文章或完成报告中区分以下状态，可以减少误解。

| 状态                 | 完成条件示例                                              |
| -------------------- | --------------------------------------------------------- |
| 已实现               | API、corpus、同步脚本和 UI 已存在于 branch                |
| 已本地验证           | build、类型检查、契约 test 和 dry-run 成功                |
| 已确认 Preview       | 已确认 Pagefind 候选项、相关搜索不可用时的显示和 UI       |
| 正在 Production 运行 | 已同步已发布 commit，并确认 mutation 收敛、API 和停止步骤 |

World Foundation 已完成本地验证，但 index、secret、deployment 和 browser QA 尚未完成，因此没有记录为正在 Production 运行。Acecore Schools 仍处于调查阶段。

另一方面，Acecore Systems 已确认分阶段 PR、Production 首次同步、Production 启用、已发布 marker 和实际搜索 API。

不仅记录成功的 test 数，还写清哪些项目尚未确认，才是对下一位维护者最有用的运维信息。

## 横向推广时的最小架构

推广到其他 Astro／Cloudflare Pages 网站时，最小架构如下。

```txt
Astro build
  -> 已发布 HTML
  -> Pagefind index
  -> Vectorize corpus（反映 locale / canonical / noindex）

Cloudflare Pages Function
  -> input validation
  -> OpenAI Embeddings API
  -> Vectorize query
  -> 仅返回已发布 URL

GitHub Actions
  -> 解析已发布 commit
  -> 重新生成 corpus
  -> 仅同步 allowlist 中的 Production index
  -> upsert 收敛后 delete
  -> 记录 corpus version

Pages Preview
  -> SEARCH_ENABLED=false
  -> 确认 Pagefind 候选项和 UI fallback
```

没有必要一开始就加入 LLM 回答生成。首先构建能够安全返回相关页面、并可以进行评估的搜索。以后增加回答生成时，也要把获取的原文、可引用 URL 和不能回答的条件设计为单独契约。

## 总结

导入 Cloudflare Vectorize 的难点并不是 nearest-neighbor query 本身。

要把哪些内容作为公开信息加入 index、如何识别未变化的 chunk、如何停止错误同步、如何与已发布 commit 保持一致，以及故障时如何保留普通搜索。向多个 repo 横向推广时，正是这些运维设计决定了质量。

本次结论很简单。

- 保留 Pagefind 作为主要搜索
- 将 Vectorize 作为语义搜索的辅助功能
- 从已发布 HTML 生成 corpus
- 根据 content hash 确定性地生成 ID 和 version
- Preview 只使用 Pagefind，并将 Vectorize、D1 和同步权限限制在 Production
- 搜索采用 fail-soft，同步与发布采用 fail-closed
- 将“实现”“本地验证”“Preview 界面确认”“Production”记录为不同状态

如果先建立这些边界，Vectorize 就不再是一次性 AI 功能，而更容易作为可持续更新的搜索基础设施运行。

---
title: "将个人资料导入草稿：比较、选择与审慎发布"
description: "从公开URL、文本、CSV、HTML和JSON导入个人资料草稿，说明受限的图片与音频获取、链接顺序、重读失败时保留候选，以及本人保存和发布的边界。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "实现已确认，真实账户验收仍待完成"
  text: "文件输入以及限定的公开URL、图片和音频导入已完成实现、集成与生产部署。已检查合成数据操作和部分公开媒体的获取。本人权利确认、保存与发布、官方登录集成，以及来源429问题的解决仍是独立的未完成事项。"
---

将已有个人资料迁移到另一个编辑器时，应先比较当前值与导入候选，再决定是否替换。本文以匿名化实现为例，说明资料导入与发布之间的边界。

## 用一项简介测试手动编辑的保留

手动修改现有简介，再从不同文本生成导入候选。依次确认未选项目保留当前值、选择替换时可核对、取消后恢复原值。应用后比较草稿与公开页面，检查仅导入不会改变公开内容。

[OWASP：验证输入格式、值和长度](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## 先明确支持的输入格式

除文本、CSV、静态HTML、通用JSON与模板外，现在也从支持的公开资料URL获取候选。HTML仅作为输入解析，不在公开页面执行脚本或原始HTML，并检查长度、数量、格式和HTTPS链接。

链接按出现顺序读取，保留URL内部成对的括号。Markdown链接中的URL不会被重复提取；在其他位置再次出现的同一URL仍作为独立候选保留。未经本人判断，不自动整理顺序或重复项。

## 在替换现有值之前先审阅候选内容

不要立即发布解析结果；先与当前值进行比较。资料所有者逐项选择字段，也可以先编辑候选值，再将其应用到编辑器。应用所选字段会替换当前值，因此每次重新导入都应查看差异。更改也可以撤销。这些控制并不保证会自动解决其他页面或其他人所做编辑产生的冲突。

重读同一URL或文件失败时，保留之前的候选、本人编辑、选择、CSV列映射和已获取媒体。显示获取错误，并注明这是上次的候选。输入来源、方式、文本或文件改变，或重读成功后才替换候选。仅保留候选不会自动应用、保存或发布。

## 区分URL获取与官方集成

URL获取仅支持Profcard、lit.link、POTOFU、HTML Meishi和foriio已知的公开结构。验证来源身份、索引排除指示和候选一致性，不扩展到需要认证的页面或不允许的目标。这不代表与各服务建立了官方登录或API集成，也不代表完整迁移个人资料。

通用JSON模板和各服务的能力说明仍可使用。不支持的URL或动态内容通过粘贴、文件导入处理。来源返回401、403、429等时停止，不通过其他浏览器或API绕过限制。

[OWASP：限制URL目标和重定向的SSRF防护](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## 确认获取到的图片或音频后再选择

除GIF头像外，还可从已知链接卡片和公开帖子生成作品图片、标题候选。本人链接栏内允许的GitHub图片、WAV、MP3链接和公开Dropbox单文件也得到有限支持。POTOFU初始HTML的帖子卡片属于支持范围；说明文字、额外页面、嵌入播放器及foriio作品图库获取不属于已完成范围。

获取时重新确认来源与候选，并检查host、path、重定向、MIME、实际文件、容量和期限。本人查看或试听同一份已获取数据，确认权利、标题和说明后选择。只把选中的附件加入未保存作品，通过现有上传路径准备，再正常保存。保存时再次验证所有者、资料、媒体类型和ready状态，保留手动输入及公开snapshot。

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">获取、选择、保存与发布的边界</strong>
    <span>重读失败保留之前候选，导入本身不会改变公开snapshot。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>读取限定输入</strong>
      <span>检查支持的URL、格式与获取限制。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>比较并选择候选</strong>
      <span>确认图片、音频并保留手动编辑。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>保存草稿</strong>
      <span>正常保存选中字段与准备好的附件。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>本人发布</strong>
      <span>通过独立操作更新公开snapshot。</span>
    </li>
  </ol>
</figure>

## 不根据导入文本推断资质或权利

简介或外部页面中的措辞本身不能证明资质、所属关系、类别或许可。将可作为候选导入的说明文字，与需要身份核验或申请的信息分开。外部信息发生变化时，也不会自动更新或发布所有者确认过的个人资料。

## 将保存与发布保留为不同的决定

应用导入候选、保存草稿和更新公开快照是不同操作。验收测试还需覆盖保存冲突；保存成功不代表资料已经发布。公开关联链接（包括公开日历 URL）之前，应由本人检查其公开值，并避免把私人备注混入公开数据。

## 相关更新：从公开日程打开 HTTPS 链接

另一项与个人资料导入独立的编辑更新，为公开日历日程增加 HTTPS 链接。点击日程会在新标签页直接打开目标；没有 URL 的日程仍会显示，但不会生成可操作的链接。验证 URL 格式、拒绝嵌入的凭据并限制输入长度。添加 **noopener noreferrer**，并在可访问名称中说明会打开新标签页。

相关表单还移除了协作可用时段中不必要的标题字段，以及私人备注字段。已确认数据库修改、CI、生产部署和使用验证数据的页面显示；本人登录后保存真实日程并发布的验收仍未完成。

## 已确认的内容与下一步验收

已确认限定URL、GIF、作品图片和音频的实现、CI与生产部署，以及合成数据编辑、撤销和部分公开文件获取。POTOFU来源资料仍返回429；CDN文件获取成功不等于资料获取成功。本人从权利确认到保存、发布的完整验收尚未完成。确认日期：2026年10月14日。

关于公开 CSS 的边界，请参阅[安全处理用户 CSS 与版本固定的公开主题](/insights/user-css-versioned-theme-safety/)。关于登录边界，请参阅[跨服务的会话生命周期](/insights/multi-service-session-lifecycle/)。

---
title: "Dynmap迁移到512px瓦片：公开验证与R2旧图像清理"
description: "介绍512px瓦片迁移中渲染范围、普通与缩放图像、R2保存位置的验证方法。通过8台服务器、89张地图的实例说明删除前检查及费用比较条件。"
date: "2026-09-27T22:40:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["技术", "Cloudflare"]
callout:
  type: note
  title: "已验证的范围"
  text: "2026 年 9 月 11 日的生产审计确认迁移及旧图片清理完成。账单金额和正常运行时的费用降幅尚未核实。"
---

我们对从 Cloudflare R2 分发地图图片的 Dynmap 配置进行了格式切换，并清理旧数据。范围是八台服务器、89 张地图。关键在于顺序：先确认新图片已公开显示，再删除旧图片。

## 迁移Dynmap瓦片前要比较什么

考虑512px瓦片时，应在相同渲染范围内比较普通图像与缩放图像，分别记录浏览请求和渲染写入。先列出旧prefix候选，确认新图像的公开显示和从世界重新渲染的恢复方法后，再决定是否删除。

[R2：容量与操作次数的测量方法](https://developers.cloudflare.com/r2/platform/metrics-analytics/)

## 限定渲染范围，分阶段切换

正式地图统一采用 512px 瓦片。需要补充渲染的 21 张地图，以公开中心为起点限制在半径 2,000 方块内。我们没有等待整个世界渲染完毕，切换期间仍保持日常更新。

同时改进了 R2 通信失败后的重试、写入失败时待更新内容的保留，以及缩放图片“确实不存在”和“读取出错”的区分。[Dynmap fork PR #9](https://github.com/acecore-systems/dynmap/pull/9) 记录了重启后恢复缩放更新的修复。这些改动并不意味着 Cloudflare 自身不会发生故障。

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-dynmap-512-migration">
  <figcaption>
    <strong id="diagram-dynmap-512-migration">先验证新图像，再清理旧数据</strong>
    <span>先审计公开显示与存储位置再清理。旧图像没有备份，正常运行时的费用节省也尚未确认。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 5l9-3 9 3v14l-9 3-9-3z M12 2v20 M3 5l9 3 9-3 M3 12l9 3 9-3"/>
        </svg>
      </span>
      <strong>限定范围并生成新图</strong>
      <span>确定 512px 范围和渲染区域，在常规更新继续时分阶段生成新图像。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M16 16l5 5"/>
        </svg>
      </span>
      <strong>审计公开图像与存储位置</strong>
      <span>分别检查普通与缩放图像、Web 资源、实时 JSON 和正式存储前缀。</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 7h16 M9 7V4h6v3 M7 7l1 14h8l1-14"/>
        </svg>
      </span>
      <strong>审计后清理旧数据</strong>
      <span>审计后删除旧图像与 hash。旧图像没有备份，需要时必须从世界重新渲染。</span>
    </li>
  </ol>
</figure>

## 分别验证公开地图与存储

切换后，我们对 89 张公开地图各检查一张普通图片和一张缩放图片，共 178 张。除了确认图片为 512px，还检查了 Web 资源和实时 JSON 的更新。在 R2 侧，我们审计保存路径是否与 89 个正式地图前缀一致，并确认旧普通图与日间图的 192 个前缀已经清空。

之后才删除旧图片及旧 hash 文件，共 11,707,356 个对象、约 51.71 GB。旧图片内容没有备份，需要时必须从世界重新渲染。现行图片、世界、配置和 JAR 备份仍保留。最终审计确认旧图片、临时阶段数据和旧 hash 文件均未残留，而非只依据删除进程正常结束。

## 不要把容量变化等同于账单变化

在两个包含迁移工作的连续 24 小时区间中，成功的 PutObject 从 240,835 次降至 90,423 次。两个区间都包含迁移操作，因此不能据此推算正常运行时的降幅或月费。实际账单金额尚未核实。

类似迁移应分别查看 [R2 操作量与存储量指标](https://developers.cloudflare.com/r2/platform/metrics-analytics/)，再依次检查公开显示、现行图片和旧数据。删除之前，应先确定目标范围与恢复方法。

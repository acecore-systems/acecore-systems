---
title: "使用 Cloudflare Pages 和 D1 构建受保护的运维仪表盘"
description: "匿名介绍如何通过 Cloudflare Access 保护入口，并由 Pages Functions 读取 D1 运维汇总。区分已验证的生产发布、认证后界面、数据库索引使用，以及尚未测试的项目。"
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "区分实现、本番界面与索引验证"
  text: "本匿名案例实现了受 Access 保护的 Pages 界面和 D1 只读汇总，并确认了 GitHub 连接的生产发布、认证后 UI 和生产查询对索引的使用。尚未验证大规模负载或多组织性能。"
---

运维信息分散在日志和数据库中时，工作人员可能难以安全地确认当前状态。本文匿名介绍一个运维仪表盘案例，说明如何验证访问边界、数据汇总和发布过程。文中不包含域名、账号、帖子内容或实时运营数值。

## 从界面和API验收一项聚合

先选择指定期间件数等一项聚合，用已知测试数据核对界面数值。测试能否区分空期间与读取失败，并确认认证前后的API直接访问，再增加聚合项。索引应通过该筛选条件的查询计划验证。

[Cloudflare D1：根据查询条件验证索引](https://developers.cloudflare.com/d1/best-practices/use-indexes/)

## 将页面和 API 一并放入访问边界

仅隐藏 Cloudflare Pages 静态页面并不足够，因为数据 API 仍可能被直接调用。应将界面和 API 都纳入 Cloudflare Access 的保护范围，仅允许运维人员读取数据。验收时应分别在认证前后测试页面和数据 API。本案例已在生产环境确认页面的认证边界，以及专用登录后 UI 能显示数据。现有记录未确认对 API 端点直接发起未认证请求的结果，因此这仍是单独的验收项目。不要把认证密钥放进浏览器代码。

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-private-dashboard-access-and-aggregation">
  <figcaption>
    <strong id="diagram-private-dashboard-access-and-aggregation">同时保护页面与 API</strong>
    <span>尚未测试直接以未认证方式访问 API；检查范围为单一运行环境。</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a4 4 0 0 1 8 0v2M9 13h6"/></svg></span>
      <strong>已认证的仪表板</strong>
      <span>运维人员通过 Access 认证后查看受保护的汇总数据。</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3M20 5v5M4 12v7c0 1.7 3.6 3 8 3"/></svg></span>
      <strong>只读 API</strong>
      <span>在同一边界内读取 D1。尚未确认直接访问 API URL 时会拒绝未认证请求。</span>
    </li>
  </ol>
</figure>

## 将写入操作与只读汇总分开

Pages Functions 的 GET 端点查询 D1，并将逐小时数量、近期处理状态和执行模式汇总到一个响应中。应把仪表盘 API 本身限定为只读用途，而不是依赖界面隐藏按钮。明确时间范围、时区，以及已确认与待处理状态的含义，避免把不同性质的数量相加。缺失或未解决的值应单独显示，不能按成功操作或零处理。

## 根据汇总查询验证 D1 索引

运维界面会反复筛选最近时间段，因此仅凭界面响应无法证明索引有效。为实际汇总条件添加索引后，应在生产 D1 查看查询计划并确认使用了预期索引。创建索引与确认查询使用索引是两项独立检查。本案例已在生产中确认这两点，但没有通过基准测试证明响应速度提升或大规模负载下的稳定性。

## 生产发布后检查认证和页面呈现

通过 GitHub 集成将 Pages 发布到生产环境，确认目标提交对应的部署成功且自定义域名有效。随后检查认证前页面是否受保护，以及登录后仪表盘数据是否正常显示。CI 或部署成功本身不能证明认证后的工作人员能看到生产界面。

本匿名案例在一个运维环境中验证了访问边界、生产页面和 D1 汇总查询对索引的使用。尚未测试多组织间的权限隔离、用户数量增加后的负载，以及所有认证设置下的渗透场景。更广泛的 Pages 网站架构见[Cloudflare Pages 网站架构](/insights/astro-cloudflare-site-architecture/)。

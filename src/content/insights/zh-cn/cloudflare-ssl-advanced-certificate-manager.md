---
title: "Cloudflare 过去的付费 SSL 选项到底是什么：从 Dedicated SSL 到 Advanced Certificate Manager"
description: "Cloudflare 过去的付费选项“Dedicated SSL Certificates（专用 SSL 证书）”在 2021 年升级并更名为“Advanced Certificate Manager（ACM）”。本文说明它与免费 Universal SSL 的区别，以及何时需要 ACM。"
date: 2026-03-31T00:00
author: gui
tags: ["技术", "Cloudflare", "安全", "基础设施"]
image: /uploads/acecore-generated/blog-cloudflare-ssl-advanced-certificate-manager.webp
lastUpdated: "2026-09-26T19:15:00+09:00"
---

Cloudflare 于 2021 年将原 **Dedicated SSL Certificates** 升级为 **Advanced Certificate Manager（ACM）**。选择证书前，应先确认主机名和 DNS 接入方式。

## Universal SSL 的覆盖范围

在 **完整 DNS 接入**中，免费的 Universal SSL 通常覆盖根域名和一级子域名。`*.example.com` 包含 `www.example.com`，但不包含 `api.staging.example.com`。在 **CNAME（部分）接入**中，Cloudflare 会为每个经代理的主机名签发 Universal 证书，不受子域名层级限制。因此，多级子域名并非一定需要 ACM。

Cloudflare 现在将 Universal 证书描述为免费且不共享；“与其他网站共用证书”的旧说法已不适用。

## 何时考虑 ACM

ACM 是付费附加服务，可选择 CA、验证方式、有效期及主机名。一张高级证书最多包含 50 个主机名，其中必须包含根域名。可选有效期取决于 CA 和套餐；**一年期仅限使用 SSL.com 的 Enterprise 客户**，并非所有套餐都能任意选择 14 至 365 天。

完整 DNS 接入需要自动保护更深层的代理主机名时，可考虑 **Total TLS**；只保护特定名称时，也可选择高级证书或自定义证书。Total TLS 要求完整 DNS 接入，且不为包括 Cloudflare Tunnel 在内的部分产品主机名签发证书。

**高级证书不适用于 Cloudflare Pages 或 R2 的自定义域名。** 它们使用其他证书机制；为 Pages 网站购买 ACM 不会使高级证书应用于 Pages 主机名。

## 购买前核对

1. 列出主机名并确认 DNS 接入方式。
2. 核对 Universal SSL 的实际覆盖范围。
3. 确认所需 CA、有效期和 Total TLS 条件。
4. 在当前套餐的 Cloudflare 控制台确认价格和购买条款。

不要只根据证书的 CN 显示决定购买；应确认所需主机名包含在 SAN 中。

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)

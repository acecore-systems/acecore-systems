---
title: "Cloudflare Universal SSL과 ACM 비교: 유료 인증서가 필요한 경우"
description: 'Cloudflare에서 과거 유료 옵션이었던 "Dedicated SSL Certificates(전용 SSL 인증서)"는 2021년에 "Advanced Certificate Manager(ACM)"로 기능 확장 및 명칭 변경되었습니다. 무료 Universal SSL과의 차이와 ACM이 필요한 경우를 설명합니다.'
date: 2026-03-31T00:00
author: gui
tags: ["기술", "Cloudflare", "보안", "인프라"]
image: "/images/insights/covers/cloudflare-ssl-advanced-certificate-manager-cover-v2.webp"
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Universal SSL과 ACM 비교는 구매 전에 필요한 호스트명과 실제 제공되는 인증서를 대조하는 것부터 시작하세요. [Cloudflare: Advanced Certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)의 적용 제한도 확인하고 Pages나 R2 사용자 도메인은 해당 제품의 인증서 경로로 판단하세요.

Cloudflare는 2021년에 기존 **Dedicated SSL Certificates**를 **Advanced Certificate Manager(ACM)**로 발전시켰습니다. 인증서를 선택하기 전에 호스트 이름과 DNS 설정 방식을 확인하세요.

## Universal SSL의 적용 범위

**전체 DNS 설정**에서 무료 Universal SSL은 일반적으로 루트 도메인과 한 단계 하위 도메인을 보호합니다. `*.example.com`은 `www.example.com`을 포함하지만 `api.staging.example.com`은 포함하지 않습니다. **CNAME(부분) 설정**에서는 프록시된 각 호스트 이름에 대해 깊이와 관계없이 Universal 인증서가 발급됩니다. 따라서 다단계 하위 도메인에 ACM이 항상 필요한 것은 아닙니다.

Cloudflare는 현재 Universal 인증서를 무료이며 공유되지 않는 인증서로 설명합니다. 여러 사이트가 인증서를 공유한다는 이전 설명은 오래되었습니다.

<figure class="article-diagram" data-layout="compare" data-tone="amber" data-count="2" aria-labelledby="diagram-cloudflare-ssl-advanced-certificate-manager">
  <figcaption>
    <strong id="diagram-cloudflare-ssl-advanced-certificate-manager">Universal SSL 적용 범위는 DNS 방식에 따라 달라집니다</strong>
    <span>적용 범위는 DNS 방식에 따라 다릅니다. 하위 도메인 단계만으로 ACM 필요 여부를 판단할 수 없습니다.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6z"/><path d="M9 12h6"/></svg></span>
      <strong>Full DNS setup</strong>
      <span>일반적으로 루트와 한 단계 하위 도메인을 포함하며, 더 깊은 이름은 wildcard 범위 밖입니다.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></span>
      <strong>CNAME / partial setup</strong>
      <span>프록시된 호스트명마다 발급하며 하위 도메인 단계와 관계없습니다.</span>
    </li>
  </ol>
</figure>

## ACM을 고려할 때

ACM은 유료 추가 기능입니다. CA, 검증 방법, 유효기간, 대상 호스트 이름을 선택할 수 있습니다. 고급 인증서 한 장에는 루트 도메인을 포함해 최대 50개 호스트 이름을 지정할 수 있습니다. 선택 가능한 유효기간은 CA와 요금제에 따라 다르며 **1년은 SSL.com을 사용하는 Enterprise 고객으로 제한**됩니다. 모든 요금제에서 14~365일을 자유롭게 선택할 수 있는 것은 아닙니다.

전체 DNS 설정에서 깊은 프록시 하위 도메인을 자동으로 보호하려면 **Total TLS**를 고려할 수 있습니다. 특정 이름만 보호한다면 고급 인증서나 사용자 지정 인증서도 선택지입니다. Total TLS는 전체 DNS 설정이 필요하며 Cloudflare Tunnel 등 일부 제품의 호스트 이름은 제외됩니다.

**고급 인증서는 Cloudflare Pages 또는 R2 사용자 지정 도메인에 적용되지 않습니다.** 이 제품들은 다른 인증서 경로를 사용합니다. Pages 사이트를 위해 ACM을 구매해도 Pages 호스트 이름에 해당 고급 인증서가 적용되지는 않습니다.

## 구매 전 확인

1. 호스트 이름을 나열하고 전체 DNS 또는 CNAME 설정인지 확인합니다.
2. Universal SSL의 실제 적용 범위를 확인합니다.
3. 필요한 CA, 유효기간, Total TLS 조건을 확인합니다.
4. 현재 요금과 구매 조건은 해당 요금제의 Cloudflare 대시보드에서 확인합니다.

인증서의 CN 표시만을 이유로 구매하지 말고 필요한 호스트 이름이 SAN에 포함되는지 확인하세요.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)

---
title: "O que era a antiga opção SSL paga da Cloudflare — de Dedicated SSL para Advanced Certificate Manager"
description: 'A opção anteriormente paga da Cloudflare, "Dedicated SSL Certificates", foi renomeada e ampliada em 2021 como "Advanced Certificate Manager (ACM)". Veja as diferenças para o Universal SSL gratuito e quando o ACM é necessário.'
date: 2026-03-31T00:00
author: gui
tags: ["Tecnologia", "Cloudflare", "Segurança", "Infraestrutura"]
image: "/images/insights/covers/cloudflare-ssl-advanced-certificate-manager-cover-v2.webp"
lastUpdated: "2026-10-06T13:58:01+09:00"
---

A Cloudflare transformou o antigo **Dedicated SSL Certificates** no **Advanced Certificate Manager (ACM)** em 2021. Antes de escolher um certificado, confira os nomes de host e o tipo de configuração DNS.

## Cobertura do Universal SSL

Em uma **configuração DNS completa**, o Universal SSL gratuito normalmente cobre o domínio raiz e subdomínios de primeiro nível. `*.example.com` cobre `www.example.com`, mas não `api.staging.example.com`. Em uma **configuração CNAME (parcial)**, a Cloudflare emite um certificado Universal para cada nome de host com proxy, independentemente da profundidade. Um subdomínio de vários níveis nem sempre exige ACM.

Hoje a Cloudflare descreve os certificados Universal como gratuitos e não compartilhados. A antiga afirmação de que eram compartilhados entre sites está desatualizada.

<figure class="article-diagram" data-layout="compare" data-tone="amber" data-count="2" aria-labelledby="diagram-cloudflare-ssl-advanced-certificate-manager">
  <figcaption>
    <strong id="diagram-cloudflare-ssl-advanced-certificate-manager">A cobertura do Universal SSL depende do modo de DNS</strong>
    <span>A cobertura varia conforme o modo DNS; a profundidade, sozinha, não define se o ACM é necessário.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6z"/><path d="M9 12h6"/></svg></span>
      <strong>Full DNS setup</strong>
      <span>Em geral cobre o domínio raiz e um nível; nomes mais profundos ficam fora do wildcard.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></span>
      <strong>CNAME / partial setup</strong>
      <span>É emitido para cada hostname com proxy, independentemente da profundidade.</span>
    </li>
  </ol>
</figure>

## Quando considerar o ACM

O ACM é um complemento pago. Ele permite escolher a CA, o método de validação, a validade e os nomes cobertos. Um certificado avançado comporta até 50 nomes de host, incluindo o domínio raiz. As validades disponíveis dependem da CA e do plano; **um ano é restrito a clientes Enterprise que usam SSL.com**. Nem todos os planos podem escolher livremente entre 14 e 365 dias.

Para proteger automaticamente subdomínios profundos com proxy em DNS completo, considere o **Total TLS**. Para nomes específicos, um certificado avançado ou personalizado pode bastar. O Total TLS exige DNS completo e exclui nomes usados por alguns produtos, como Cloudflare Tunnel.

**Certificados avançados não se aplicam a domínios personalizados do Cloudflare Pages ou R2.** Esses produtos usam outro caminho de certificados. Comprar ACM para um site Pages não aplica o certificado avançado ao nome do Pages.

## Antes da compra

1. Liste os nomes de host e identifique se a configuração é DNS completa ou CNAME.
2. Confira a cobertura real do Universal SSL.
3. Verifique a CA, a validade e as condições de Total TLS necessárias.
4. Consulte preço e condições atuais no painel da Cloudflare para o seu plano.

Não compre apenas pela aparência do nome comum (CN); confirme que os nomes necessários constam dos SANs.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)

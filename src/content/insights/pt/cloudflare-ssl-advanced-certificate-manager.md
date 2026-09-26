---
title: "O que era a antiga opção SSL paga da Cloudflare — de Dedicated SSL para Advanced Certificate Manager"
description: 'A opção anteriormente paga da Cloudflare, "Dedicated SSL Certificates", foi renomeada e ampliada em 2021 como "Advanced Certificate Manager (ACM)". Veja as diferenças para o Universal SSL gratuito e quando o ACM é necessário.'
date: 2026-03-31T00:00
author: gui
tags: ["Tecnologia", "Cloudflare", "Segurança", "Infraestrutura"]
image: /uploads/acecore-generated/blog-cloudflare-ssl-advanced-certificate-manager.webp
lastUpdated: "2026-09-26T18:45:00+09:00"
---

A Cloudflare transformou o antigo **Dedicated SSL Certificates** no **Advanced Certificate Manager (ACM)** em 2021. Antes de escolher um certificado, confira os nomes de host e o tipo de configuração DNS.

## Cobertura do Universal SSL

Em uma **configuração DNS completa**, o Universal SSL gratuito normalmente cobre o domínio raiz e subdomínios de primeiro nível. `*.example.com` cobre `www.example.com`, mas não `api.staging.example.com`. Em uma **configuração CNAME (parcial)**, a Cloudflare emite um certificado Universal para cada nome de host com proxy, independentemente da profundidade. Um subdomínio de vários níveis nem sempre exige ACM.

Hoje a Cloudflare descreve os certificados Universal como gratuitos e não compartilhados. A antiga afirmação de que eram compartilhados entre sites está desatualizada.

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

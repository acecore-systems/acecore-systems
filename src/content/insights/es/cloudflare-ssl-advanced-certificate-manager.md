---
title: "Cloudflare Universal SSL frente a ACM: cuándo necesitas certificados de pago"
description: 'La opción antes de pago de Cloudflare, "Dedicated SSL Certificates", fue renombrada y ampliada en 2021 como "Advanced Certificate Manager (ACM)". Explicamos las diferencias con Universal SSL gratuito y en qué casos necesitas ACM.'
date: 2026-03-31T00:00
author: gui
tags: ["Tecnología", "Cloudflare", "Seguridad", "Infraestructura"]
image: "/images/insights/covers/cloudflare-ssl-advanced-certificate-manager-cover-v2.webp"
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Antes de comprar, compara Universal SSL y ACM contrastando los nombres de host necesarios con el certificado servido. Revisa las limitaciones de [Cloudflare: Advanced Certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/); para dominios personalizados de Pages o R2, evalúa la vía de certificados del producto correspondiente.

Cloudflare convirtió **Dedicated SSL Certificates** en **Advanced Certificate Manager (ACM)** en 2021. Antes de elegir un certificado, comprueba los nombres de host y el tipo de configuración DNS.

## Alcance de Universal SSL

En una **configuración DNS completa**, Universal SSL gratuito cubre normalmente el dominio raíz y los subdominios de primer nivel. `*.example.com` cubre `www.example.com`, pero no `api.staging.example.com`. En una **configuración CNAME (parcial)**, Cloudflare emite un certificado Universal para cada nombre de host con proxy, sin importar su profundidad. Un subdominio multinivel no siempre exige ACM.

Cloudflare describe hoy los certificados Universal como gratuitos y no compartidos. La antigua afirmación de que se comparten entre sitios ya no es correcta.

<figure class="article-diagram" data-layout="compare" data-tone="amber" data-count="2" aria-labelledby="diagram-cloudflare-ssl-advanced-certificate-manager">
  <figcaption>
    <strong id="diagram-cloudflare-ssl-advanced-certificate-manager">La cobertura de Universal SSL depende del tipo de DNS</strong>
    <span>La cobertura cambia según el modo DNS; la profundidad no basta para decidir si hace falta ACM.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-3 7.5-7 10-4-2.5-7-5.5-7-10V6z"/><path d="M9 12h6"/></svg></span>
      <strong>Full DNS setup</strong>
      <span>Normalmente cubre el dominio raíz y un nivel; los niveles más profundos quedan fuera del wildcard.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/></svg></span>
      <strong>CNAME / partial setup</strong>
      <span>Se emite por cada hostname con proxy, sin importar la profundidad.</span>
    </li>
  </ol>
</figure>

## Cuándo considerar ACM

ACM es un complemento de pago. Permite elegir la CA, el método de validación, la vigencia y los nombres cubiertos. Un certificado avanzado admite hasta 50 nombres, incluido el dominio raíz. Las vigencias disponibles dependen de la CA y del plan; **un año se limita a clientes Enterprise que usan SSL.com**. No todos los planes permiten elegir libremente entre 14 y 365 días.

Para cubrir automáticamente subdominios profundos con proxy en una configuración DNS completa, considera **Total TLS**. Para nombres concretos puede bastar un certificado avanzado o personalizado. Total TLS requiere DNS completo y excluye nombres usados por algunos productos, como Cloudflare Tunnel.

**Los certificados avanzados no se aplican a dominios personalizados de Cloudflare Pages o R2.** Estos productos usan otra vía de certificados. Comprar ACM para un sitio Pages no aplica ese certificado al nombre de Pages.

## Antes de comprar

1. Enumera los nombres de host e identifica si la configuración es DNS completa o CNAME.
2. Comprueba la cobertura real de Universal SSL.
3. Verifica la CA, la vigencia y las condiciones de Total TLS necesarias.
4. Consulta el precio y las condiciones actuales en el panel de Cloudflare de tu plan.

No compres solo por cómo aparece el nombre común (CN); comprueba que los nombres necesarios figuren en los SAN.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)

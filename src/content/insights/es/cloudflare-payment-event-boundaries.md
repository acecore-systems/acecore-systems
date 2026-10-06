---
title: "Gestionar webhooks de pago y reembolso con seguridad: reconciliar estados en Workers"
description: "Un ejemplo de implementación que separa la firma, los eventos duplicados o tardíos, el estado de los reembolsos y las respuestas de API externas. También explica cómo volver a comprobar permisos antes de una acción administrativa."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "Separar la evidencia de implementación de las operaciones reales"
  text: "En este caso anonimizado se verificaron la implementación, las pruebas, el despliegue en producción y la reconciliación de solo lectura con API externas. No se ejecutaron reembolsos, cancelaciones ni ajustes de puntos de clientes como prueba, y no se afirma una verificación integral de todas las rutas de pago."
---

Recibir un evento del proveedor de pagos no completa por sí solo un pedido o un reembolso. Este ejemplo anonimizado muestra cómo un flujo operativo en Workers concilia el estado del proveedor con los registros locales. Se omiten datos de clientes, identificadores de transacciones reales y destinos internos de notificaciones.

## Verificar la firma y evitar duplicados desde la entrada

Valida la firma con el cuerpo original sin modificar y comprueba si el evento corresponde al modo de producción o de prueba esperado. Registra el procesamiento del evento y reclama una concesión de procesamiento para evitar que la retransmisión del mismo evento repita una operación de negocio. Esto no garantiza que los eventos lleguen en orden. Consulta la [guía oficial de webhooks de Stripe](https://docs.stripe.com/webhooks).

## Consultar el estado actual ante un evento de reembolso tardío

Esta implementación gestiona `refund.created`, `refund.updated` y `refund.failed`. Para un reembolso administrado, vuelve a obtener el objeto actual de Stripe, de modo que un evento tardío no devuelva el registro local a un estado anterior. Distingue los importes reembolsados correctamente de los pendientes antes de decidir si el pedido está totalmente reembolsado.

Comprueba el importe, la moneda, el PaymentIntent, los metadatos que vinculan el pedido y la operación, y los identificadores ya guardados. Los IDs de pago pueden usar el prefijo `py_` y los de reembolso `pyr_`; se ajustó la implementación para que un prefijo conocido no válido no rechace una respuesta legítima. Admitir otro prefijo no relaja las comprobaciones de importe e identidad. Los valores desconocidos no se cuentan como cero.

## Separar los resultados de reembolsos, puntos y notificaciones

Comprueba el saldo y los permisos antes de solicitar un reembolso; después de consultar el estado externo y justo antes de escribir, vuelve a comprobar los permisos y la caducidad de la operación. Usa una clave de idempotencia y una reserva específicas para cada operación. Si el resultado externo es incierto, reconcilia el estado actual en vez de volver a solicitar el reembolso a ciegas.

Un reembolso correcto y un ajuste de puntos correcto son estados diferentes. Un fallo posterior no debe volver a ejecutar el reembolso; registra cualquier reconciliación o reparación necesaria. La configuración de notificaciones, su recepción real y el seguimiento del personal son criterios de aceptación independientes del procesamiento de eventos de pago. Este artículo no afirma que las notificaciones estén operativas.

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">Del webhook a resultados independientes</strong>
    <span>Comprueba el estado actual antes de registrar una operación como completada. No se hizo ningún reembolso ni ajuste de puntos de clientes.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>Validar en la entrada</strong>
      <span>Comprueba el body original, el mode y el event ID; identifica reintentos y procesos en curso.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>Conciliar el estado actual</strong>
      <span>No reviertas registros por un evento tardío; compara importe, moneda y pedido.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>Registrar resultados por separado</strong>
      <span>Reembolsos, puntos y notificaciones tienen estados distintos. Si el resultado externo es incierto, vuelve a comprobarlo en vez de repetir la operación.</span>
    </li>
  </ol>
</figure>

## Comprobar respuestas en Node y en el entorno Workers

Probar un fetch externo solo en Node puede pasar por alto diferencias del entorno Workers. En este caso se reprodujo una incompatibilidad con `redirect: 'error'` y se cambió a `redirect: 'manual'` con comprobación explícita del estado HTTP. No analices una respuesta 3xx o una página de error como JSON normal ni sigas automáticamente una redirección a otro host conservando la autorización. Consulta la [API Request de Workers](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Registrar los límites del despliegue y la aceptación

Los cambios de base de datos, el procesamiento dependiente y la interfaz de administración se publicaron en orden. Se verificaron las pruebas, CI, las pantallas de producción en modo de solo lectura y la coherencia con las lecturas de la API del proveedor. No se realizó ninguna operación monetaria de clientes para probar. La exportación CSV también trata como texto las celdas que podrían interpretarse como fórmulas y no sustituye las comisiones desconocidas por cero.

Para el límite de inicio de sesión administrativo, consulta [Diseño de sesiones entre varios servicios](/insights/multi-service-session-lifecycle/).

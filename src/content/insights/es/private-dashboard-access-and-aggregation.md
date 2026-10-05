---
title: "Crear un panel de operaciones protegido con Cloudflare Pages y D1"
description: "Un diseño anonimizado que protege la entrada con Cloudflare Access y consulta agregados operativos de D1 mediante Pages Functions. Distingue la publicación en producción, la interfaz autenticada y el uso de índices verificados de lo que no se probó."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: "/images/insights/private-dashboard-access-and-aggregation.webp"
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "Separar implementación, interfaz de producción y verificación del índice"
  text: "Este caso anonimizado implementa una interfaz Pages protegida por Access y agregados D1 de solo lectura. Se verificaron la publicación en producción conectada a GitHub, la interfaz autenticada y el uso del índice por una consulta de producción. No se probaron cargas grandes ni el rendimiento entre varias organizaciones."
---

Cuando la información operativa se dispersa entre registros y bases de datos, al personal le puede costar comprobar el estado actual de forma segura. Este ejemplo anonimizado explica cómo verificar el acceso, la agregación y la publicación de un panel. No incluye dominios, cuentas, contenido de publicaciones ni cifras operativas reales.

## Incluir la página y la API en el límite de acceso

Ocultar una pantalla estática de Cloudflare Pages no basta si su API de datos todavía se puede invocar directamente. Incluye tanto la interfaz como la API en el límite de Cloudflare Access para que solo el personal autorizado pueda leer los datos. Como procedimiento de verificación, prueba la página y la API antes y después de la autenticación. En este caso se confirmó en producción el límite de autenticación de la página y que los datos aparecían en la interfaz tras iniciar sesión con la cuenta dedicada. El registro disponible no confirma una solicitud directa sin autenticar al endpoint de la API; sigue siendo una comprobación de aceptación independiente. No incluyas secretos de autenticación en el código del navegador.

## Separar las escrituras de la agregación de solo lectura

Un endpoint GET de Pages Functions consulta D1 y combina en una respuesta los recuentos por hora, el estado de procesamiento reciente y el modo de ejecución. Limita la API del panel a consultas de solo lectura; no dependas de ocultar un botón en la interfaz. Define el periodo, la zona horaria y el significado de los estados confirmados y pendientes para no sumar recuentos distintos. Muestra aparte los valores ausentes o sin resolver en vez de tratarlos como acciones correctas o como cero.

## Verificar los índices D1 con la consulta de agregación

Las pantallas operativas filtran repetidamente periodos recientes, por lo que su aspecto no demuestra que un índice sea útil. Tras añadir un índice para las condiciones de agregación reales, inspecciona el plan de consulta en D1 de producción y confirma que se utiliza el índice previsto. Crear un índice y comprobar que una consulta lo usa son verificaciones distintas. En este caso se confirmaron ambas en producción, pero no se hizo un benchmark de mejora del tiempo de respuesta ni de resistencia con mucha carga.

## Comprobar autenticación y visualización tras publicar

Publica Pages en producción mediante la integración con GitHub y verifica que el despliegue del commit previsto haya tenido éxito y que el dominio personalizado esté activo. Después comprueba que la página esté protegida antes de autenticarte y que los datos del panel aparezcan tras iniciar sesión. Un CI correcto o un despliegue exitoso no demuestran por sí solos que una persona autenticada pueda ver la interfaz de producción.

Este caso anonimizado verificó el límite de acceso, la pantalla de producción y el uso de un índice en la consulta agregada de D1 en un único entorno operativo. No probó permisos entre varias organizaciones, cargas con más usuarios ni pruebas de intrusión para todas las configuraciones de autenticación. Para la arquitectura general del sitio en Pages, consulta [Arquitectura de sitios con Cloudflare Pages](/insights/astro-cloudflare-site-architecture/).

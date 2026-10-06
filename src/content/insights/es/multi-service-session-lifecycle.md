---
title: "Unificar la caducidad del acceso entre servicios: renovación y reautenticación"
description: "Diseño general para alinear la caducidad del acceso, distinguiendo inicio explícito, servidor, cookies y proveedor de identidad."
date: "2026-09-30T13:37:47+00:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/multi-service-session-lifecycle-cover-v1.webp
tags: ["Authentication", "Session", "Web"]
callout:
  type: note
  title: "Caso interno generalizado"
  text: "Basado en cambios de política y despliegues de producción. Se omiten duraciones y ajustes internos; no demuestra el comportamiento prolongado de todos los usuarios ni una seguridad completa."
---

Compartir una cuenta no hace idénticas las sesiones de cada aplicación y del proveedor de identidad. Este caso alinea las reglas sin publicar destinos ni duraciones.

## Identificar cada plazo

Inventariar por separado la sesión del proveedor, la sesión de la aplicación y la cookie. Caducidad absoluta, inactividad y rotación del identificador son controles distintos. Rotar un identificador no exige ampliar su vigencia.

## Separar acceso explícito y tráfico habitual

El caso renueva el período aplicable tras un inicio explícito correcto, no por navegar, tráfico de fondo, renovación automática de tokens o rotación del identificador; conservan la caducidad original. Un clic o la llegada al callback no acreditan autenticación: verificar el resultado. Si se exige autenticación reciente, comprobar si reutilizar la sesión del proveedor satisface esa condición.

## Comprobar la caducidad en el servidor

Una cookie más duradera no define lo que acepta el servidor. Revisar caducidad, revocación, cookie y restricciones del proveedor. Reglas uniformes no significan cookies compartidas ni cierre inmediato en todos los servicios.

Validar el momento de autenticación y la caducidad de la autoridad, limitando a ellos las sesiones de las aplicaciones. El contrato común valida sesiones; cada aplicación conserva sus permisos de negocio. Una pasarela con su propia cookie tiene otro límite que inventariar y auditar.

<figure class="article-diagram" data-layout="layers" data-tone="violet" data-count="3" aria-labelledby="diagram-multi-service-session-lifecycle">
  <figcaption>
    <strong id="diagram-multi-service-session-lifecycle">Separar autenticación, sesiones y permisos de cada aplicación</strong>
    <span>Una regla común de caducidad no convierte estos estados en uno solo.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4 21c.6-4 3.3-6 8-6s7.4 2 8 6"/></svg>
      </span>
      <strong>Proveedor de identidad y callback</strong>
      <span>Valide el resultado de autenticación y el context/state del callback. Iniciar sesión no concede por sí solo acceso a la aplicación.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16v12H4z M8 10h8 M8 14h5"/></svg>
      </span>
      <strong>Aplicación, cookie y gateway</strong>
      <span>Compruebe por separado la caducidad y revocación de la sesión del servidor, la cookie del navegador y la sesión del gateway.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 19 6v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z M9 12l2 2 4-4"/></svg>
      </span>
      <strong>Permisos de cada servicio</strong>
      <span>Cada aplicación verifica sus propios permisos. El tráfico normal y la actualización en segundo plano no amplían la caducidad ni implican un cierre de sesión global.</span>
    </li>
  </ol>
</figure>

## Separar configuración y comportamiento

Auditar código y ajustes por separado de las pruebas de inicio, límites de caducidad, acceso tras caducar y cierre. Revisar cómo se aplica la política a sesiones existentes y cómo páginas y API gestionan la caducidad. Registrar decisiones y horas, sin valores de sesión ni credenciales.

## Alcance confirmado

El historial registra cambios, despliegues y herramientas para auditar diferencias. No se probaron el acceso de usuarios reales ni la espera hasta la caducidad efectiva en estos registros. No demuestra pruebas con tiempo real en todos los dispositivos ni toda la seguridad de revocación y reautenticación. Elegir plazos y verificaciones según la sensibilidad de datos y operaciones.

Consultar [sesiones de OWASP](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html) y [autenticación](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html). Para otra capa, ver [sesiones de Cloudflare](https://developers.cloudflare.com/cloudflare-one/access-controls/access-settings/session-management/). Las recomendaciones no afirman que todas las pruebas se completaran en este caso.

## Actualización del 6 de octubre de 2026: continuidad de la autenticación y permisos de la aplicación

En el registro anonimizado de una mejora de autenticación se separaron la llegada al callback de OIDC, la validación del token, la continuación de la solicitud de autenticación original y los permisos para usar la aplicación. Si falta el contexto necesario para continuar, el flujo no lo presenta como un inicio de sesión correcto: devuelve un error seguro desde el que se puede reanudar. También valida el destino de retorno; iniciar sesión en una cuenta compartida no concede por sí solo permisos de negocio en cada aplicación.

El mismo contrato se comprueba al iniciar sesión y registrarse, al añadir o retirar proveedores de autenticación y en los mecanismos de recuperación. Los registros de cambios y despliegue no demuestran que todas las personas usuarias puedan iniciar sesión con todos los proveedores ni que se haya probado de principio a fin la conservación del último método de recuperación.

La activación de un segundo factor, el inicio de sesión en la plataforma de identidad, el paso por la puerta de acceso y una escritura protegida en la aplicación también se verifican por separado. Una prueba de escritura limitada no sustituye la comprobación de todos los flujos formales de OIDC ni demuestra que se rechace una cuenta desactivada. El registro, la configuración inicial, las pantallas de cambio y la API consultan las mismas reglas de entrada; las pruebas comprueban en conjunto los valores límite que se rechazan y los que se permiten. No se presenta una longitud concreta como norma universal.

También se separan las pantallas y las indicaciones del callback para iniciar sesión y registrarse. Ver una pantalla o una comprobación de salud no equivale a aceptar la creación real de una cuenta externa ni la concesión del consentimiento. Al retirar un proveedor se revisan en conjunto el botón, el callback, la configuración, las indicaciones y las pruebas, y después se comprueba si queda alguna ruta residual.

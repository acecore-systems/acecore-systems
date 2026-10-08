---
title: "Migración y recuperación de Ubuntu 26.04: AD, copias y actualizaciones sin jugadores"
description: "Lecciones de seis servidores Ubuntu: compatibilidad de Samba y SSSD, recuperación de conexiones, restauración real desde R2 y mantenimiento de Velocity sin jugadores."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "La versión mostrada no demuestra que el trabajo haya terminado"
  text: "Comprobamos el reinicio normal, las conexiones, la recuperación automática de servicios, la configuración conservada y la restauración de las copias pertinentes. El inicio de sesión interactivo, una partida real y la recuperación integral ante desastres requieren otras pruebas."
processFigure:
  eyebrow: "Criterios de aceptación"
  title: "De las evidencias iniciales a la restauración posterior"
  description: "Si un paso falla, se registra el destino y su estado y se realiza una recuperación limitada antes de continuar."
  variant: inline
  steps:
    - title: "Alcance y acceso de recuperación"
      description: "Revisar dependencias, condiciones de parada, configuración y copias."
      icon: i-lucide-server
      accent: brand
    - title: "Parada y actualización"
      description: "Controlar nuevas conexiones, detener correctamente y aplicar la actualización autorizada."
      icon: i-lucide-wrench
      accent: amber
    - title: "Arranque y restauración"
      description: "Verificar desde otra ruta, recuperar los estados originales y restaurar la misma generación."
      icon: i-lucide-shield-check
      accent: emerald
---

Actualizar Ubuntu también exige conservar la autenticación, la red, las copias y las dependencias de arranque. El objetivo es volver al funcionamiento normal después del reinicio.

El 8 de octubre de 2026 completamos la migración o actualización de seis servidores Ubuntu para web, autenticación, bots, CTF y un proxy Minecraft. Dos pasaron de 24.04 a 26.04; cuatro ya utilizaban 26.04 y recibieron actualizaciones ordinarias y un reinicio. Aquí generalizamos los problemas y las comprobaciones observados.

## Separar la migración de versión de la actualización ordinaria

Para migrar entre LTS, seguimos el [procedimiento oficial de Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/) con `do-release-upgrade`. Cambian los paquetes necesarios y el tiempo de mantenimiento respecto a una actualización ordinaria. Una condición de «cero eliminaciones» usada en esta última no se debe trasladar sin cambios a una migración de versión.

Primero se identifican funciones, dependencias, tiempo de parada aceptable y acceso a la consola de recuperación. Guardamos Netplan, SSH, autenticación, servicios, contenedores, temporizadores y bloqueos de APT en un área restringida a root. Los archivos pueden contener secretos y no deben publicarse.

Trabajamos en un servidor cada vez y comprobamos que otros mantenimientos hayan terminado. Actualizar toda la flota no autoriza activar copias deliberadamente detenidas ni modificar servidores con otro sistema operativo.

## Restaurar las copias antes de confiar en ellas

Un trabajo de almacenamiento correcto no demuestra que los datos puedan recuperarse. Antes de actualizar, restauramos una generación concreta de R2 en un área separada y revisamos bases de datos, configuración y contenido ZIP según el destino. Véase también la [verificación de copias con R2 y restic](/insights/restic-r2-backup-verification/).

Para Samba AD utilizamos las [operaciones de copia de `samba-tool`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html) y comprobamos la base restaurada y LDAP en un DC aislado. No bastaba con copiar archivos de una base en ejecución.

Nuestro verificador de Samba 4.23 fallaba porque cambiar las rutas de DB y PID no creaba `/run/samba/nmbd`, necesario para sockets internos. Lo corregimos verificando primero que los espacios de nombres de red y montaje estuvieran separados de producción y preparando un `/run` propio dentro de esa prueba. No se monta un tmpfs de prueba sobre el `/run` del servidor de producción.

Antes de utilizar una imagen de disco del proveedor, hay que comprobar restricciones de arranque durante su creación, tamaño, duración y unidades de facturación. En el trabajo adicional usamos copias de aplicaciones verificadas y configuración del SO guardada, sin nuevas imágenes. Esto no garantiza el mismo alcance de recuperación que una imagen completa. Las copias detenidas por decisión previa siguieron detenidas.

## Comprobar primero el paquete de Samba AD/DC

Ubuntu 26.04 necesita `samba-ad-dc` para AD/DC. Comprobamos su presencia en el sistema antiguo siguiendo las [notas de migración LTS](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases).

```bash
dpkg-query -W samba-ad-dc
```

Si falta, se confirma que el servidor sea AD/DC y que APT utilice fuentes oficiales, y se instala antes de migrar. Conservar el dominio existente no requiere crearlo de nuevo ni aumentar su nivel funcional.

## Inspeccionar el estado tras una actualización interrumpida

El servidor de autenticación conservaba paquetes sin configurar y carecía del initrd del kernel nuevo. Desde la consola revisamos su estado, completamos la configuración necesaria y generamos el initrd; después volvimos al arranque normal de systemd.

Un arranque temporal con `init=/bin/bash` omite la autenticación normal. Obtuvimos permiso para ese arranque y comenzamos con una inspección de solo lectura. No cambiamos permanentemente GRUB ni contraseñas y retiramos la inhibición temporal del inicio de servicios.

Estos comandos son ejemplos de comprobación, no un guion universal de reparación. Antes de publicar la salida, se revisa si contiene secretos o datos de conexión.

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

Si no se registró el código de salida de la actualización original, no se inventa un resultado correcto. Se documentan las reparaciones y las observaciones posteriores. La existencia de los archivos del kernel no demuestra que se haya arrancado normalmente con él.

## Reparar la red y la autenticación con evidencias

Aunque Netplan sea correcto, otro componente puede regenerar su configuración al arrancar. En nuestro modelo de gestión comparamos los hashes originales y desactivamos únicamente esa regeneración mediante la [configuración de red de cloud-init](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). No es una recomendación general para redes gestionadas por el proveedor.

La ausencia de SSH también puede deberse a dependencias de arranque. El journal mostró un ciclo entre antiguos sockets de intermediación LDAP y la VPN que hacía que systemd cancelara su inicio. Tras verificar los listeners y el tráfico actuales, desactivamos solo los sockets obsoletos. Un servicio inactive a la espera de activación por socket no indica por sí solo un fallo.

SSSD rechazaba `config_file_version` y presentaba una competencia entre activación por monitor y por socket. Contrastamos los [cambios de SSSD 2.10](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes) y la [referencia de Ubuntu](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html), conservamos propietario y permisos y limitamos las modificaciones. No desactivamos todos sus sockets.

Después comprobamos `sssctl config-check`, los responders NSS/PAM/PAC, el estado Online del dominio y `adcli testjoin` con la clave de máquina existente. No fue necesario sustituir claves ni volver a unir el servidor al dominio.

| Problema observado              | Evidencia                            | Comprobación posterior                    |
| ------------------------------- | ------------------------------------ | ----------------------------------------- |
| Componentes AD/DC insuficientes | Paquetes y notas de migración        | Samba, DB/LDAP e ID original del dominio  |
| VPN ausente tras arrancar       | Ciclo y cancelación en el journal    | SSH, VPN, DNS y LDAP tras reinicio normal |
| Fallos de SSSD y sockets        | Validador y conflictos de responders | Responders, Online y unión de máquina     |

## El mantenimiento sin jugadores necesita datos recientes y control de acceso

Velocity se actualizó únicamente cuando no había jugadores. Recogimos recuentos por JSON y status ping, sin enviar periódicamente `list` ni `glist` a las consolas. Comprobamos los nueve backends activos, incluido uno fuera de los ocho supervisados por JSON, y el proxy.

La condición exigía todos los recuentos a cero y observaciones y snapshots de supervisión de un máximo de 15 segundos. Ocupación, datos ausentes, consultas fallidas, valores antiguos o destinos no cubiertos obligaban a esperar. No se necesitaban nombres de jugadores.

1. Confirmar ceros recientes en todos los destinos y el fin de otros mantenimientos.
2. Verificar la restauración previa y guardar configuración y estados del destino.
3. Volver a consultar los recuentos justo antes de parar.
4. Cerrar temporalmente nuevas conexiones de juego y exigir nuevos ceros después del cierre.
5. Solicitar el cierre normal de Velocity y confirmar su salida antes de actualizar APT.
6. Reiniciar normalmente, verificar desde otro origen, reabrir el acceso y restaurar la copia posterior.

El bloqueo cubría el TCP/UDP necesario en IPv4 e IPv6 y persistía durante el reinicio. Reglas temporales propias conservaron SSH, VPN, API y comunicación con backends, sin reemplazar el firewall existente. Al reabrir retiramos también las unidades y reglas temporales.

Para el cierre normal utilizamos [`shutdown` de Velocity](https://docs.papermc.io/velocity/built-in-commands/). Los backends, mundos y plugins no se detuvieron ni actualizaron durante este trabajo.

## Tratar las actualizaciones por fases según la etapa

La actualización ordinaria incluyó simulación sin eliminaciones, obtención estricta de índices APT, conservación de configuración y devolución de temporizadores y bloqueos a su estado inicial. Usamos `NEEDRESTART_MODE=l` para mantener el orden previsto de reinicios. Un worker verificaba servidor y estado detenido y no dependía de que SSH siguiera conectado.

Siete paquetes quedaron aplazados por las [actualizaciones por fases de Ubuntu](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/). No forzamos su inclusión para vaciar la lista pendiente.

Los requisitos de una migración de versión son distintos: el procedimiento oficial incluye actualizar los paquetes sujetos a fases. La política de actualización cotidiana posterior no se aplica sin cambios a los requisitos de `do-release-upgrade`.

## Demostrar el final con reinicio y la misma generación de copia

Los seis servidores arrancaron normalmente con Ubuntu 26.04.1 y el kernel nuevo. Verificamos cambios de boot ID, coherencia de paquetes, unidades fallidas, SSH/VPN, recuperación automática de servicios y restitución de configuración, temporizadores, bloqueos y acceso.

En Velocity comprobamos status Java, respuestas RakNet de Geyser y conexiones desde otro servidor. La API económica devolvió 200 por la ruta permitida, 401 sin autenticación y 200 con ella. Un 200 por sí solo no verifica la frontera de autenticación.

Donde las copias estaban activadas, guardamos el estado final y restauramos esa misma generación. No reutilizamos una restauración antigua como prueba de una copia nueva. Las copias desactivadas deliberadamente permanecieron así.

Estas comprobaciones confirmaron la vuelta a la operación ordinaria. El inicio de sesión interactivo, el juego real, las publicaciones o generaciones de bots y un ejercicio completo de recuperación ante desastres son pruebas separadas. La migración de Debian a Ubuntu quedó fuera del alcance.

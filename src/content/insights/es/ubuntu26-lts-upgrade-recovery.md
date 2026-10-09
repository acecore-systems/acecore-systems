---
title: "Actualizar un servidor Ubuntu en funcionamiento: preparación, recuperación de la conexión y comprobaciones tras el reinicio"
description: "A partir de la migración de Ubuntu 24.04 a 26.04 y de las actualizaciones habituales, se explican en detalle la restauración efectiva de copias de seguridad, el resguardo de la configuración, cómo determinar si no hay usuarios activos, el diagnóstico cuando SSH no vuelve y las condiciones para dar el trabajo por terminado."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Linux", "Copias de seguridad", "Operaciones"]
callout:
  type: note
  title: "Decide antes de empezar cómo revertir el cambio y qué condiciones indican que el trabajo ha terminado"
  text: "Comprueba que puedes recuperar la configuración y los datos, continuar operando aunque se interrumpa SSH y que los servicios vuelven a iniciarse automáticamente tras un reinicio normal. El éxito del comando de actualización por sí solo no confirma estos 3 puntos."
processFigure:
  eyebrow: "Flujo del trabajo de actualización"
  title: "Desde la preparación de la recuperación hasta la comprobación de la restauración tras la actualización"
  description: "Avanza a la siguiente etapa solo cuando se hayan superado las comprobaciones de la etapa actual. Si algo falla, registra el estado en ese momento y las operaciones ya realizadas."
  variant: inline
  steps:
    - title: "Restauración y resguardo de la configuración"
      description: "Recupera los datos necesarios y deja a salvo la vía de conexión y la configuración previa a los cambios."
      icon: i-lucide-server
      accent: brand
    - title: "Control de admisión y actualización"
      description: "Vuelve a comprobar el uso, detén los servicios correctamente y aplica la actualización prevista."
      icon: i-lucide-wrench
      accent: amber
    - title: "Reinicio y comprobación del funcionamiento"
      description: "Comprueba la conexión desde el exterior, el inicio automático, la restauración de la configuración original y una nueva copia de seguridad."
      icon: i-lucide-shield-check
      accent: emerald
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Al actualizar un servidor Ubuntu en funcionamiento, además de instalar versiones nuevas de los paquetes, hay que detener los servicios y contar con un procedimiento para devolver el sistema a la operación tras el reinicio. Problemas como la pérdida de la conexión SSH, incompatibilidades entre la configuración de autenticación y la nueva especificación, o la imposibilidad de recuperar una copia de seguridad también pueden aparecer después de que termine el comando de actualización.

En este artículo, organizamos los aprendizajes obtenidos al migrar de Ubuntu 24.04 a 26.04 LTS y al aplicar las actualizaciones habituales posteriores a la migración en un procedimiento que puede adaptarse a otros servidores. Se presupone que se dispone de privilegios de administrador y de una ventana de mantenimiento que permita detener los servicios. Primero se presentan los preparativos y pasos comunes; en la segunda mitad se diagnostican los problemas de conexión, autenticación e inicio.

## Elegir una migración de 24.04 a 26.04 o actualizaciones normales

Decida si necesita una nueva generación del sistema o solo correcciones. La migración añade pruebas de compatibilidad de autenticación externa, VPN y bases de datos; las actualizaciones normales revisan paquetes previstos y reinicios. No empiece sin consola de recuperación y restauración comprobada.

[Ubuntu Server：Condiciones y preparación para migrar LTS](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/)

## 1. Decide el tipo de actualización y el alcance del trabajo

En primer lugar, decide si vas a cambiar de versión del sistema operativo o a actualizar paquetes dentro de la misma versión. La magnitud de los cambios y los aspectos que hay que comprobar varían según el caso.

| Trabajo                  | Ejemplo                                                   | Mecanismo utilizado  | Aspectos que comprobar antes                                                       |
| ------------------------ | --------------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------- |
| Actualización habitual   | Correcciones y actualizaciones del kernel en Ubuntu 26.04 | APT                  | Cambios y paquetes que se añadirán o eliminarán; impacto del reinicio de servicios |
| Actualización de versión | Migración de Ubuntu 24.04 a 26.04                         | `do-release-upgrade` | Requisitos oficiales de migración, compatibilidad y paquetes obsoletos o divididos |

`apt-get dist-upgrade` es un comando que ajusta las dependencias con respecto a las fuentes configuradas. Aunque su nombre incluya «dist», no es el comando específico para migrar a la siguiente LTS de Ubuntu. Para la actualización de versión, sigue el [procedimiento oficial de Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/). En producción, no uses `-d`, destinado a versiones de desarrollo, ni cambies manualmente solo las fuentes de APT. El cambio de Debian a Ubuntu tampoco forma parte de las actualizaciones que pueden realizarse mediante este procedimiento.

No revises solo el nombre del host: incluye también el DNS, la autenticación, las bases de datos y la VPN de conexión de los que depende el servidor. Si vas a actualizar varios servidores, actualiza 1 servidor cada vez y comprueba que las dependencias se mantienen estables. Si el trabajo coincide con otras tareas de mantenimiento o con procesos de copia de seguridad, decide primero el orden.

Decide también las condiciones para cancelar el trabajo, como no poder restaurar la copia, no poder obtener los paquetes necesarios, no poder detener los servicios correctamente o no poder acceder a la consola de recuperación. Reservar de antemano tiempo para la recuperación facilita la toma de decisiones, en lugar de continuar actualizando hasta que termine la ventana de mantenimiento.

## 2. Asegura una vía de acceso aunque se interrumpa SSH

Antes de actualizar, confirma que puedes acceder a la consola de recuperación desde el panel de administración del VPS o del proveedor de nube. No basta con abrir la pantalla: necesitas un método de inicio de sesión que te permita operar realmente el sistema operativo. Una vía que dependa de la misma VPN o del mismo servidor de autenticación que SSH no servirá para recuperarlo si se cae esa dependencia.

El botón de reinicio puede resolver una interrupción o un fallo temporal. Los errores de configuración y los problemas con el orden de inicio volverán a aparecer aunque reinicies. Antes de repetir el reinicio sin saber si la actualización quedó a medias, asegúrate de poder comprobar el estado actual desde la consola.

Si vas a usar una imagen de disco del proveedor, averigua si durante su creación se restringen el inicio o las operaciones, cuánto tardará y cuáles son la capacidad de almacenamiento y la unidad de facturación. Si usas una copia de seguridad de la aplicación, también necesitarás un procedimiento para reconstruir el sistema operativo y restaurar la configuración. Sea cual sea la opción, anota antes del trabajo qué se puede recuperar y qué queda fuera.

## 3. Restaura una copia de seguridad en otra ubicación

Aunque el trabajo de copia de seguridad termine correctamente, eso no garantiza que incluya los datos necesarios ni que sea posible recuperarlos. Antes de actualizar, restaura una versión cuyo host, hora de guardado y contenido hayas comprobado en un directorio de prueba vacío.

Por ejemplo, si utilizas restic como herramienta de copia de seguridad, puedes hacer la siguiente comprobación desde una shell de administrador que tenga acceso a la configuración de conexión existente. Sustituye `snapshot_id` por el ID de la versión que hayas comprobado. Fijar el ID en lugar de usar `latest` evita que cambie el objetivo si se ejecuta una nueva copia durante la verificación.

```bash
# 既存のリポジトリ接続設定を使う。秘密値をコマンドに直書きしない。
snapshot_id='確認したスナップショットID'
umask 077
restore_dir=$(mktemp -d /var/tmp/restore-check.XXXXXX) || exit 1
restic restore "$snapshot_id" --target "$restore_dir" --verify
```

No uses el directorio de datos de producción como destino de la restauración. restic puede sobrescribir archivos existentes; consulta la [especificación oficial de restauración](https://restic.readthedocs.io/en/stable/050_restore.html) y realiza la verificación en una ubicación vacía y aislada. También se muestran ejemplos de configuraciones con almacenamiento de objetos como R2 en [Cómo integrar la restauración efectiva de copias de seguridad](/insights/restic-r2-backup-verification/).

Después de restaurar, comprueba lo siguiente según el formato de los datos.

| Datos                                | Qué comprobar                                                                              | Qué no se confirma con esto por sí solo                          |
| ------------------------------------ | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| Archivos comprimidos como ZIP        | Extracción y comprobación de integridad; existencia de los archivos necesarios             | Que la aplicación se inicie y pueda usar el contenido            |
| Volcados SQL                         | Importación en una base de datos aislada; esquema y datos principales                      | Coherencia con los archivos adjuntos y el almacenamiento externo |
| SQLite                               | Existencia y tamaño del archivo restaurado; comprobación de integridad de la base de datos | Recuperación del servicio completo                               |
| Configuración, certificados y claves | Archivos correspondientes, propietario, permisos y referencias                             | Configuración o validez en los servicios externos                |

Copiar directamente los archivos de una base de datos en funcionamiento puede mezclar estados que se estén guardando. Usa un método de copia de seguridad que mantenga la coherencia que proporciona la base de datos o la aplicación, y sincroniza también el momento de los datos y los archivos relacionados. Como los comandos de comprobación pueden crear una base de datos vacía, antes de afirmar que la comprobación de integridad se ha superado, confirma que el archivo restaurado existe.

Si vas a iniciar una infraestructura de autenticación u otro sistema para verificarla, aísla también la red para evitar que una copia con los mismos identificadores se comunique con producción. Si utilizas contenedores o espacios de nombres, comprueba que estén aislados antes de montar archivos o iniciarlos. Asegúrate también de que el proceso que prepara un `/run` de prueba no oculte el `/run` del host de producción.

## 4. Guarda también el estado original del sistema en funcionamiento

Además de copiar los archivos de configuración, registra los siguientes estados. Guarda la información en una ubicación accesible solo para los administradores y sepárala por tarea para no sobrescribir registros existentes.

| Elemento que se guarda | Contenido que se consultará después                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------- |
| SO y paquetes          | Versión, kernel en ejecución, paquetes instalados, fuentes de APT y paquetes retenidos con hold |
| Red y SSH              | Netplan, configuración de SSH y VPN, método de gestión del firewall                             |
| Servicios              | Unidades y archivos drop-in, habilitación o deshabilitación al inicio y estado actual           |
| Tareas programadas     | Temporizadores, cron y estado de las copias de seguridad; próxima ejecución                     |
| Aplicaciones           | Configuración, ubicación de los datos, configuración de contenedores y dependencias externas    |

Este es un ejemplo de resguardo en Ubuntu con Netplan y systemd. Confirma que existen los directorios correspondientes y ejecútalo desde una shell de root después de entrar con `sudo -i`. El directorio creado mediante `mktemp` será una ubicación nueva a la que solo root puede acceder, y no sobrescribirá registros anteriores.

```bash
umask 077
record_dir=$(mktemp -d /root/ubuntu-upgrade.XXXXXX) || exit 1
cp -a /etc/netplan /etc/ssh /etc/systemd/system "$record_dir/" || exit 1
apt-mark showhold > "$record_dir/apt-hold.txt"
systemctl list-unit-files > "$record_dir/unit-files.txt"
systemctl list-units --type=service --all > "$record_dir/services.txt"
systemctl list-timers --all > "$record_dir/timers.txt"
cat /proc/sys/kernel/random/boot_id > "$record_dir/boot-id.txt"
```

Este ejemplo no incluye la configuración específica de las aplicaciones ni los datos del almacenamiento externo. Añade los elementos identificados en la tabla anterior y anota en el registro del trabajo dónde está el resguardo.

Estos son algunos comandos de comprobación. Guarda como registro de trabajo las salidas que incluyan el nombre del host, destinos de conexión o contenido de la configuración, y no las publiques.

```bash
cat /etc/os-release
uname -r
cat /proc/sys/kernel/random/boot_id
apt-mark showhold
systemctl list-timers --all
systemctl --failed
sudo sshd -t
```

`sshd -t` comprueba la sintaxis de la configuración de SSH. Aunque termine correctamente, no confirma que se pueda acceder desde el exterior. Comprueba por separado la sintaxis y el resultado generado por Netplan, y la comunicación real.

Si detienes un temporizador o cambias temporalmente un paquete retenido para realizar la actualización, registra el estado original y el motivo. Después del trabajo, no habilites todo de forma indiscriminada: podrías iniciar tareas que debían permanecer detenidas. Al restaurar la configuración, compara los cambios de esta tarea en lugar de sustituir todo `/etc` por una versión anterior.

## 5. Convierte los momentos sin usuarios en un estado seguro para detener el servicio

En los servicios que solo se detienen cuando no hay usuarios, no basta con que el número de personas o conexiones sea 0: también hay que comprobar el alcance de la observación y su antigüedad. Mirar únicamente el proxy de entrada no garantiza que no haya usuarios en los servidores posteriores ni trabajos en ejecución.

Haz primero una lista de los objetivos que se usarán para la evaluación y obtén el valor más reciente de todos ellos. Si falla la obtención, falta un dato, el dato es antiguo o hay servidores fuera del alcance de la supervisión, no permitas la detención. Convertir la ausencia de un valor en 0 podría detener el servicio cuando falla la supervisión.

Por ejemplo, si la supervisión suele actualizarse cada pocos segundos, puedes establecer la condición de que tanto la hora de observación como la de actualización de los datos de origen sean de hace 15 segundos como máximo. Esos 15 segundos son solo un ejemplo de diseño. Ajusta el umbral al intervalo de actualización real y comprueba también las diferencias horarias. Si basta con conocer el número de usuarios, no hace falta recopilar sus nombres ni enviar periódicamente comandos para listar usuarios a la consola.

Justo antes de detener el servicio, sigue este orden.

1. Confirma que el número de usuarios y procesos es 0 en todos los objetivos y que no hay tareas de mantenimiento que puedan interferir.
2. Cierra la admisión de nuevas solicitudes en la aplicación o el balanceador de carga. Usa un método que permita esperar a que terminen correctamente los procesos existentes.
3. Después de cerrar la admisión, vuelve a confirmar que todos los objetivos están en 0 usando valores nuevos generados tras el cierre.
4. Solicita el cierre normal y comprueba que el proceso ha terminado y que los datos se han guardado.
5. Restablece la admisión solo después de completar las comprobaciones de funcionamiento posteriores a la actualización y al reinicio.

Si encuentras usuarios después de cerrar la admisión, no continúes con la detención: aplica el procedimiento previsto para esperar o restablecer la admisión. No reutilices el valor 0 anterior.

Si controlas el acceso mediante un firewall, comprueba cómo se gestionan las conexiones nuevas y existentes, IPv4 e IPv6, y TCP y UDP. Como el tratamiento de UDP varía según la aplicación, considera también un modo de mantenimiento en la aplicación. Mantén el SSH y la VPN de administración, además de las comunicaciones internas, y comprueba que el cierre de admisión se mantenga durante el reinicio. Usa una regla temporal específica para poder eliminar solo esa regla al restablecer el servicio.

### Distingue entre solicitar el cierre normal y completarlo

Si utilizas `systemctl stop`, comprueba primero `ExecStop` de la unidad correspondiente, el tiempo de espera para detenerse y la configuración de terminación forzada. Si `ExecStop` solo envía una solicitud de cierre y termina, systemd podría terminar el proceso que siga activo. Sigue la [especificación de systemd](https://manpages.ubuntu.com/manpages/resolute/man5/systemd.service.5.html) e incluye el proceso que espera a que el cierre normal se complete.

En los servicios que se cierran mediante una entrada en la consola, también es necesario que el comando correcto llegue al proceso correspondiente con un salto de línea. En las líneas de comandos de una unidad, no siempre están disponibles automáticamente expresiones de shell como `$()` o las tuberías. Agrupa el procesamiento necesario en un pequeño script e incluye comprobaciones para identificar el proceso correcto y esperar a que termine. Si se agota el tiempo de espera, no fuerces la terminación para continuar con la actualización: investiga por qué no se puede detener el servicio correctamente.

## 6. Separa la actualización habitual en obtención de índices, revisión del plan y aplicación

Una vez comprobada la restauración y preparada la detención, obtén primero los índices de paquetes. No continúes usando índices antiguos si falla alguna de las fuentes.

```bash
# この段階ではパッケージを更新しない
sudo apt-get update -o APT::Update::Error-Mode=any &&
  sudo apt-get -s --no-remove dist-upgrade
```

Comprueba el código de salida de la simulación y los paquetes que se actualizarán, añadirán o eliminarán. `--no-remove` sirve para cancelar la operación si es necesario eliminar paquetes. Los kernels, entre otros, pueden necesitar la incorporación de paquetes nuevos, por lo que no establezcas como condición general que se añadan 0 paquetes. Según la [especificación de APT](https://manpages.ubuntu.com/manpages/resolute/man8/apt-get.8.html), el estado durante una simulación no queda fijado. Justo antes de ejecutar la actualización, confirma también que no haya otro proceso de APT en curso y que el plan no haya cambiado.

Cuando el plan no presente problemas y hayas confirmado que los servicios correspondientes están detenidos, aplica la actualización. Este es un ejemplo para mostrar una lista de propuestas de reinicio adicionales en un entorno que utiliza needrestart.

```bash
# 通常更新の予定を確認し、必要なサービスを正常停止した後に実行する
sudo env NEEDRESTART_MODE=l apt-get --no-remove dist-upgrade
```

`NEEDRESTART_MODE=l` especifica el [modo de listado de needrestart](https://github.com/liske/needrestart/blob/master/ex/needrestart.conf). No impide todos los reinicios de servicios que puedan realizar los propios scripts de configuración de paquetes. Lleva a cabo el trabajo en una ventana de mantenimiento con una vía de recuperación disponible, teniendo en cuenta también el impacto en SSH y VPN. No añadas `-y` para omitir la confirmación ni opciones que sustituyan indiscriminadamente todos los archivos de configuración.

Para prepararte ante una interrupción de SSH, usa una sesión de administración que permita continuar el proceso después de la desconexión, como tmux, y registra el resultado del comando. Si automatizas la ejecución, comprueba justo antes de empezar el host objetivo, la versión del sistema operativo, la comparación de la configuración, la verificación de la copia de seguridad y el estado de detención; guarda también los resultados de las etapas intermedias. No vuelvas a iniciar la misma actualización porque se haya interrumpido la conexión.

### Qué hacer con las actualizaciones que siguen retenidas por el despliegue gradual

El despliegue gradual de Ubuntu ofrece las actualizaciones habituales primero a una parte de los usuarios y puede frenar su distribución si hay problemas. Si una actualización habitual deja paquetes retenidos por el despliegue gradual, registra el motivo. No hace falta forzar su aplicación solo para reducir a 0 la cantidad de paquetes retenidos. [Información de Ubuntu sobre el despliegue gradual](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)

Sin embargo, la preparación para una actualización de versión es distinta. El procedimiento oficial de Ubuntu indica que se actualice la versión actual, incluidos los paquetes del despliegue gradual. Para los requisitos previos de `do-release-upgrade`, sigue las instrucciones oficiales vigentes en ese momento. Una actualización de versión también puede requerir sustituir o eliminar paquetes, así que no uses sin más el comando anterior para actualizaciones habituales como procedimiento de migración.

Antes de ejecutarla, comprueba con el siguiente comando las versiones de destino disponibles.

```bash
sudo do-release-upgrade -c
```

Cuando se ofrezca la LTS prevista y hayas terminado de actualizar y reiniciar la versión actual, verificar la restauración y comprobar la compatibilidad, ejecuta `sudo do-release-upgrade` durante la ventana de mantenimiento. Si la comprobación no ofrece un destino, investiga las condiciones de disponibilidad. No continúes seleccionando una versión de desarrollo. Si se te pregunta por cambios en archivos de configuración, revisa las diferencias y evalúa su impacto en la conexión y la autenticación.

## 7. Si SSH no vuelve, diagnostica en orden la comunicación y el inicio

Si no puedes conectar por SSH, utiliza la consola de recuperación para investigar lo siguiente.

| Etapa que se comprueba                 | Ejemplos de comprobación            | Qué investigar después                                                              |
| -------------------------------------- | ----------------------------------- | ----------------------------------------------------------------------------------- |
| Si el sistema operativo se ha iniciado | Consola, `systemctl --failed`       | Modo de emergencia, unidades fallidas, interrupción de la configuración de paquetes |
| Si hay IP y rutas                      | `ip address`, `ip route`            | Origen de la configuración de Netplan, nombre de la interfaz y cambios en las rutas |
| Si SSH está a la escucha               | `sshd -t`, servicio y socket de SSH | Errores de configuración y puerto en el que realmente escucha                       |
| Si se puede acceder desde el exterior  | Conexión desde otro host            | Firewall, VPN y controles de comunicación del proveedor de nube                     |

Consulta el journal correspondiente al inicio actual. Usa `journalctl -b -u 対象unit` para revisar los motivos de los fallos de inicio o las cancelaciones, y `systemctl show 対象unit -p After -p Before -p Requires -p Wants` para comprobar las dependencias.

Si se cancela el inicio de la VPN de conexión, investiga no solo la configuración de red, sino también el orden de inicio. Por ejemplo, puede producirse un ciclo si una unidad socket antigua espera a la VPN y esta espera a otra etapa del inicio. Comprueba la escucha y las comunicaciones actuales antes de modificar solo las unidades cuya función haya terminado. Con la activación mediante socket, es posible que el servicio que espera conexiones esté inactivo aunque todo funcione correctamente; no lo consideres innecesario basándote solo en su estado.

### Si cloud-init vuelve a generar la configuración de red

cloud-init es un mecanismo que realiza la configuración inicial en entornos de nube, entre otras tareas. Si la configuración está diseñada para que el administrador mantenga Netplan, comprueba que la regeneración posterior a la actualización no la modifique. Para desactivar la generación de red, escribe lo siguiente en un archivo administrado dentro de `/etc/cloud/cloud.cfg.d/`.

```yaml
network:
  config: disabled
```

Esta configuración [desactiva únicamente la generación de red de cloud-init](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). No la apliques indiscriminadamente en entornos que reciben la configuración de red desde los metadatos de la nube. Confirma quién administra la configuración y verifica el resguardo de Netplan existente, la comparación de hashes, el resultado generado y la comunicación después de un reinicio normal.

## 8. Comprueba los problemas de compatibilidad de autenticación o inicio solo en las configuraciones pertinentes

Las siguientes comprobaciones están dirigidas a entornos que utilizan el software correspondiente. No hace falta añadirlo a servidores donde no esté instalado.

### Si Samba proporciona autenticación para un dominio de Windows

Samba AD/DC es una configuración que proporciona autenticación y directorio para dominios de Windows. Al migrar a Ubuntu 26.04, sigue las [notas oficiales para la actualización](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases) y comprueba en el sistema operativo antiguo si está instalado `samba-ad-dc`.

```bash
dpkg-query -W -f='${Status}\n' samba-ad-dc
apt-cache policy samba-ad-dc
```

Confirma `install ok installed`; si no está instalado, revisa las fuentes oficiales y los paquetes que se añadirán, y luego instálalo en el sistema operativo antiguo. No mezcles la instalación de los paquetes necesarios con la recreación del dominio ni con cambios en el nivel funcional.

Para la copia de seguridad, usa el método adecuado de [`samba-tool domain backup`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), no una copia simple de los archivos de la base de datos. En la verificación de la restauración, comprueba también la respuesta del directorio desde un entorno aislado. En una prueba con Samba 4.23, hubo un caso en el que, aunque se cambiaron las ubicaciones de almacenamiento de la base de datos y el PID, el servicio no pudo iniciarse porque faltaba el socket interno `/run/samba/nmbd`. Revisar por separado los datos persistentes y los directorios de ejecución permite distinguir entre una copia de seguridad dañada y un entorno de prueba incompleto.

### Si SSSD está conectado a un sistema externo de autenticación

SSSD permite conectar Linux a sistemas de información de usuarios y autenticación como AD o LDAP. En [SSSD 2.10 se ha eliminado `config_file_version`](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes). Si aún existe una configuración antigua, conserva primero el propietario y los permisos del archivo original, corrige la configuración y compruébala con `sudo sssctl config-check`.

Presta atención también al método de inicio. Puede haber un conflicto entre un responder iniciado por el monitor del propio SSSD y el mismo responder iniciado por un socket de systemd. Los responder son procesos que gestionan, entre otras cosas, las consultas de información de usuarios y la autenticación. Consulta la [especificación de configuración de la versión instalada](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html) y los registros, y ajusta solo los componentes que entren en conflicto.

Después de corregirlo, comprueba la obtención de información de usuarios, los procesos de autenticación necesarios y el estado Online del dominio. Si se integra con AD, comprueba también `adcli testjoin` con la clave de máquina existente. Antes de volver a emitir claves o volver a unir el sistema al dominio, identifica si el problema está en la configuración o en el método de inicio.

### Si la actualización se interrumpe y los paquetes o archivos de inicio quedan incompletos

Primero comprueba si hay paquetes sin configurar o dependencias pendientes mediante `sudo dpkg --audit` y `sudo apt-get check`. Si hay otro proceso de APT o dpkg en curso, no inicies otro. Tampoco elimines archivos de bloqueo para forzar la operación.

Si has confirmado que el proceso terminó y que hay que continuar configurando paquetes pendientes, reanuda la configuración con `sudo dpkg --configure -a`. Comprueba el resultado antes de continuar y resuelve primero los problemas que queden con las fuentes o las dependencias.

Aunque el nuevo kernel esté instalado, el sistema no podrá iniciarse con normalidad si falta el initrd necesario para el arranque. Comprueba el espacio de `/boot`, los kernels instalados y los archivos de inicio correspondientes. `update-initramfs -c -k 対象バージョン`, que crea un initrd nuevo, y `-u`, que actualiza uno existente, tienen usos distintos. [Especificación de update-initramfs](https://manpages.ubuntu.com/manpages/resolute/man8/update-initramfs.8.html)

Selecciona el kernel que quieres reparar de la lista de kernels instalados. `uname -r` indica el kernel que se está ejecutando en ese momento, que puede ser la versión antigua anterior a la actualización.

Si el inicio normal no está disponible y vas a usar temporalmente una shell de recuperación root, confirma que tienes autorización y sigue el procedimiento establecido, ya que las operaciones pueden eludir la autenticación. Empieza con comprobaciones de solo lectura y realiza únicamente los cambios necesarios. Revierte las opciones temporales de inicio y la supresión de servicios, y valida al final con el inicio normal de systemd. Haber podido iniciar un servicio desde la shell de recuperación no confirma que se inicie automáticamente.

## 9. Contrasta las condiciones de finalización tras el reinicio

Cuando termine la actualización, confirma que se ha completado la configuración de los paquetes y solo entonces reinicia con normalidad. Tras el reinicio, contrasta el registro previo con los siguientes puntos.

| Condición de finalización                                    | Evidencia que se debe comprobar                                                                       |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| El sistema se inició con normalidad                          | El ID de arranque ha cambiado y no se ha quedado en la shell de recuperación ni en modo de emergencia |
| Se usan el SO y el kernel previstos                          | `/etc/os-release` y `uname -r`. No lo decidas basándote solo en la lista de instalados                |
| Los paquetes son coherentes                                  | Resultado de `dpkg --audit` y `apt-get check`                                                         |
| Los servicios necesarios se han restablecido automáticamente | Servicios, sockets y contenedores; unidades fallidas y respuesta externa                              |
| La conexión y la autenticación funcionan                     | SSH, VPN y rutas de autenticación necesarias, probadas desde otro host                                |
| Se han retirado los cambios temporales                       | Admisión, firewall, temporizadores, paquetes retenidos, unidades y diferencias de configuración       |
| Se puede restaurar el estado posterior a la actualización    | Resultado y detalles de la restauración efectiva de una nueva versión de la copia de seguridad        |

Realiza las comprobaciones no solo desde el propio host actualizado, sino también desde otro host cuya ubicación se aproxime a la ruta de uso real. Si se trata de una API, comprueba que las solicitudes válidas se procesen correctamente y, en las rutas que requieren autenticación, que las solicitudes sin autenticar se rechacen según lo previsto. Una respuesta HTTP 200 por sí sola no comprueba los límites de autenticación ni las funciones principales de la aplicación.

Después de restablecer la admisión, comprueba que no queden unidades ni reglas temporales de mantenimiento. Para los sistemas con copias de seguridad activas, vuelve a guardar el estado final y restaura y verifica esa **nueva versión de la copia de seguridad**. No uses el éxito de una restauración anterior a la actualización como prueba de la copia posterior. Si una copia de seguridad estaba detenida intencionadamente, conserva ese estado.

En el registro final del trabajo, anota los cambios realizados, los resultados de los comandos, las operaciones adicionales de recuperación, el alcance de las comprobaciones y las tareas pendientes. Si no se han probado el inicio de sesión de un usuario real o las operaciones principales, registra esos puntos como no verificados. Distingue también entre haber podido recuperar parte de una copia de seguridad y haber restaurado el servicio completo en otro entorno.

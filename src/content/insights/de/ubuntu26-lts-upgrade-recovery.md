---
title: "Ubuntu 26.04: Migration, AD-Reparatur und Updates ohne aktive Spieler"
description: "Erfahrungen mit sechs Ubuntu-Servern: Samba und SSSD, Verbindungswiederherstellung, echte R2-Restores und Velocity-Wartung bei leerem Minecraft-Netzwerk."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "Die Versionsanzeige belegt keinen Abschluss"
  text: "Normalen Neustart, Verbindungen, automatische Dienstwiederkehr, erhaltene Konfiguration und relevante Backup-Restores prüfen. Interaktive Anmeldung, tatsächliches Spielen und vollständige Notfallwiederherstellung benötigen eigene Tests."
processFigure:
  eyebrow: "Wartungsabnahme"
  title: "Von den Ausgangsnachweisen bis zum Restore nach dem Update"
  description: "Bei einem Fehler Ziel und Zustand dokumentieren und vor dem Fortfahren gezielt wiederherstellen."
  variant: inline
  steps:
    - title: "Umfang und Rettungszugang"
      description: "Abhängigkeiten, Stoppbedingungen, ursprüngliche Einstellungen und Backups prüfen."
      icon: i-lucide-server
      accent: brand
    - title: "Stoppen und aktualisieren"
      description: "Neue Verbindungen kontrollieren, sauber beenden und freigegebene Updates anwenden."
      icon: i-lucide-wrench
      accent: amber
    - title: "Starten und wiederherstellen"
      description: "Unabhängig testen, ursprüngliche Zustände herstellen und dieselbe Backup-Generation prüfen."
      icon: i-lucide-shield-check
      accent: emerald
---

Ein Ubuntu-Update muss auch Authentifizierung, Netzwerk, Backups und Startabhängigkeiten erhalten. Ziel ist ein Server, der nach dem Neustart wieder regulär arbeitet.

Am 8. Oktober 2026 schlossen wir Migration oder Updates auf sechs Ubuntu-Servern für Web, Authentifizierung, Bots, CTF und einen Minecraft-Proxy ab. Zwei wechselten von 24.04 zu 26.04; vier liefen bereits mit 26.04 und erhielten gewöhnliche Paketupdates und einen Neustart. Hier verallgemeinern wir die tatsächlich beobachteten Probleme und Prüfungen.

## Release-Migration und gewöhnliche Updates trennen

Für eine LTS-Migration folgt man der [offiziellen Ubuntu-Anleitung](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/) mit `do-release-upgrade`. Paketänderungen und Dauer unterscheiden sich von Updates auf bestehenden 26.04-Systemen. Eine Bedingung „keine Paketentfernung“ aus der normalen Wartung darf nicht unverändert auf die Migration übertragen werden.

Zunächst Rollen, Abhängigkeiten, zulässige Ausfallzeit und Rettungskonsole klären. Wir sicherten Netplan, SSH, Authentifizierung, Dienste, Container, Timer und APT-Holds ausschließlich für root zugänglich. Solche Archive können Geheimnisse enthalten und gehören nicht in öffentliche Artikel oder Repositories.

Jeweils nur einen Host bearbeiten und das Ende anderer Wartung bestätigen. Alle Server zu aktualisieren erlaubt weder das Einschalten absichtlich gestoppter Backups noch Änderungen an Hosts mit einem anderen Betriebssystem.

## Backups vor ihrer Verwendung wiederherstellen

Ein erfolgreicher Speicherjob beweist keine Wiederherstellbarkeit. Vor dem Update stellten wir eine bestimmte R2-Generation in einem getrennten Arbeitsbereich wieder her und prüften passende Datenbanken, Einstellungen und ZIP-Inhalte. Siehe auch [Backup-Prüfung mit R2 und restic](/insights/restic-r2-backup-verification/).

Für Samba AD nutzten wir die [Backup-Funktionen von `samba-tool`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html) und prüften wiederhergestellte DB und LDAP-Antworten in einem isolierten DC. Das bloße Kopieren laufender Datenbankdateien reichte nicht aus.

Unser Samba-4.23-Prüfer scheiterte, weil andere DB- und PID-Pfade das interne Socket-Verzeichnis `/run/samba/nmbd` nicht bereitstellten. Wir prüften zunächst die Trennung der Netzwerk- und Mount-Namespaces von der Produktion und erzeugten dann ein eigenes `/run` nur im Prüfbereich. Ein Prüf-tmpfs wird dabei nicht über das `/run` des Produktionshosts gemountet.

Bei Provider-Disk-Images vorher Startbeschränkungen während der Erstellung, Größe, Dauer und Abrechnungseinheiten prüfen. Für die zusätzlichen Arbeiten nutzten wir geprüfte Anwendungsbackups und gesicherte Betriebssystemkonfiguration ohne neue Disk-Images. Das garantiert nicht dieselbe Wiederherstellungsabdeckung wie ein vollständiges Image. Absichtlich gestoppte Backups blieben gestoppt.

## Samba-AD/DC-Paket vor der Migration prüfen

Ubuntu 26.04 benötigt für AD/DC `samba-ad-dc`. Die Installation auf dem alten System anhand der [LTS-Migrationshinweise](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases) prüfen.

```bash
dpkg-query -W samba-ad-dc
```

Fehlt das Paket, zuerst AD/DC-Rolle und offizielle APT-Quellen bestätigen, dann vor der Migration installieren. Die bestehende Domäne muss dafür weder neu provisioniert noch in ihrer Funktionsebene angehoben werden.

## Nach einer Unterbrechung den aktuellen Zustand prüfen

Unser Authentifizierungsserver enthielt unkonfigurierte Pakete und keine initrd für den neuen Kernel. Nach der Prüfung über die Rettungskonsole schlossen wir die nötige Paketkonfiguration ab, erzeugten die initrd und kehrten zum normalen systemd-Start zurück.

Ein vorübergehender Start mit `init=/bin/bash` umgeht die normale Authentifizierung. Dieser Start war ausdrücklich freigegeben; die Prüfung begann schreibgeschützt. GRUB und Passwörter wurden nicht dauerhaft geändert. Vorübergehende Unterdrückung von Dienststarts wurde anschließend entfernt.

Die folgenden Befehle dienen der Prüfung, nicht als universelles Reparaturskript. Ausgaben vor Veröffentlichung auf Geheimnisse und Verbindungsdaten kontrollieren.

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

Wurde der ursprüngliche Exit-Code nicht erfasst, keinen Erfolgscode erfinden. Stattdessen Reparaturen und spätere Messungen dokumentieren. Vorhandene Kerneldateien beweisen keinen normalen Start mit diesem Kernel.

## Netzwerk und Authentifizierung anhand von Belegen reparieren

Korrekte Netplan-Dateien können beim Start von einer anderen Komponente neu erzeugt werden. In unserem Verwaltungsmodell verglichen wir die ursprünglichen Hashes und deaktivierten nur diese Neuerzeugung über die [cloud-init-Netzwerkkonfiguration](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). Das ist keine allgemeine Vorgabe für cloudverwaltete Netzwerke.

Fehlendes SSH kann auch durch Startabhängigkeiten entstehen. Das Journal zeigte einen Zyklus zwischen alten LDAP-Weiterleitungssockets und dem VPN, dessen Start systemd abbrach. Nach Prüfung aktueller Listener und Verbindungen deaktivierten wir nur die überholten Sockets beim Start. Ein auf Socket-Aktivierung wartender Dienst ist durch inactive allein nicht fehlerhaft.

SSSD meldete die entfernte Option `config_file_version` und Konflikte zwischen Monitor- und Socket-Aktivierung. Wir verglichen [SSSD-2.10-Änderungen](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes) mit der [Ubuntu-Referenz](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html), bewahrten Eigentümer und Berechtigungen und änderten nur das Nötige. Nicht sämtliche SSSD-Sockets wurden deaktiviert.

Danach prüften wir `sssctl config-check`, NSS/PAM/PAC-Responder, den Online-Zustand und `adcli testjoin` mit dem vorhandenen Maschinenschlüssel. Schlüsseltausch und erneuter Domänenbeitritt waren nicht nötig.

| Beobachtetes Problem                  | Beleg                                  | Prüfung nach der Reparatur                      |
| ------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| Fehlende AD/DC-Komponenten            | Paketinventar und Migrationshinweise   | Samba, DB/LDAP und ursprüngliche Domänen-ID     |
| VPN fehlt nach normalem Start         | Zyklus und Abbruch im Journal          | SSH, VPN, DNS und LDAP nach Neustart            |
| SSSD-Konfigurations- und Socketfehler | Konfigurationsprüfung und Konfliktlogs | Responder, Online-Zustand und Maschinenbeitritt |

## Wartung ohne Spieler benötigt frische Daten und Zugangskontrolle

Velocity wurde nur ohne aktive Spieler aktualisiert. Wir erfassten Zahlen über JSON-Monitoring und Status-Pings, ohne regelmäßig `list` oder `glist` an Konsolen zu senden. Geprüft wurden alle neun aktiven Backends, einschließlich eines außerhalb des acht Hosts umfassenden JSON-Monitorings, und der Proxy.

Die Freigabe verlangte überall null Spieler sowie Beobachtungen und Monitoring-Snapshots von höchstens 15 Sekunden Alter. Belegung, fehlende Daten, Abfragefehler, alte Werte oder nicht erfasste Ziele führten zum Warten. Spielernamen waren unnötig.

1. Überall aktuelle Nullwerte und abgeschlossene vorherige Wartung bestätigen.
2. Vorherigen Restore prüfen und Konfiguration sowie Ausgangszustände des Ziels sichern.
3. Spielerzahlen unmittelbar vor dem Stoppen erneut abfragen.
4. Neue Spielverbindungen vorübergehend sperren und danach erneut aktuelle Nullwerte verlangen.
5. Velocity geordnet herunterfahren und vor APT-Updates das Ende bestätigen.
6. Normal neu starten, unabhängig prüfen, Zugang öffnen und das neue Backup wiederherstellen.

Die Sperre erfasste erforderliches TCP/UDP für IPv4/IPv6 und blieb während des Neustarts bestehen. Eigene temporäre Regeln bewahrten SSH, VPN, API und Backend-Verkehr, ohne die bestehende Firewall zu ersetzen. Bei der Öffnung wurden auch temporäre Units und Regeln entfernt.

Zum geordneten Ende verwendeten wir Velocitys [`shutdown`](https://docs.papermc.io/velocity/built-in-commands/). Backends, Welten und Plugins wurden in dieser Wartung weder gestoppt noch aktualisiert.

## Phased Updates passend zur Wartungsphase behandeln

Die normale Wartung umfasste Simulation ohne Entfernung, strengen APT-Indexabruf, Konfigurationserhalt und Wiederherstellung ursprünglicher Timer und Holds. `NEEDRESTART_MODE=l` hielt Dienstneustarts in der geplanten Reihenfolge. Ein Worker prüfte Host und gestoppten Zustand und arbeitete unabhängig von der SSH-Verbindung.

Sieben Pakete blieben gemäß [Ubuntus Phased Updates](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/) zurückgestellt. Wir erzwangen ihre Installation nicht, nur um die Restliste zu leeren.

Die Voraussetzungen einer Release-Migration sind anders: Die offizielle Anleitung sieht auch die Aktualisierung phasenweise verteilter Pakete vor. Die tägliche Update-Regel nach der Migration gilt nicht unverändert für `do-release-upgrade`.

## Abschluss durch Neustart und dieselbe Backup-Generation belegen

Alle sechs Server starteten normal mit Ubuntu 26.04.1 und dem neuen Kernel. Geprüft wurden neue Boot-IDs, Paketkonsistenz, fehlgeschlagene Units, SSH/VPN, automatische Dienstwiederkehr und ursprüngliche Konfiguration, Timer, Holds und Zugangszustände.

Bei Velocity prüften wir Java-Status, Geyser-RakNet-Antworten und Verbindungen von einem anderen Host. Die Economy-API lieferte 200 über den erlaubten Weg, 401 ohne und 200 mit Authentifizierung. Ein einzelnes HTTP 200 belegt keine korrekte Authentifizierungsgrenze.

Bei aktiven Backups sicherten wir den fertigen Zustand und stellten genau diese Generation wieder her. Ein früherer Restore-Erfolg galt nicht als Beleg für ein neues Backup. Absichtlich deaktivierte Backups blieben deaktiviert.

Diese Prüfungen bestätigten die Rückkehr zum Regelbetrieb. Interaktive Benutzeranmeldung, tatsächliches Spielen, Bot-Beiträge oder Generierung und eine vollständige Notfallwiederherstellung brauchen eigene Tests. Debian-zu-Ubuntu-Migration war nicht Teil dieses Falls.

---
title: "Ein laufendes Ubuntu aktualisieren: Vorbereitung, Wiederherstellung der Verbindung und Prüfungen nach dem Neustart"
description: "Am Beispiel des Upgrades von Ubuntu 24.04 auf 26.04 sowie regulärer Updates erläutert der Artikel konkret die tatsächliche Wiederherstellung aus einem Backup, das Sichern von Konfigurationen, das sichere Anhalten bei fehlenden Nutzern, die Fehleranalyse bei nicht wiederkehrendem SSH-Zugang und die Abschlusskriterien."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Linux", "Backup", "Betrieb"]
callout:
  type: note
  title: "Vor Beginn festlegen, wie sich der Zustand wiederherstellen lässt und woran der Abschluss erkennbar ist"
  text: "Wir prüfen, ob sich Konfigurationen und Daten extrahieren lassen, ob sich der Server auch bei unterbrochener SSH-Verbindung bedienen lässt und ob die Dienste nach einem normalen Neustart automatisch zurückkehren. Der erfolgreiche Abschluss des Update-Befehls allein bestätigt diese 3 Punkte nicht."
processFigure:
  eyebrow: "Ablauf der Aktualisierung"
  title: "Von der Wiederherstellungsvorbereitung bis zur Prüfung der Wiederherstellung nach dem Update"
  description: "Erst wenn die Prüfungen jeder Phase erfolgreich sind, fahren Sie mit der nächsten fort. Bei einem Fehler halten Sie den Zustand und die bereits ausgeführten Schritte fest."
  variant: inline
  steps:
    - title: "Wiederherstellung und Konfigurationssicherung"
      description: "Benötigte Daten extrahieren sowie Zugangsweg und Einstellungen vor den Änderungen sichern."
      icon: i-lucide-server
      accent: brand
    - title: "Annahmestopp und Aktualisierung"
      description: "Nutzung erneut prüfen, ordnungsgemäß herunterfahren und die geplante Aktualisierung anwenden."
      icon: i-lucide-wrench
      accent: amber
    - title: "Neustart und Funktionsprüfung"
      description: "Verbindungen von außen, automatischen Start, Wiederherstellung der ursprünglichen Einstellungen und ein neues Backup prüfen."
      icon: i-lucide-shield-check
      accent: emerald
---

Beim Aktualisieren eines laufenden Ubuntu-Servers müssen Sie neben den Paketen auch Dienste anhalten und die Wiederaufnahme des Betriebs nach dem Neustart vorbereiten. Probleme wie eine nicht mehr erreichbare SSH-Verbindung, Authentifizierungseinstellungen, die nicht zur neuen Spezifikation passen, oder Backups, aus denen sich keine Daten wiederherstellen lassen, können auch nach Abschluss des Update-Befehls auftreten.

Dieser Artikel fasst Erkenntnisse aus der LTS-Migration von Ubuntu 24.04 auf 26.04 und aus regulären Updates danach als auf andere Server übertragbare Vorgehensweise zusammen. Voraussetzung sind administrative Rechte und ein Wartungsfenster, in dem Dienste angehalten werden können. Zunächst stellen wir die gemeinsamen Vorbereitungs- und Arbeitsschritte vor; im hinteren Teil grenzen wir Probleme mit Verbindung, Authentifizierung und Start ein.

## 1. Art der Aktualisierung und Arbeitsumfang festlegen

Entscheiden Sie zunächst, ob Sie die Betriebssystemversion wechseln oder Pakete innerhalb derselben Version aktualisieren. Umfang der nötigen Änderungen und Prüfungen unterscheiden sich.

| Arbeit                  | Beispiel                                                   | Verwendetes Werkzeug | Vorab zu prüfen                                                                              |
| ----------------------- | ---------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| Reguläre Aktualisierung | Korrekturen oder Kernel-Updates innerhalb von Ubuntu 26.04 | APT                  | Geplante Aktualisierungen, Installationen und Entfernungen; Auswirkungen von Dienstneustarts |
| Release-Upgrade         | Wechsel von Ubuntu 24.04 auf 26.04                         | `do-release-upgrade` | Offizielle Upgrade-Bedingungen, Kompatibilität, eingestellte oder aufgeteilte Pakete         |

`apt-get dist-upgrade` passt Abhängigkeiten für die konfigurierten Paketquellen an. Trotz des Wortes „dist“ im Namen ist es kein spezieller Befehl für den Wechsel zur nächsten LTS-Version von Ubuntu. Für ein Release-Upgrade halten Sie sich an die [offizielle Anleitung von Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/). In Produktionsumgebungen verwenden Sie weder `-d` für eine Entwicklungsversion noch ändern Sie die APT-Paketquellen von Hand. Ein Wechsel von Debian zu Ubuntu ist ebenfalls kein Upgrade, das sich mit diesem Verfahren durchführen lässt.

Prüfen Sie nicht nur den Hostnamen, sondern auch DNS, Authentifizierung, Datenbanken und das Zugangs-VPN, auf die der Server angewiesen ist. Bei mehreren Servern aktualisieren Sie jeweils 1 Server und prüfen dabei, ob die abhängigen Systeme stabil verfügbar sind. Wenn sich weitere Wartungsarbeiten oder Backups überschneiden, legen Sie die Reihenfolge vorher fest.

Definieren Sie außerdem Abbruchkriterien, etwa „Wiederherstellung fehlgeschlagen“, „erforderliche Pakete nicht abrufbar“, „ordnungsgemäßes Herunterfahren nicht möglich“ oder „Wiederherstellungskonsole nicht erreichbar“. Es ist leichter, zu entscheiden, wenn Sie Zeit für die Wiederherstellung reservieren, statt die Aktualisierung bis zum Ende des Wartungsfensters fortzusetzen.

## 2. Einen Bedienweg sicherstellen, der auch bei unterbrochenem SSH funktioniert

Stellen Sie vor dem Update sicher, dass Sie über die Verwaltungsoberfläche des VPS- oder Cloud-Anbieters die Wiederherstellungskonsole erreichen. Es reicht nicht, die Oberfläche nur zu öffnen; Sie brauchen auch eine Anmeldemöglichkeit, mit der sich das Betriebssystem tatsächlich bedienen lässt. Ein Zugang, der wie SSH von demselben VPN oder Authentifizierungsserver abhängt, hilft nicht, wenn diese Abhängigkeit ausfällt.

Die Schaltfläche zum Neustarten behebt vorübergehende Hänger oder Störungen. Konfigurationsfehler und Probleme mit der Startreihenfolge treten nach dem Neustart erneut auf. Sorgen Sie dafür, dass Sie den aktuellen Zustand über die Konsole prüfen können, bevor Sie bei unklarem Fortschritt des Updates wiederholt einen Neustart auslösen.

Wenn Sie ein Festplattenabbild des Providers verwenden, klären Sie, ob während der Erstellung Start oder Bedienung eingeschränkt sind, wie lange die Fertigstellung voraussichtlich dauert und welche Speichergrenzen sowie Abrechnungseinheiten gelten. Bei einem anwendungsseitigen Backup müssen Sie außerdem das Betriebssystem neu aufbauen und Konfigurationen zurückspielen können. Unabhängig von der Methode notieren Sie vor der Arbeit, welche Bereiche sich wiederherstellen lassen und welche Lücken bleiben.

## 3. Ein Backup an einem anderen Ort tatsächlich wiederherstellen

Selbst wenn der Backup-Job erfolgreich war, ist nicht garantiert, dass die benötigten Daten enthalten und lesbar sind. Stellen Sie vor dem Update eine Sicherungsgeneration, deren Zielhost, Sicherungszeitpunkt und Inhalt geprüft wurden, in ein leeres Prüfverzeichnis wieder her.

Wenn Sie beispielsweise das Backup-Werkzeug restic verwenden, können Sie dies in einer Administratorshell prüfen, die auf die vorhandenen Verbindungseinstellungen zugreifen kann. Ersetzen Sie `snapshot_id` durch die ID der geprüften Sicherungsgeneration. Wenn Sie die ID fest vorgeben, statt `latest` zu verwenden, ändert sich das Ziel nicht, falls während der Prüfung ein neuer Sicherungslauf startet.

```bash
# 既存のリポジトリ接続設定を使う。秘密値をコマンドに直書きしない。
snapshot_id='確認したスナップショットID'
umask 077
restore_dir=$(mktemp -d /var/tmp/restore-check.XXXXXX) || exit 1
restic restore "$snapshot_id" --target "$restore_dir" --verify
```

Geben Sie das Datenverzeichnis der Produktion nicht als Wiederherstellungsziel an. Da restic vorhandene Dateien überschreiben kann, lesen Sie die [offizielle Dokumentation zur Wiederherstellung](https://restic.readthedocs.io/en/stable/050_restore.html) und prüfen Sie in einem isolierten, leeren Verzeichnis. Ein Beispiel für eine Konfiguration mit Objektspeicher wie R2 findet sich auch im Artikel [So integrieren Sie eine tatsächliche Wiederherstellung aus dem Backup](/insights/restic-r2-backup-verification/).

Prüfen Sie nach der Wiederherstellung je nach Datenformat Folgendes:

| Daten                                      | Was zu prüfen ist                                                                | Was dadurch allein nicht bestätigt wird                |
| ------------------------------------------ | -------------------------------------------------------------------------------- | ------------------------------------------------------ |
| ZIP- oder andere Archive                   | Entpacken und Integritätsprüfung, Vorhandensein benötigter Dateien               | Dass die Anwendung startet und die Inhalte nutzen kann |
| SQL-Dump                                   | Import in eine isolierte Datenbank, Schema und wichtige Daten                    | Konsistenz mit Anhängen und externem Speicher          |
| SQLite                                     | Vorhandensein und Größe der wiederhergestellten Datei, Integritätsprüfung der DB | Wiederherstellung des gesamten Dienstes                |
| Konfigurationen, Zertifikate und Schlüssel | Zieldateien, Eigentümer, Berechtigungen und Verweise                             | Einstellungen oder Gültigkeit auf externen Diensten    |

Wenn Sie eine laufende DB-Datei unverändert kopieren, können Zustände aus unterschiedlichen Schreibzeitpunkten vermischt sein. Verwenden Sie ein Backup-Verfahren, das die von der Datenbank oder Anwendung bereitgestellte Konsistenz wahrt, und stimmen Sie den Zeitpunkt der Daten und der zugehörigen Dateien aufeinander ab. Da Prüfwerkzeuge manchmal eine leere DB neu anlegen, bestätigen Sie zunächst, dass die wiederhergestellte Datei tatsächlich existiert, bevor Sie eine erfolgreiche Integritätsprüfung melden.

Wenn Sie für Tests eine Authentifizierungsinfrastruktur starten, isolieren Sie auch das Netzwerk, damit ein Klon mit derselben Identität nicht mit der Produktion kommuniziert. Wenn Sie Container oder Namespaces verwenden, prüfen Sie deren Isolation, bevor Sie mounten oder starten. Prüfen Sie auch, dass ein Prozess zur Bereitstellung eines Prüf-`/run` nicht das `/run` des Produktionshosts überdeckt.

## 4. Nicht nur Konfigurationen, sondern auch den ursprünglichen Betriebszustand sichern

Zusätzlich zu Kopien der Konfigurationsdateien halten Sie den folgenden Zustand fest. Legen Sie die Sicherungen an einem nur für Administratoren lesbaren Ort ab und trennen Sie sie nach Arbeitsschritt, damit vorhandene Aufzeichnungen nicht überschrieben werden.

| Gesicherter Bereich       | Später abzugleichende Informationen                                                  |
| ------------------------- | ------------------------------------------------------------------------------------ |
| Betriebssystem und Pakete | Release, laufender Kernel, installierte Pakete, APT-Quellen und Hold-Markierungen    |
| Netzwerk und SSH          | Netplan, SSH-Konfiguration, VPN-Einstellungen, Verwaltungsverfahren der Firewall     |
| Dienste                   | Units und Drop-ins, beim Start aktiviert oder deaktiviert, aktueller Betriebszustand |
| Zeitgesteuerte Aufgaben   | Timer, Cron, Aktivierungszustand der Backups und nächster Lauf                       |
| Anwendungen               | Konfiguration, Datenpfade, Containeraufbau, externe Abhängigkeiten                   |

Ein Beispiel für das Sichern von Zustand auf einem Ubuntu-System mit Netplan und systemd. Prüfen Sie, dass die betreffenden Verzeichnisse existieren, und führen Sie die Befehle aus einer Root-Shell aus, die Sie mit `sudo -i` geöffnet haben. Das mit `mktemp` erstellte Verzeichnis ist ein neuer, nur für root zugänglicher Speicherort und überschreibt keine früheren Aufzeichnungen.

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

Dieses Beispiel enthält keine anwendungsspezifische Konfiguration und keine Daten auf externem Speicher. Ergänzen Sie die in der Tabelle ermittelten Ziele und halten Sie den Ablageort der gesicherten Daten im Arbeitsprotokoll fest.

Beispiele für Befehle zur Überprüfung. Ausgaben mit Hostname, Zieladresse und Konfigurationsinhalt veröffentlichen Sie nicht, sondern bewahren sie als Arbeitsprotokoll auf.

```bash
cat /etc/os-release
uname -r
cat /proc/sys/kernel/random/boot_id
apt-mark showhold
systemctl list-timers --all
systemctl --failed
sudo sshd -t
```

`sshd -t` prüft die Syntax der SSH-Konfiguration. Auch bei Erfolg sagt das nichts darüber aus, ob Verbindungen von außen möglich sind. Bei Netplan prüfen Sie Syntax und generiertes Ergebnis getrennt von der tatsächlichen Netzwerkkommunikation.

Wenn Sie für das Update einen Timer anhalten oder eine Hold-Markierung vorübergehend ändern, halten Sie den ursprünglichen Zustand und den Grund fest. Nach der Arbeit pauschal „alles zu aktivieren“ würde auch zuvor absichtlich angehaltene Vorgänge starten. Gleichen Sie beim Wiederherstellen von Einstellungen nur die geänderten Stellen anhand eines Diffs ab, statt ganz `/etc` durch einen älteren Stand zu ersetzen.

## 5. Den Moment ohne Nutzer in einen sicheren Zustand zum Anhalten überführen

Bei Diensten, die nur dann angehalten werden sollen, wenn keine Nutzer aktiv sind, reicht ein Nutzer- oder Verbindungszähler von 0 nicht aus: Prüfen Sie auch den Beobachtungsumfang und den Zeitpunkt. Dass am Proxy am Eingang keine Nutzer zu sehen sind, bedeutet nicht zwangsläufig, dass auf den dahinterliegenden Servern oder in laufenden Jobs ebenfalls niemand arbeitet.

Listen Sie zuerst die einzubeziehenden Ziele auf und rufen Sie für jedes Ziel den neuesten Wert ab. Wenn ein Abruf fehlschlägt, ein Wert fehlt oder veraltet ist oder ein Server nicht überwacht wird, geben Sie das Anhalten nicht frei. Setzen Sie einen fehlenden Wert nicht auf 0, sonst könnte ein Überwachungsausfall das Anhalten auslösen.

Wenn die Überwachung beispielsweise normalerweise alle paar Sekunden aktualisiert wird, können Sie als Bedingung festlegen, dass sowohl der Beobachtungszeitpunkt als auch der Aktualisierungszeitpunkt der Quelldaten nicht mehr als 15 Sekunden zurückliegen. Diese 15 Sekunden sind nur ein Entwurfsbeispiel. Richten Sie den Wert am tatsächlichen Aktualisierungsintervall aus und berücksichtigen Sie Zeitabweichungen. Wenn die Anzahl allein genügt, müssen Sie keine Nutzernamen erfassen und keine Listenbefehle regelmäßig an die Konsole senden.

Gehen Sie unmittelbar vor dem Anhalten in dieser Reihenfolge vor:

1. Prüfen Sie, dass die Nutzer- und Verarbeitungszahlen bei allen Zielen 0 sind und keine konkurrierenden Wartungsarbeiten stattfinden.
2. Sperren Sie die Annahme neuer Anfragen in der Anwendung oder im Load Balancer. Bestehende Vorgänge sollen kontrolliert auslaufen können.
3. Prüfen Sie anhand neuer Werte, die nach dem Sperren des Eingangs erzeugt wurden, erneut, dass die Nutzer- oder Prozesszahl bei allen Zielen 0 beträgt.
4. Fordern Sie das ordnungsgemäße Beenden an und prüfen Sie, dass die Prozesse beendet und die Daten gespeichert wurden.
5. Geben Sie den Eingang erst wieder frei, wenn die Funktionsprüfungen nach dem Update und Neustart abgeschlossen sind.

Wenn nach dem Sperren Nutzer gefunden werden, fahren Sie nicht mit dem Herunterfahren fort, sondern nutzen den vorab festgelegten Ablauf zum Warten und Wiederfreigeben der Annahme. Verwenden Sie den zuvor ermittelten Wert 0 nicht erneut.

Wenn Sie die Annahme über eine Firewall steuern, prüfen Sie, wie neue und bestehende Verbindungen behandelt werden, sowie IPv4 und IPv6 und TCP und UDP. Da die Behandlung von UDP je nach Anwendung unterschiedlich ist, sollten Sie auch einen Wartungsmodus auf Anwendungsebene in Betracht ziehen. Lassen Sie SSH und VPN für die Verwaltung sowie die interne Kommunikation erreichbar und vergewissern Sie sich, dass die Sperre der Annahme während eines Neustarts bestehen bleibt. Verwenden Sie eine eigene temporäre Regel, damit Sie bei der Wiederaufnahme genau diese Regel entfernen können.

### Die Anforderung eines ordnungsgemäßen Herunterfahrens vom tatsächlichen Abschluss unterscheiden

Wenn Sie `systemctl stop` verwenden, prüfen Sie vorher `ExecStop`, die Wartezeit beim Herunterfahren und die Einstellungen zur erzwungenen Beendigung der betreffenden Unit. Wenn `ExecStop` lediglich eine Beendigungsanforderung sendet und anschließend zurückkehrt, kann systemd übrig gebliebene Prozesse beenden. Berücksichtigen Sie gemäß der [Spezifikation von systemd](https://manpages.ubuntu.com/manpages/resolute/man5/systemd.service.5.html) auch das Warten auf das ordnungsgemäße Beenden.

Bei Diensten, die über eine Konsoleneingabe beendet werden, muss der korrekte Befehl außerdem mit Zeilenumbruch beim Zielprozess ankommen. In einer Befehlszeile innerhalb einer Unit funktionieren Shell-Konstrukte wie `$()` oder Pipes nicht automatisch. Fassen Sie notwendige Schritte in einem kleinen Skript zusammen und bauen Sie Prüfungen ein, die den Zielprozess eindeutig identifizieren und auf dessen Ende warten. Läuft ein Timeout ab, suchen Sie nach der Ursache dafür, dass kein ordnungsgemäßes Anhalten möglich ist, statt den Prozess zwangsweise zu beenden und mit dem Update fortzufahren.

## 6. Bei regulären Updates Indexabruf, Vorschau und Anwendung trennen

Sobald Wiederherstellung und Anhalten vorbereitet sind, rufen Sie zunächst die Paketindizes ab. Fahren Sie nicht mit veralteten Indizes fort, wenn einige Paketquellen fehlgeschlagen sind.

```bash
# この段階ではパッケージを更新しない
sudo apt-get update -o APT::Update::Error-Mode=any &&
  sudo apt-get -s --no-remove dist-upgrade
```

Prüfen Sie den Rückgabecode der Simulation sowie die geplanten Aktualisierungen, Installationen und Entfernungen. `--no-remove` sorgt dafür, dass der Vorgang abgebrochen wird, falls Pakete entfernt werden müssten. Für Kernel und andere Pakete können neue Pakete erforderlich sein; machen Sie daher „0 neue Pakete“ nicht zu einer allgemeinen Bedingung für reguläre Updates. Laut der [APT-Spezifikation](https://manpages.ubuntu.com/manpages/resolute/man8/apt-get.8.html) ist der Zustand während einer Simulation nicht festgeschrieben. Prüfen Sie unmittelbar vor der Ausführung erneut, ob ein anderer APT-Vorgang läuft und ob sich der geplante Umfang geändert hat.

Wenn der geplante Umfang unproblematisch ist und die betreffenden Dienste angehalten sind, fahren Sie mit der Anwendung fort. In Umgebungen mit needrestart können Sie zusätzliche Neustartvorschläge wie folgt als Liste anzeigen lassen:

```bash
# 通常更新の予定を確認し、必要なサービスを正常停止した後に実行する
sudo env NEEDRESTART_MODE=l apt-get --no-remove dist-upgrade
```

`NEEDRESTART_MODE=l` legt den [Listenmodus von needrestart](https://github.com/liske/needrestart/blob/master/ex/needrestart.conf) fest. Damit werden nicht sämtliche Dienstneustarts verhindert, die durch Konfigurationsskripte der Pakete selbst ausgelöst werden. Führen Sie das Update in einem Wartungsfenster mit gesichertem Wiederherstellungszugang durch und berücksichtigen Sie auch die Auswirkungen auf SSH und VPN. Verwenden Sie weder ein ungeprüftes `-y` noch eine Option, die pauschal alle Konfigurationsdateien ersetzt.

Verwenden Sie für den Fall einer SSH-Unterbrechung eine Administratorsitzung wie tmux, in der der Vorgang auch nach einer Verbindungsunterbrechung weiterläuft, und protokollieren Sie das Ergebnis des Befehls. Bei einer automatisierten Ausführung prüfen Sie unmittelbar vor dem Start den Zielhost, die Betriebssystemversion, den Abgleich der Konfiguration, die Backup-Prüfung und den Zustand der angehaltenen Dienste und speichern Sie auch die Zwischenstände. Starten Sie dasselbe Update nicht erneut, nur weil die Verbindung abgebrochen ist.

### Umgang mit zurückgehaltenen Updates bei gestaffelter Bereitstellung

Bei gestaffelten Aktualisierungen von Ubuntu werden reguläre Updates zunächst nur einem Teil der Nutzer bereitgestellt; bei Problemen kann die Verteilung gedrosselt werden. Wenn bei regulären Updates aufgrund der gestaffelten Bereitstellung Pakete zurückgehalten werden, dokumentieren Sie den Grund. Sie müssen keine Zwangsaktualisierung auslösen, nur um die Zahl der zurückgehaltenen Pakete auf 0 zu setzen. [Erläuterung der gestaffelten Bereitstellung von Ubuntu](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)

Die Vorbereitung eines Release-Upgrades ist jedoch ein anderer Fall. Die offizielle Anleitung von Ubuntu empfiehlt, die aktuelle Version einschließlich gestaffelt bereitgestellter Pakete zu aktualisieren. Wenden Sie die jeweils gültige offizielle Anleitung für die Voraussetzungen von `do-release-upgrade` an. Da ein Release-Upgrade auch das Ersetzen oder Entfernen erforderlicher Pakete umfassen kann, übernehmen Sie den oben genannten Befehl für reguläre Updates nicht unverändert als Migrationsverfahren.

Prüfen Sie vor der Ausführung mit folgendem Befehl, welche Zielversion angeboten wird:

```bash
sudo do-release-upgrade -c
```

Wenn die beabsichtigte LTS-Version angeboten wird und die Aktualisierung und der Neustart der aktuellen Version, die Wiederherstellungsprüfung und die Kompatibilitätsprüfung abgeschlossen sind, führen Sie `sudo do-release-upgrade` im Wartungsfenster aus. Wird bei der Prüfung keine Zielversion angeboten, untersuchen Sie die Angebotsbedingungen. Fahren Sie nicht mit der Angabe einer Entwicklungsversion fort. Wenn Sie zur Änderung einer Konfigurationsdatei aufgefordert werden, prüfen Sie den Diff und beurteilen Sie die Auswirkungen auf Verbindungs- und Authentifizierungseinstellungen.

## 7. Wenn SSH nicht zurückkehrt, Netzwerk und Start der Reihe nach prüfen

Wenn keine SSH-Verbindung möglich ist, grenzen Sie das Problem über die Wiederherstellungskonsole wie folgt ein.

| Zu prüfende Phase                    | Beispiel für die Prüfung           | Als Nächstes untersuchen                                              |
| ------------------------------------ | ---------------------------------- | --------------------------------------------------------------------- |
| Ist das Betriebssystem gestartet?    | Konsole, `systemctl --failed`      | Notfallmodus, fehlgeschlagene Units, unterbrochene Paketkonfiguration |
| Sind IP-Adresse und Route vorhanden? | `ip address`, `ip route`           | Quelle der Netplan-Konfiguration, Schnittstellenname, geänderte Route |
| Lauscht SSH?                         | `sshd -t`, SSH-Service und -Socket | Konfigurationsfehler, tatsächlich verwendeter Listen-Port             |
| Ist der Host von außen erreichbar?   | Verbindung von einem anderen Host  | Firewall, VPN, Kommunikationssteuerung auf Cloud-Seite                |

Untersuchen Sie das Journal für den aktuellen Start. Prüfen Sie mit `journalctl -b -u 対象unit` den Grund für einen fehlgeschlagenen oder abgebrochenen Start und mit `systemctl show 対象unit -p After -p Before -p Requires -p Wants` die Abhängigkeiten.

Wenn der Start des Zugangs-VPN abgebrochen wird, prüfen Sie neben der Netzwerkkonfiguration auch die Startreihenfolge. Ein Beispiel für einen Zyklus ist eine alte Socket-Unit, die auf das VPN wartet, während dieses wiederum auf eine andere Startphase wartet. Prüfen Sie, welche Listener und Kommunikation tatsächlich genutzt werden, bevor Sie nur Units ändern, deren Aufgabe beendet ist. Bei Socket-Aktivierung kann es normal sein, dass ein Dienst, der auf Verbindungen wartet, im Zustand inactive ist. Beurteilen Sie daher nicht allein anhand der Statusanzeige, dass er nicht gebraucht wird.

### Wenn cloud-init das Netzwerk neu generiert

cloud-init ist ein Mechanismus für die Ersteinrichtung und andere Aufgaben in Cloud-Umgebungen. Wenn das bestehende Netplan in Ihrer Umgebung dauerhaft von Administratoren verwaltet wird, prüfen Sie, ob eine Neugenerierung nach dem Update die Konfiguration verändert. Um die Netzwerkgenerierung zu deaktivieren, schreiben Sie in eine verwaltete Datei unter `/etc/cloud/cloud.cfg.d/` Folgendes:

```yaml
network:
  config: disabled
```

Damit wird [nur die Netzwerkgenerierung durch cloud-init deaktiviert](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). Wenden Sie die Einstellung nicht pauschal auf Umgebungen an, die Netzwerkkonfiguration aus Cloud-Metadaten beziehen. Prüfen Sie, wo die Konfiguration verwaltet wird, sichern Sie das bestehende Netplan und gleichen Sie dessen Hash ab, prüfen Sie das generierte Ergebnis und verifizieren Sie die Kommunikation nach einem normalen Neustart.

## 8. Kompatibilitätsprobleme bei Authentifizierung und Start nur für betroffene Konfigurationen prüfen

Die folgenden Prüfungen sind für Umgebungen gedacht, die die betreffende Software verwenden. Sie müssen die Software nicht auf Servern installieren, auf denen sie nicht eingesetzt wird.

### Wenn Samba die Authentifizierung für eine Windows-Domäne bereitstellt

Samba AD/DC ist eine Konfiguration, die Authentifizierung und Verzeichnisdienste für eine Windows-Domäne bereitstellt. Folgen Sie beim Wechsel auf Ubuntu 26.04 den [offiziellen Upgrade-Hinweisen](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases) und prüfen Sie auf dem alten Betriebssystem, ob `samba-ad-dc` installiert ist.

```bash
dpkg-query -W -f='${Status}\n' samba-ad-dc
apt-cache policy samba-ad-dc
```

Prüfen Sie, ob `install ok installed` angezeigt wird. Falls das Paket nicht installiert ist, überprüfen Sie die offiziellen Paketquellen und die geplanten Änderungen, bevor Sie es auf dem alten Betriebssystem installieren. Vermischen Sie das Nachinstallieren erforderlicher Pakete nicht mit einer Neuerstellung der Domäne oder einer Änderung der Funktionsebene.

Verwenden Sie für Backups eine geeignete Methode von [`samba-tool domain backup`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html) statt einer einfachen Kopie der DB-Dateien. Prüfen Sie bei der Wiederherstellung neben der DB auch die Verzeichnisantworten in einer isolierten Umgebung. Bei Tests mit Samba 4.23 gab es Fälle, in denen der Start trotz geänderter Speicherorte für DB und PID nicht möglich war, weil der interne Socket-Pfad `/run/samba/nmbd` fehlte. Prüfen Sie persistente Daten und Laufzeitverzeichnisse getrennt, um ein beschädigtes Backup von einer unvollständigen Testumgebung unterscheiden zu können.

### Wenn SSSD mit einer externen Authentifizierungsinfrastruktur verbunden ist

SSSD ist ein Mechanismus, um Linux mit Benutzerinformationen und Authentifizierungsdiensten wie AD oder LDAP zu verbinden. In SSSD 2.10 wurde [`config_file_version` abgeschafft](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes). Wenn eine alte Einstellung noch vorhanden ist, sichern Sie zuerst Eigentümer und Berechtigungen der Originaldatei, korrigieren Sie sie anschließend und prüfen Sie sie mit `sudo sssctl config-check`.

Achten Sie auch auf die Startmethode. Ein Responder, der vom Monitor des SSSD-Hauptprozesses gestartet wird, kann mit demselben Responder konkurrieren, wenn dieser über einen systemd-Socket gestartet wird. Responder sind Prozesse, die unter anderem Benutzerinformationen abfragen und Authentifizierung durchführen. Vergleichen Sie die [Konfigurationsspezifikation der installierten Version](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html) mit den Protokollen und passen Sie nur die betroffenen Komponenten an.

Prüfen Sie nach der Korrektur den Abruf von Benutzerinformationen, die erforderlichen Authentifizierungsvorgänge und den Online-Status der Domäne. Bei einer AD-Anbindung gehört auch `adcli testjoin` mit dem vorhandenen Maschinenschlüssel zu den Prüfpunkten. Bevor Sie einen Schlüssel neu ausstellen oder der Domäne erneut beitreten, grenzen Sie Probleme mit der Konfiguration und der Startmethode ein.

### Wenn ein Update unterbrochen wurde und Pakete oder Startdateien unvollständig sind

Prüfen Sie zunächst mit `sudo dpkg --audit` und `sudo apt-get check` nicht konfigurierte Pakete und Abhängigkeiten. Wenn ein anderer APT- oder dpkg-Vorgang läuft, starten Sie keinen weiteren. Löschen Sie auch nicht die Sperrdatei, um den Vorgang zu erzwingen.

Wenn Sie bestätigt haben, dass der Vorgang beendet ist und die Konfiguration nicht fertiggestellter Pakete fortgesetzt werden muss, setzen Sie sie mit `sudo dpkg --configure -a` fort. Prüfen Sie das Ergebnis, bevor Sie weitermachen. Beheben Sie Probleme mit Paketquellen oder Abhängigkeiten zuerst.

Auch wenn ein neuer Kernel installiert wurde, kann das System nicht normal starten, wenn das erforderliche initrd fehlt. Prüfen Sie den verfügbaren Speicherplatz unter `/boot`, die installierten Kernel und die zugehörigen Startdateien. `update-initramfs -c -k 対象バージョン` erstellt ein initrd neu, während `-u` ein vorhandenes aktualisiert; die Optionen haben unterschiedliche Anwendungsfälle. [Spezifikation von update-initramfs](https://manpages.ubuntu.com/manpages/resolute/man8/update-initramfs.8.html)

Wählen Sie den zu reparierenden Kernel aus der Liste der installierten Versionen aus. `uname -r` zeigt den aktuell laufenden Kernel an und kann daher auf eine ältere Version vor dem Update verweisen.

Wenn ein normaler Start nicht möglich ist und Sie eine temporäre Root-Wiederherstellungsshell verwenden, klären Sie die nötige Genehmigung durch Administratoren und den vorgesehenen Ablauf, da diese Maßnahme die Authentifizierung umgeht. Prüfen Sie zunächst nur lesend und nehmen Sie nur notwendige Änderungen vor. Setzen Sie temporäre Startparameter oder eine Unterdrückung des Dienststarts zurück und prüfen Sie abschließend mit einem normalen systemd-Start. Dass sich ein Dienst in der Wiederherstellungsshell starten ließ, bestätigt nicht seinen automatischen Start.

## 9. Abschlusskriterien nach dem Neustart abgleichen

Wenn das Update abgeschlossen ist, vergewissern Sie sich, dass die Paketkonfiguration vollständig ist, und führen Sie dann einen normalen Neustart durch. Vergleichen Sie danach den Zustand mit den Aufzeichnungen vor dem Update und prüfen Sie die folgenden Punkte.

| Abschlusskriterium                                   | Zu prüfende Nachweise                                                                                   |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Normaler Start war möglich                           | Boot-ID hat sich geändert; System befindet sich nicht mehr in Wiederherstellungsshell oder Notfallmodus |
| Vorgesehene Betriebssystem- und Kernelversion läuft  | `/etc/os-release` und `uname -r`; nicht allein anhand der Liste installierter Versionen entscheiden     |
| Pakete sind konsistent                               | Ergebnisse von `dpkg --audit` und `apt-get check`                                                       |
| Erforderliche Dienste sind automatisch zurückgekehrt | Dienste, Sockets und Container sowie fehlgeschlagene Units und externe Antworten                        |
| Verbindungen und Authentifizierung funktionieren     | SSH, VPN und erforderliche Authentifizierungswege von einem anderen Host aus                            |
| Temporäre Änderungen wurden bereinigt                | Annahme neuer Anfragen, Firewall, Timer, Hold-Markierungen, Units und Konfigurations-Diffs              |
| Zustand nach dem Update lässt sich wiederherstellen  | Tatsächliche Wiederherstellung einer neuen Sicherungsgeneration und Prüfprotokoll                       |

Führen Sie Funktionsprüfungen nicht nur vom aktualisierten Host aus durch, sondern auch von einem anderen Host, der dem tatsächlichen Zugangsweg möglichst nahekommt. Bei einer API prüfen Sie neben einer erfolgreichen gültigen Anfrage auch, dass Anfragen ohne Authentifizierung auf den authentifizierungspflichtigen Wegen wie vorgesehen abgewiesen werden. Ein HTTP-200-Status allein bestätigt weder die Authentifizierungsgrenze noch die wichtigsten Funktionen der Anwendung.

Prüfen Sie nach der Wiederfreigabe der Annahme, dass keine temporäre Wartungs-Unit und keine temporäre Regel zurückgeblieben ist. Sichern Sie bei Systemen mit aktivem Backup den fertiggestellten Zustand erneut und stellen Sie diese **neue Sicherungsgeneration** zur Prüfung wieder her. Verwenden Sie eine erfolgreiche Wiederherstellung vor dem Update nicht als Nachweis für das Backup nach dem Update. Wenn ein Backup absichtlich angehalten war, belassen Sie es im ursprünglichen angehaltenen Zustand.

Halten Sie im abschließenden Arbeitsprotokoll fest, was geändert wurde, welche Rückgabewerte die Befehle lieferten, welche zusätzlichen Schritte zur Wiederherstellung nötig waren, was geprüft werden konnte und welche Zurückstellungen bestehen bleiben. Wenn Sie keine Anmeldung eines tatsächlichen Nutzers oder keine wichtige Benutzeraktion getestet haben, führen Sie diesen Punkt als ungeprüft auf. Dokumentieren Sie außerdem getrennt, ob sich nur Teile des Backups extrahieren ließen oder ob der gesamte Dienst in einer anderen Umgebung wiederhergestellt werden konnte.

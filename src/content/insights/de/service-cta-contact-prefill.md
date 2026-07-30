---
title: "Technisches Design zur Übergabe des Kontexts eines Service-CTA an das Kontaktformular"
description: "Implementierungsdesign, das den auf einer Serviceseite gelesenen Kontext an das Kontaktformular übergibt. Behandelt werden Mini-CTAs in Astro, der URL-Parameter-Vertrag, die anfängliche Kategorieauswahl, Subject-Prefill, mehrsprachige URLs, GA-Messung und Prüfung des generierten HTML."
date: 2026-06-07T13:00
author: gui
tags: ["Technologie", "Website", "Services", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Kernaussage dieses Artikels
  text: Ein CTA auf einer Serviceseite ist ein schwacher Weg, wenn er lediglich zum Formular führt. Wird der gelesene Servicekontext über die URL übergeben und werden Kategorie und Betreff im Formular initialisiert, sinken gleichzeitig die Unsicherheit bei der Eingabe und der Sortieraufwand beim empfangenden Team.
processFigure:
  title: Ablauf zur Übergabe des Kontexts vom Service-CTA an das Formular
  steps:
    - title: Service
      description: Dem CTA jedes Serviceabschnitts einen service key geben.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Über einen URL-Vertrag wie /contact/?category=service&service=web#contact-form übergeben.
      icon: i-lucide-link
      accent: amber
    - title: Form
      description: Passende Anfragekategorie und passenden Betreff im Formular initialisieren.
      icon: i-lucide-file-input
      accent: emerald
    - title: Ops
      description: Das empfangende Team erkennt den Servicekontext allein an der Anfragekategorie.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Unterschied bei der Verbindung von CTA und Formular
  before:
    label: Nur zum Formular weiterleiten
    items:
      - Der Nutzer muss denselben Servicenamen erneut auswählen
      - Der Betreff bleibt leer und der Inhalt der Anfrage ist schwer erkennbar
      - Das empfangende Team muss die Nachricht lesen, um den Service zu bestimmen
      - Die Wirkung einzelner Service-CTAs bleibt schwer messbar
  after:
    label: Kontext weitergeben
    items:
      - Die Anfragekategorie kann über den service key des CTA vorausgewählt werden
      - Der Servicename kann den Betreff füllen und die Anfrage strukturieren
      - Das empfangende Team kann anhand der Kategorie klassifizieren
      - GA label und URL-Parameter erleichtern die Auswertung pro CTA
checklist:
  title: Designprüfung bei der Einführung
  items:
    - text: In URL-Parametern nur kurze, stabile service keys verwenden
    - text: Als Formularwerte betrieblich stabile Werte statt sichtbarer Nutzertexte verwenden
    - text: Bei unbekanntem service key auf allgemeine Serviceanfragen zurückfallen
    - text: Den Betreff nur dann vorausfüllen, wenn er leer ist
    - text: Vor zusätzlichen hidden-Feldern prüfen, ob die bestehende Kategorie zur Klassifizierung reicht
    - text: Die Kontakt-URL für jede locale serverseitig erzeugen
    - text: Dem CTA GA label und location für die Wirkungsmessung geben
    - text: Nach dem build Anzahl der CTA und option sowie Vorhandensein oder Fehlen von hidden-Feldern im HTML prüfen
linkCards:
  - href: /services/
    title: Services
    description: Einstieg in den Weg mit servicespezifischen CTAs.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Kontakt
    description: Formular, das URL-Parameter empfängt und Kategorie sowie Betreff initialisiert.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Technisches Design des Anfrage-KI-Chats
    description: Verwandter Artikel über einen dialogbasierten Weg zur Einordnung des Anliegens.
    icon: i-lucide-sparkles
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Warum wird der Zielservice nicht in einem hidden-Feld gesendet?
      answer: So steigt die Zahl der vom empfangenden Team zu prüfenden Felder nicht, und die vorhandene Anfragekategorie genügt zur Klassifizierung. Jedes zusätzliche Formularfeld erzeugt weitere Prüfungen in Betrieb und Benachrichtigungsvorlagen.
    - question: Ist eine Manipulation der URL-Parameter unproblematisch?
      answer: Ein unbekannter service key fällt auf allgemeine Serviceanfragen zurück. Der gesendete Wert wird aus den option des Formulars gewählt; der URL-Wert selbst wird daher nicht direkt gesendet.
    - question: Wie funktioniert das auf einer mehrsprachigen Website?
      answer: CTA-Ziele werden pro locale erzeugt und sichtbare Formularlabels übersetzt. Stabile japanische Klassifikationswerte als gesendete Werte halten den Empfangsbetrieb konsistent.
---

Wenn ein Besucher auf einer Serviceseite denkt „dazu möchte ich eine Anfrage stellen“, geht ein Teil des Kontexts verloren, wenn er lediglich zum Kontaktformular weitergeleitet wird.

Er muss den Servicetyp erneut auswählen und den Betreff schreiben. Auch das empfangende Team kann vor dem Lesen der Nachricht kaum erkennen, ob es um Webproduktion, Serverbetrieb oder Aceserver geht.

Auf der Acecore-Website haben wir diesen Weg mit dem [PR zur Übergabe des Serviceziels an das Kontaktformular](https://github.com/acecore-systems/acecore-net/pull/100) verbessert. Dieser Artikel beschreibt die Lösung sowohl als Astro-Implementierung als auch als wiederverwendbares Journey-Design.

## Das Ziel ist nicht nur weniger Formulareingabe

Der Zweck besteht nicht einfach darin, Felder automatisch auszufüllen und das Formular leichter wirken zu lassen.

Entscheidend ist, den auf der Serviceseite entstandenen Kontext korrekt an Formular und Empfangsbetrieb weiterzugeben.

| Perspektive        | Gewünschte Verbesserung                                  |
| ------------------ | -------------------------------------------------------- |
| Nutzer             | Den gelesenen Service nicht erneut auswählen müssen      |
| Formular           | Kategorie und Betreff passend zur Anfrage initialisieren |
| Empfang            | Das Ziel allein anhand der Kategorie klassifizieren      |
| Messung            | Erkennen, von welchem Service-CTA die Anfrage begann     |
| Mehrsprachiger Weg | Zur Kontakt-URL der passenden locale führen              |

Optisch handelt es sich nur um einen kleinen CTA, doch das Design umfasst CTA, URL, Formular, Übersetzung, Messung und Empfangsbetrieb.

## Verantwortlichkeiten in eine CTA-Komponente auslagern

Am Ende jedes Serviceabschnitts steht ein CTA „Zu diesem Service beraten lassen“.

Die gleiche Linkerzeugung und dieselben GA-Attribute sollten nicht in jedem Abschnitt direkt wiederholt werden. Bei sieben Services erscheint dieselbe Logik siebenmal und kann beim Ändern von Text oder URL-Spezifikation teilweise vergessen werden.

Deshalb bündelt `ServiceSectionActions` den Kontakt-CTA.

```astro
---
import Icon from "./Icon.astro";
import { t, getLocalizedUrl, type Locale } from "../i18n";

interface Props {
  locale: Locale;
  gaLabel: string;
  gaLocation: string;
  serviceKey: string;
}

const { locale, gaLabel, gaLocation, serviceKey } = Astro.props;
const u = (path: string) => getLocalizedUrl(path, locale);
const contactUrl = `${u("/contact/")}?category=service&service=${encodeURIComponent(serviceKey)}#contact-form`;
---

<a
  href={contactUrl}
  class="ac-btn-outline gap-2 text-sm sm:w-auto"
  data-ga-event="cta_click"
  data-ga-label={gaLabel}
  data-ga-location={gaLocation}
  data-ga-destination={contactUrl}
>
  <Icon name="message-circle" class="text-sm" />
  {t(locale, "pages.services.miniCta")}
</a>
```

Die Komponente hat drei Aufgaben:

- Eine zur locale passende Kontakt-URL erzeugen
- Den service key in einen URL-Parameter setzen
- label und location für die GA-Messung tragen

Ein CTA ist Aktions- und Messpunkt, nicht nur UI. `data-ga-label` und `data-ga-location` bleiben erhalten, damit später sichtbar ist, von welchem Service die Anfrage ausging.

## URL-Parameter als Vertrag mit dem Formular

Die Werte werden über URL-Parameter übergeben.

```txt
/contact/?category=service&service=web#contact-form
```

Wichtig ist, keinen sichtbaren Anzeigetext in die URL zu setzen.

Ein Label wie `Webサイト制作・運用について` wird von Übersetzung, Schreibvarianten und künftigen Namensänderungen beeinflusst. In die URL gehört nur ein kurzer service key wie `web` oder `server`.

| Parameter  | Rolle                                                         |
| ---------- | ------------------------------------------------------------- |
| `category` | Kennzeichnet den Einstieg zur Verarbeitung als Serviceanfrage |
| `service`  | Stabiler key für den Zielservice                              |
| hash       | Dient zum Scrollen zum Formular                               |

URL-Parameter können vom Nutzer bearbeitet werden. Das Formular übernimmt den URL-Wert deshalb nicht direkt, sondern ordnet ihn einem vorhandenen option zu.

## Klassifikationstabelle im Formular

Das Kontaktformular führt die Servicekategorien in einem Array.

```ts
const serviceCategoryOptions = [
  {
    key: "server",
    value: "サーバー構築・運用について",
    label: t(locale, "pages.contact.formCategoryServiceServer"),
    subject: t(locale, "pages.services.server.title"),
  },
  {
    key: "web",
    value: "Webサイト制作・運用について",
    label: t(locale, "pages.contact.formCategoryServiceWeb"),
    subject: t(locale, "pages.services.web.title"),
  },
];
```

`key`, `value`, `label` und `subject` haben unterschiedliche Rollen.

| Feld      | Rolle                                                 |
| --------- | ----------------------------------------------------- |
| `key`     | Stabiler Bezeichner zum Finden über den URL-Parameter |
| `value`   | Anfragekategorie, die beim Senden beim Team ankommt   |
| `label`   | Übersetzter option, der auf dem Bildschirm erscheint  |
| `subject` | Servicename zur Initialisierung des Betreffs          |

Auf einer mehrsprachigen Website wird `label` für die locale übersetzt. `value` dient der Klassifikation im Empfang und bleibt daher ein stabiler japanischer Wert.

Die Entscheidung hängt vom Produkt ab. Unterstützt das CRM mehrsprachige Klassifikationen, kann value ebenfalls nach locale variieren. Für einen einfachen Empfangsbetrieb ist die Trennung von sichtbarem Label und gesendetem Wert leichter zu verwalten.

## Data-Attribute an option setzen

Der select gibt pro Service einen option aus.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {
    serviceCategoryOptions.map((option) => (
      <option
        value={option.value}
        data-service-key={option.key}
        data-service-subject={option.subject}
      >
        {option.label}
      </option>
    ))
  }
</select>
```

`data-service-key` wird mit `service` in der URL verglichen. `data-service-subject` dient zur Erstellung des Betreffs.

Auch hier wird der URL-Wert nicht direkt in `category.value` eingesetzt. Die Auswahl eines vorhandenen option verhindert, dass unbekannte service keys oder ungültige Werte in die gesendeten Daten gelangen.

## Prefill im Client

Ein kleines Skript initialisiert das Formular nach dem Laden.

```js
function initContactServicePrefill() {
  const form = document.getElementById("contact-form");
  if (!form || form.dataset.servicePrefillInitialized === "true") return;

  form.dataset.servicePrefillInitialized = "true";

  const url = new URL(window.location.href);
  const requestedCategory = url.searchParams.get("category");
  const requestedService = url.searchParams.get("service") || "";
  const category = document.getElementById("category");
  const subject = document.getElementById("subject");

  if (
    requestedCategory === "service" &&
    category instanceof HTMLSelectElement
  ) {
    const serviceOption = Array.from(category.options).find((option) => {
      return option.dataset.serviceKey === requestedService;
    });

    category.value = serviceOption?.value || "サービス全般について";
    category.dispatchEvent(new Event("input", { bubbles: true }));
    category.dispatchEvent(new Event("change", { bubbles: true }));

    if (
      serviceOption &&
      subject instanceof HTMLInputElement &&
      !subject.value.trim()
    ) {
      const template = form.dataset.serviceSubjectTemplate || "{service}";
      const serviceName =
        serviceOption.dataset.serviceSubject ||
        serviceOption.textContent?.trim() ||
        "";
      subject.value = template.replace("{service}", serviceName);
    }
  }
}
```

Vier Punkte sind wichtig:

- `data-service-prefill-initialized` prüfen, um doppelte Initialisierung zu vermeiden
- Nur bei `category=service` verarbeiten
- Bei unbekanntem service key auf `サービス全般について` zurückfallen
- Den Betreff nur initialisieren, wenn er leer ist

Der letzte Punkt ist entscheidend. Hat eine Zurück-Navigation oder Browser-Autovervollständigung den Betreff erhalten, verschlechtert ein Überschreiben die Erfahrung.

Bei Astro View Transitions oder Clientnavigation wird zusätzlich bei `astro:page-load` initialisiert.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Mit dem hash zum Formular springen

Die CTA-URL enthält `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Da eine Kontaktseite auch FAQ, LINE, Erklärungen und andere Kontaktwege enthalten kann, ist der direkte Sprung zum Formular für Besucher eines Service-CTA natürlicher.

Bei der Formularinitialisierung muss der Scrollzeitpunkt beachtet werden. `requestAnimationFrame` sorgt dafür, dass erst nach dem Rendern gescrollt wird.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Es ist nur ein kleines Verhalten, doch wenn CTA-Absicht und sichtbare Formularposition auseinanderliegen, entsteht Unsicherheit. URL, Vorauswahl und Scrollposition werden gemeinsam gestaltet.

## Warum kein weiteres hidden-Feld

Wir haben kein hidden-Feld `相談対象サービス` hinzugefügt.

Der Zielservice sollte allein über die Anfragekategorie erkennbar sein.

Zusätzliche Felder erzeugen zusätzliche Prüfungen:

- Soll es in der Benachrichtigungs-E-Mail erscheinen?
- Braucht die Verwaltungsoberfläche oder Tabelle eine weitere Spalte?
- Beeinflusst es bestehende Auto-Reply-Vorlagen?
- Wird es in CRM oder Webhook verarbeitet?
- Wie werden mehrsprachige Anzeigenamen und Empfangswerte getrennt?

Können vorhandene Felder die Information ausdrücken, bleibt der Betrieb stabiler, wenn kein neues hinzukommt. `お問い合わせ種別` wird in allgemeine und servicespezifische Kategorien geteilt.

Ein hidden-Feld kann sinnvoll sein, wenn mehrere Services gewählt, eine Kampagnen-ID gespeichert oder ein eigenes CRM-Feld verwendet werden soll.

## Ansatz für mehrsprachige Websites

Die Trennung von drei Werten verhindert Verwirrung.

| Typ              | Beispiel                      | Von locale abhängig |
| ---------------- | ----------------------------- | ------------------- |
| URL key          | `web`, `server`, `aceserver`  | Nein                |
| Sichtbares Label | `About Website Design` usw.   | Ja                  |
| Gesendeter Wert  | `Webサイト制作・運用について` | Je nach Betrieb     |

Der URL key wird besser nicht übersetzt, weil er beim Teilen, Messen und Abgleichen im Formular verwendet wird.

Das sichtbare Label wird immer übersetzt, da der Nutzer es im Formular liest.

Der gesendete Wert richtet sich nach dem Betrieb. Hier nutzen wir stabile japanische Werte. Mehrsprachige Anzeige und interne Verarbeitung nach dem Senden getrennt zu gestalten erleichtert die Verwaltung.

Der Übersetzungsfluss wird auch in [Mehrsprachige Blogs mit Sveltia CMS betreiben](/blog/copilot-translation-pipeline/) beschrieben.

## Generiertes HTML prüfen

Nur die Komponente zu betrachten reicht nicht. Nach dem build muss geprüft werden, ob Links und option tatsächlich ausgegeben wurden.

Wir prüften:

- Sieben servicespezifische CTA in `/services/`
- Jeder CTA enthält `?category=service&service=...#contact-form`
- Sieben option mit `data-service-key` in `/contact/`
- `サービス全般について` und servicespezifische Kategorien sind vorhanden
- Kein hidden-Feld `相談対象サービス` ist vorhanden

Zum Beispiel lässt sich `rg` verwenden.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

Die letzte Prüfung bestätigt die Abwesenheit dessen, was nicht hinzugefügt werden sollte. Bei Formularänderungen werden sowohl Ergänzungen als auch bewusst ausgelassene Elemente geprüft.

## Rollenverteilung mit dem KI-Chat

Der Weg passt zum [technischen Design des Anfrage-KI-Chats](/blog/astro-ai-contact-chat/), doch die Rollen unterscheiden sich.

| Weg         | Stärke                                                      |
| ----------- | ----------------------------------------------------------- |
| KI-Chat     | Im Dialog klären, welcher Service passt                     |
| Service-CTA | Den Kontext des gelesenen Service an das Formular übergeben |
| Formular    | Die offizielle Anfrage empfangen und dokumentieren          |

Der KI-Chat hilft, solange der Nutzer noch unsicher ist. Hat er die Serviceseite gelesen und sich entschieden, ist die direkte Weiterleitung ohne zusätzlichen Dialog natürlicher.

Mehr Wege sollten nicht alle dieselbe Rolle erhalten. Dialog, CTA und Formular werden je nach Zustand des Nutzers eingesetzt.

## Zusammenfassung

Die Kontextübergabe von der Serviceseite zum Formular wirkt stärker, als die kleine sichtbare Änderung vermuten lässt.

Wichtige Punkte waren:

- CTA als Komponente ausführen und URL-Erzeugung sowie Messattribute bündeln
- Stabilen service key statt Anzeigetext in der URL verwenden
- service key im Formular einem option zuordnen
- Gesendeten Wert, Label und Servicenamen für den Betreff trennen
- Bei unbekanntem service key auf allgemeine Anfragen zurückfallen
- Betreff nur vorausfüllen, wenn er leer ist
- Ohne weiteres hidden-Feld über die Kategorie klassifizieren
- Nach dem build Link- und option-Anzahl sowie das Fehlen unnötiger Felder prüfen

Formularverbesserung bedeutet nicht nur weniger Eingabefelder. Wird der gelesene Kontext bis zum empfangenden Team übertragen, wird die tatsächliche Bearbeitung einfacher.

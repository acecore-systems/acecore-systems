---
title: "Technische Konzeption zur Übergabe des Kontexts von Service-CTAs an das Kontaktformular"
description: "Implementierungskonzept zur Übernahme des Kontexts, den Nutzer auf einer Serviceseite gelesen haben, in das Kontaktformular. Von Mini-CTAs und dem URL-Parameter-Vertrag auf Astro-Websites über die Vorauswahl der Anfragekategorie, die Vorbefüllung des Betreffs, mehrsprachige URLs und GA-Tracking bis zur Prüfung des generierten HTML – klar strukturiert und auch auf anderen Websites einsetzbar."
date: 2026-06-07T13:00
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
tags: ["Technik", "Websites", "Dienstleistungen", "Astro", "CMS"]
image: https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop&q=80
callout:
  type: info
  title: Das Wichtigste auf einen Blick
  text: Ein CTA auf einer Serviceseite ist als Handlungsweg wenig hilfreich, wenn er Nutzer nur zum Formular weiterleitet. Wird der Kontext des gelesenen Services per URL übermittelt und werden im Formular Anfragekategorie und Betreff vorausgefüllt, sinken zugleich die Unsicherheit beim Ausfüllen und der Aufwand für die Zuordnung auf der Empfängerseite.
processFigure:
  title: Ablauf der Kontextübergabe vom Service-CTA an das Formular
  steps:
    - title: Dienstleistung
      description: Jeder CTA in einem Serviceabschnitt erhält einen Service-Key.
      icon: i-lucide-panels-top-left
      accent: brand
    - title: URL
      description: Die Übergabe erfolgt über einen URL-Vertrag wie /contact/?category=service&service=web#contact-form.
      icon: i-lucide-link
      accent: amber
    - title: Formular
      description: Das Formular wählt die passende Anfragekategorie voraus und trägt einen Betreff ein.
      icon: i-lucide-file-input
      accent: emerald
    - title: Betrieb
      description: Die Empfängerseite erkennt den Servicekontext allein anhand der Anfragekategorie.
      icon: i-lucide-inbox
      accent: slate
compareTable:
  title: Was sich ändert, wenn CTA und Formular verbunden werden
  before:
    label: Bei einer einfachen Weiterleitung zum Formular
    items:
      - Der Nutzer wählt im Formular denselben Service erneut aus
      - Der Betreff bleibt leer, sodass der Anlass der Anfrage schwer erkennbar ist
      - Die Empfängerseite kann den betreffenden Service erst schwer erkennen, wenn sie den Nachrichtentext liest
      - Die Wirkung von Service-CTAs lässt sich nur ungenau messen
  after:
    label: Bei der Übernahme des Kontexts
    items:
      - Die Anfragekategorie kann anhand des Service-Keys im CTA vorausgewählt werden
      - Der Service-Name im Betreff hilft, den Anfrageinhalt einzuordnen
      - Die Empfängerseite kann anhand der Anfragekategorie klassifizieren
      - Mit GA-Label und URL-Parametern lässt sich der Erfolg je CTA leicht nachvollziehen
checklist:
  title: Prüfliste für die Einführung
  items:
    - text: URL-Parameter auf kurze, stabile Service-Keys beschränken
    - text: Für den Empfangswert im Formular keinen Anzeigetext für Nutzer, sondern einen im Betrieb stabilen Wert verwenden
    - text: Unbekannte Service-Keys auf allgemeine Serviceanfragen zurückfallen lassen
    - text: Den Betreff nur vorausfüllen, wenn er leer ist
    - text: Vor dem Hinzufügen weiterer Hidden-Felder prüfen, ob sich die Anfrage bereits über die bestehende Anfragekategorie klassifizieren lässt
    - text: Anfrage-URLs je Locale serverseitig generieren
    - text: CTAs mit GA-Label und Position versehen, damit sich ihre Wirkung messen lässt
    - text: Im generierten HTML nach dem Build die Anzahl der CTAs und Optionen sowie das Vorhandensein von Hidden-Feldern prüfen
linkCards:
  - href: /services/
    title: Dienstleistungen
    description: Einstieg in die Nutzerführung mit CTAs für einzelne Services.
    icon: i-lucide-panels-top-left
  - href: /contact/
    title: Kontakt
    description: Ein Formular, das URL-Parameter entgegennimmt und Anfragekategorie und Betreff vorausfüllt.
    icon: i-lucide-message-square
  - href: /blog/astro-ai-contact-chat/
    title: Technische Konzeption eines KI-Chats für Anfragen
    description: Ein verwandter Artikel über eine Nutzerführung, die im Gespräch das passende Angebot ermittelt.
    icon: i-lucide-sparkles
faq:
  title: Häufig gestellte Fragen
  items:
    - question: Warum wird der angefragte Service nicht über ein Hidden-Feld übermittelt?
      answer: "Zum damaligen Stand (2026-6) wurden Anfragen nur anhand der bestehenden Anfragekategorie klassifiziert; deshalb wurde kein zusätzliches Hidden-Feld hinzugefügt. Das aktuelle Formular von Acecore Systems speichert service, from und entry als zusätzliche Hidden-Felder zur Weiterverarbeitung, getrennt vom Klassifizierungswert."
    - question: Sind manipulierbare URL-Parameter ein Problem?
      answer: Unbekannte Service-Keys fallen auf allgemeine Serviceanfragen zurück. Da der übermittelte Wert aus den Formularoptionen ausgewählt wird, wird der URL-Wert nicht direkt als Empfangswert verwendet.
    - question: Wie funktioniert das auf mehrsprachigen Websites?
      answer: CTA-Ziele werden je Locale generiert und die sichtbaren Formularbezeichnungen übersetzt. Die Empfangswerte werden dagegen auf stabile japanische Kategorienamen ausgerichtet, damit die Abläufe auf der Empfängerseite konsistent bleiben.
---

> **Nachtrag (2026-9):** Die folgenden Beispiele für `ServiceSectionActions` und `service=web` dokumentieren die Implementierung, die im Zeitraum 2026-6 auf der offiziellen Acecore-Website verwendet wurde. Im aktuellen Acecore Systems enthalten die [CTAs auf den Servicedetailseiten](https://github.com/acecore-systems/acecore-systems/blob/main/src/components/ServiceDetailPage.astro) die Werte `category`, `service`, `from` und `entry`; das [Kontaktformular](https://github.com/acecore-systems/acecore-systems/blob/main/src/pages/contact.astro) prüft den kurzen Service-Key und initialisiert Anfragekategorie und Betreff. Da aktuell auch Hidden-Felder für Tracking und Integrationen verwendet werden, sollte die folgende Konzeption, auf Hidden-Felder zu verzichten, nicht als aktuelle Spezifikation übernommen werden. Der Grundsatz bleibt jedoch gültig, URL-Werten nicht zu vertrauen, sondern sie den Optionen im Formular zuzuordnen.

Wenn Nutzer nach dem Lesen einer Serviceseite denken: „Zu diesem Thema möchte ich beraten werden“, geht etwas Kontext verloren, wenn sie einfach nur zum Kontaktformular weitergeleitet werden.

Im Formular müssen sie den Service erneut auswählen und den Betreff selbst schreiben. Auch die Empfängerseite kann schwer erkennen, ob es um Webentwicklung, Serverbetrieb oder Aceserver geht, bevor sie den Nachrichtentext gelesen hat.

Auf der Acecore-Website haben wir diese Nutzerführung mit der [PR zur Übernahme des angefragten Services vom Service-CTA ins Kontaktformular](https://github.com/acecore-systems/acecore-net/pull/100) verbessert. Dieser Artikel dokumentiert nicht nur die Implementierung mit Astro, sondern ordnet sie auch als ein Konzept für Nutzerführungen ein, das sich auf anderen Websites einsetzen lässt.

## Die Formularinitialisierung anhand eines einzelnen CTA prüfen

Testen Sie einen gültigen Service-Key, einen unbekannten Key und die Rückkehr mit bereits ausgefülltem Betreff. Prüfen Sie, ob die Anfragekategorie einer zugelassenen Option zugeordnet und der Betreff nicht überschrieben wird; verwenden Sie auch bei Locale-spezifischen URLs denselben Wertevertrag. Die URL enthält keine personenbezogenen Daten oder frei formulierten Inhalte, sondern nur eine kurze Kennung, die den Kontext der Anfrage übermittelt.

[MDN URLSearchParams: Spezifikation zum Lesen von URL-Parametern](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

## Ziel ist nicht, die Formulareingaben zu reduzieren

Das Ziel dieser Implementierung ist nicht nur, Formularfelder automatisch auszufüllen, damit die Bedienung einfacher wirkt.

Entscheidend ist vielmehr, den auf der Serviceseite entstandenen Kontext korrekt an das Kontaktformular und die Abläufe auf der Empfängerseite weiterzugeben.

| Aspekt                      | Gewünschte Verbesserung                                            |
| --------------------------- | ------------------------------------------------------------------ |
| Nutzer                      | Den gelesenen Service nicht noch einmal auswählen müssen           |
| Formular                    | Anfragekategorie und Betreff passend zum Anliegen vorausfüllen     |
| Empfängerseite              | Das Anliegen anhand der Anfragekategorie leichter einordnen        |
| Messung                     | Nachvollziehen, über welchen Service-CTA eine Anfrage begonnen hat |
| Mehrsprachige Nutzerführung | Zur passenden Anfrage-URL für die jeweilige Locale weiterleiten    |

Optisch ist es nur ein kleiner CTA. Doch bei der Konzeption geht es um CTA, URL, Formular, Übersetzung, Messung und die Abläufe auf der Empfängerseite.

## Zuständigkeiten in eine CTA-Komponente auslagern

Am Ende jedes Serviceabschnitts wird ein CTA mit der Aufschrift „Zu diesem Service beraten lassen“ platziert.

Zunächst sollte man vermeiden, die gleiche Linkgenerierung und dieselben GA-Attribute in jedem Abschnitt der Serviceseite fest einzutragen. Bei 7 Services erscheint dieselbe Schreibweise 7-mal. Änderungen an Text oder URL-Spezifikation werden dann leicht an einzelnen Stellen übersehen.

Deshalb haben wir `ServiceSectionActions` erstellt, um Kontakt-CTAs zusammenzufassen.

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

Diese Komponente hat 3 Aufgaben:

- Eine Anfrage-URL für die jeweilige Locale generieren
- Den Service-Key in die URL-Parameter einfügen
- Ein Label und eine Position für das GA-Tracking festlegen

Ein CTA ist ein Interaktionspunkt für Nutzer und zugleich ein Messpunkt. `data-ga-label` und `data-ga-location` bleiben erhalten, damit sich später nachvollziehen lässt, von welchem Service aus eine Anfrage begonnen wurde.

## URL-Parameter als Vertrag mit dem Formular festlegen

Die Werte, die vom CTA an das Kontaktformular übergeben werden, werden über URL-Parameter weitergegeben.

```txt
/contact/?category=service&service=web#contact-form
```

Wichtig ist, dass die Werte in der URL keine Anzeigetexte sind.

Anzeigetexte wie `Webサイト制作・運用について` können von Übersetzungen, abweichenden Schreibweisen und späteren Namensänderungen betroffen sein. In die URL kommen nur kurze Service-Keys wie `web` oder `server`.

| Parameter  | Funktion                                                     |
| ---------- | ------------------------------------------------------------ |
| `category` | Kennzeichnet den Einstieg zur Bearbeitung als Serviceanfrage |
| `service`  | Stabiler Key für den betreffenden Service                    |
| Hash       | Dient zum Scrollen zur Formularposition                      |

URL-Parameter können von Nutzern bearbeitet werden. Deshalb wird der URL-Wert im Formular nicht direkt als übermittelter Wert verwendet, sondern einer vorhandenen Option zugeordnet.

<figure class="article-diagram" data-layout="flow" data-tone="teal" data-count="3" aria-labelledby="diagram-service-cta-contact-prefill">
  <figcaption>
    <strong id="diagram-service-cta-contact-prefill">Ablauf der Übertragung einer eingegangenen Anfrage in den Verwaltungsdatensatz</strong>
    <span>Das Diagramm zeigt die Implementierungsphasen des Ablaufs. Die Kontaktaufnahme mit realen Kunden und der Abschluss der Bearbeitung müssen separat geprüft werden.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 5h16v14H4z M4 7l8 6 8-6"/>
        </svg>
      </span>
      <strong>Den CTA-Kontext auswerten</strong>
      <span>Einen stabilen Service-Key der mehrsprachigen Anzeige-URL und einer Positivliste zulässiger Formularoptionen zuordnen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M12 2l8 3v6c0 5-3 8-8 11-5-3-8-6-8-11V5z M8 12l3 3 5-6"/>
        </svg>
      </span>
      <strong>Eingaben und Berechtigungen prüfen</strong>
      <span>Den Betreff nur bei leerem Feld vorausfüllen und auch in der API die Identität des Nutzers sowie dessen Berechtigung für die Aktion prüfen.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M6 3h9l4 4v14H6z M15 3v5h4 M9 12h6 M9 16h6"/>
        </svg>
      </span>
      <strong>In den Verwaltungsdatensatz übertragen</strong>
      <span>Die Anfrage in der CRM-Historie und den nachfolgenden Aufgaben festhalten; den tatsächlichen Abschluss der Bearbeitung durch die zuständige Person als separaten Status dokumentieren.</span>
    </li>
  </ol>
</figure>

## Die Kategorisierungstabelle im Formular hinterlegen

Im Kontaktformular wird eine Zuordnungstabelle für die einzelnen Services als Array hinterlegt.

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

`key`, `value`, `label` und `subject` haben jeweils unterschiedliche Aufgaben.

| Feld      | Funktion                                                                          |
| --------- | --------------------------------------------------------------------------------- |
| `key`     | Stabiler Bezeichner, über den der Eintrag anhand des URL-Parameters gefunden wird |
| `value`   | Anfragekategorie, die beim Absenden des Formulars die Empfängerseite erreicht     |
| `label`   | Übersetzte Option, die auf der Benutzeroberfläche angezeigt wird                  |
| `subject` | Service-Name für die Vorbefüllung des Betreffs                                    |

Auf mehrsprachigen Websites wird `label` an die jeweilige Locale angepasst. `value` dient dagegen der Klassifizierung auf der Empfängerseite; deshalb haben wir dafür einen stabilen japanischen Wert verwendet.

Das hängt vom jeweiligen Produkt ab. Wenn CRM oder externe Formulare mehrsprachige Kategorien unterstützen, kann auch der Wert je Locale unterschiedlich sein. Soll wie in diesem Fall der Betrieb auf der Empfängerseite einfach bleiben, ist es übersichtlicher, Anzeigebezeichnung und Empfangswert getrennt zu behandeln.

## Datenattribute an den Optionen hinterlegen

Im Select-Feld des Formulars werden die Optionen für die einzelnen Services ausgegeben.

```astro
<select id="category" name="category" required>
  <option value="" disabled selected>
    {t(locale, "pages.contact.formCategoryPlaceholder")}
  </option>
  <option value="サービス全般について">
    {t(locale, "pages.contact.formCategoryService")}
  </option>
  {serviceCategoryOptions.map((option) => (
    <option
      value={option.value}
      data-service-key={option.key}
      data-service-subject={option.subject}
    >
      {option.label}
    </option>
  ))}
</select>
```

`data-service-key` wird verwendet, um den URL-Parameter `service` abzugleichen. `data-service-subject` dient zum Erstellen des Betreffs.

Wichtig ist auch hier, den URL-Wert nicht direkt in `category.value` einzusetzen. Die Auswahl erfolgt immer anhand einer Option im Select-Feld. So gelangen keine unbekannten Service-Keys oder ungültigen Werte in den Empfangswert.

## Werte clientseitig vorausfüllen

Die Formularinitialisierung erfolgt über ein kleines Skript nach dem Laden der Seite.

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

Bei der Implementierung sind 4 Punkte wichtig:

- Zum Vermeiden einer doppelten Initialisierung `data-service-prefill-initialized` prüfen
- Nur fortfahren, wenn `category=service` gilt
- Unbekannte Service-Keys auf „Allgemeine Serviceanfragen“ zurückfallen lassen
- Den Betreff nur vorausfüllen, wenn er leer ist

Der letzte Punkt – den Betreff nur bei einem leeren Feld vorauszufüllen – ist wichtig. Wenn ein Betreff durch die Zurück-Navigation oder die automatische Browservervollständigung bereits vorhanden ist, verschlechtert ein ungefragtes Überschreiben die Nutzererfahrung.

Bei Astro View Transitions oder Client-Navigation muss die Initialisierung nicht nur beim ersten Laden, sondern auch bei `astro:page-load` ausgeführt werden.

```js
document.addEventListener("astro:page-load", initContactServicePrefill);
initContactServicePrefill();
```

## Mit einem Hash zur Formularposition springen

Die CTA-URL enthält `#contact-form`.

```txt
/contact/?category=service&service=web#contact-form
```

Auf der Kontaktseite gibt es neben dem Formular auch FAQs, LINE, erklärende Texte und weitere Kontaktmöglichkeiten. Deshalb ist es für Nutzer, die über einen Service-CTA kommen, natürlicher, direkt zur Formularposition zu springen.

Wenn die Initialisierung im Formular erfolgt, muss allerdings der Zeitpunkt des Scrollens berücksichtigt werden. Da erst nach dem Rendern des Elements gescrollt werden soll, verwenden wir `requestAnimationFrame`.

```js
if (window.location.hash === "#contact-form") {
  window.requestAnimationFrame(() => {
    form.scrollIntoView({ block: "start" });
  });
}
```

Der Sprung zur Formularposition ist eine kleine Interaktion. Wenn aber die Absicht des CTA und die Position des Formulars nicht zusammenpassen, sind Nutzer leicht irritiert. Bei der Konzeption der Nutzerführung betrachten wir deshalb URL, Vorauswahl und Scrollposition gemeinsam.

## Bewusst auf zusätzliche Hidden-Felder verzichten

In dieser Implementierung haben wir kein Hidden-Feld `相談対象サービス` hinzugefügt.

Der Grund war, dass der betreffende Service anhand der Anfragekategorie allein erkennbar sein sollte.

Mit zusätzlichen Formularfeldern kommen auch weitere Fragen hinzu:

- Soll das Feld in der Benachrichtigungs-E-Mail erscheinen?
- Muss die Verwaltung oder Tabelle um eine Spalte erweitert werden?
- Wirkt sich das auf bestehende Vorlagen für automatische Antworten aus?
- Wird das Feld in CRM-Integrationen oder Webhooks verwendet?
- Wie werden mehrsprachige Anzeigebezeichnungen und Empfangswerte voneinander abgegrenzt?

Wenn sich die benötigten Informationen mit vorhandenen Feldern abbilden lassen, ist der Betrieb ohne zusätzliche Felder stabiler. In diesem Fall wurde `お問い合わせ種別` lediglich in „Allgemeine Serviceanfragen“ und servicespezifische Kategorien unterteilt, sodass die Empfängerseite die Anliegen einordnen kann.

Natürlich kann es sinnvoll sein, Hidden-Felder hinzuzufügen, wenn mehrere Services gleichzeitig ausgewählt werden sollen, eine Kampagnen-ID gespeichert werden muss oder CRM ein separates Feld benötigt.

## Überlegungen zu mehrsprachigen Websites

Bei der Umsetzung dieser Nutzerführung auf einer mehrsprachigen Website lassen sich Missverständnisse vermeiden, wenn man 3 Arten von Werten getrennt betrachtet.

| Art                | Beispiel                            | Locale-abhängig      |
| ------------------ | ----------------------------------- | -------------------- |
| URL-Key            | `web`, `server`, `aceserver`        | Nein                 |
| Anzeigebezeichnung | zum Beispiel `About Website Design` | Ja                   |
| Empfangswert       | `Webサイト制作・運用について`       | Abhängig vom Betrieb |

URL-Keys bleiben stabiler, wenn sie nicht übersetzt werden. So lassen sich Links teilen, auswerten und im Formular abgleichen.

Anzeigebezeichnungen müssen übersetzt werden, weil Nutzer diese Texte im Formular sehen.

Die Empfangswerte richten sich nach den Abläufen. In diesem Fall haben wir stabile japanische Werte verwendet. Wenn mehrsprachige Anzeige und interne Abläufe nach dem Empfang getrennt konzipiert werden, lässt sich das Formular leichter handhaben.

Den Übersetzungsablauf stellen wir auch unter [Mehrsprachige Blogs mit Sveltia CMS verwalten](/blog/copilot-translation-pipeline/) vor.

## Das generierte HTML überprüfen

Bei einer solchen Implementierung reicht es nicht, nur die Komponenten anzusehen. Im HTML nach dem Build muss geprüft werden, ob Links und Optionen tatsächlich ausgegeben werden.

Wir haben folgende Punkte geprüft:

- Auf `/services/` erscheinen 7 servicebezogene CTAs
- Jeder CTA enthält `?category=service&service=...#contact-form`
- In `/contact/` erscheinen `data-service-key`-markierte Optionen, und zwar 7
- „Allgemeine Serviceanfragen“ und die servicebezogenen Kategorien werden angezeigt
- Das Hidden-Feld `相談対象サービス` wird nicht ausgegeben

Das generierte HTML lässt sich zum Beispiel mit `rg` überprüfen.

```powershell
rg -n "category=service&service=.*#contact-form" dist\services\index.html
rg -n "data-service-key" dist\contact\index.html
rg -n "相談対象サービス" dist\contact\index.html
```

Die letzte Prüfung stellt sicher, dass nichts erscheint, was nicht erscheinen soll. Bei Formularänderungen wird also nicht nur geprüft, was hinzugefügt wurde, sondern auch, was bewusst nicht hinzugefügt wurde.

## Aufgabenverteilung zwischen KI-Chat und CTA

Diese Nutzerführung ergänzt das [technische Konzept eines KI-Chats für Anfragen](/blog/astro-ai-contact-chat/) gut. Die beiden Ansätze haben jedoch unterschiedliche Aufgaben.

| Nutzerführung | Besonders geeignet für                                                 |
| ------------- | ---------------------------------------------------------------------- |
| KI-Chat       | Im Gespräch klären, an welchen Service sich die Anfrage richten sollte |
| Service-CTA   | Den Kontext des gerade gelesenen Services an das Formular übergeben    |
| Formular      | Das konkrete Anliegen annehmen und dokumentieren                       |

Ein KI-Chat eignet sich besonders, wenn Nutzer noch unsicher sind. Wer dagegen eine Serviceseite zu Ende gelesen und sich entschieden hat, sich zu genau diesem Service beraten zu lassen, sollte ohne Umweg über ein Gespräch direkt zum Formular gelangen können.

Wichtig ist, nicht jeder Nutzerführung dieselbe Aufgabe zu geben. Je nach Situation des Nutzers kommen Gespräch, CTA oder Formular zum Einsatz.

## Zusammenfassung

Die Übernahme des Kontexts von der Serviceseite ins Kontaktformular bringt mehr, als es auf den ersten Blick scheint.

Wichtig an dieser Konzeption waren folgende Punkte:

- CTAs als Komponenten umsetzen und URL-Erstellung und Messattribute bündeln
- Einen stabilen Service-Key statt einer Anzeigebezeichnung in die URL schreiben
- Den Service-Key im Formular einer Option zuordnen
- Empfangswert, Anzeigebezeichnung und Service-Name für den Betreff voneinander trennen
- Unbekannte Service-Keys auf allgemeine Serviceanfragen zurückfallen lassen
- Den Betreff nur vorausfüllen, wenn er leer ist
- Anhand der Anfragekategorie klassifizieren, statt zusätzliche Hidden-Felder anzulegen
- Im generierten HTML nach dem Build Linkanzahl, Anzahl der Optionen und das Fehlen unnötiger Felder prüfen

Bei der Verbesserung eines Kontaktformulars geht es nicht nur darum, Eingabefelder zu reduzieren. Wenn der Kontext, den Nutzer gelesen haben, bis zur Empfängerseite erhalten bleibt, wird die tatsächliche Bearbeitung der Anfragen einfacher.

## Nachtrag (2026-10-6): Von der Anfrageannahme zum Verwaltungsdatensatz

Bei einer anonymisierten Anpassung der Integration haben wir den Eingang einer Anfrage, die Übernahme in CRM-Verlauf und -Aufgaben sowie den Abschluss der Bearbeitung durch die zuständige Person als getrennte Zustände behandelt. URL-Eingaben und Anfragewege werden validiert; die Werte des Anfragewegs werden auf ein stabiles Enum abgebildet. Allein die Kenntnis der URL der Verwaltungsoberfläche berechtigt nicht dazu, Verlaufsdaten oder Aufgaben zu ändern.

Auch die API prüft die Identität der Nutzer und ihre Aktionsberechtigungen. Kundendaten werden weder in öffentliche Suchfunktionen noch als Grundlage öffentlicher KI-Antworten eingespeist. Selbst wenn die Implementierung der Anfrageannahme und -erfassung abgeschlossen ist, behaupten wir nicht, den vollständigen Ablauf vom Kontakt mit realen Kunden bis zur Erledigung des Vorgangs durchgängig getestet zu haben.

Wir unterscheiden zwischen vorausgefüllten Formularwerten und Angaben, die Nutzer selbst eingegeben haben. Bei Anfragen mit gewünschtem Rückruf übernehmen wir den bevorzugten Kontaktweg als verpflichtende feste Auswahl in nachfolgende Aufgaben. Die Pflichtfeldregeln in Benutzeroberfläche und API sowie die Berechtigungen der Mitarbeitenden zum Anzeigen und Ergänzen werden aufeinander abgestimmt; nach DB-Änderungen prüfen wir Schema und Constraints. Notwendige Prüfungen in der Produktionsumgebung werden klar davon getrennt, eine vollständige Datenbank mit echten Kundendaten in eine Entwicklungsumgebung zu kopieren.

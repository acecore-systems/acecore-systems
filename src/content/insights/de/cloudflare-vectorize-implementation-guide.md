---
title: "Cloudflare Vectorize und RAG: Den Unterschied zwischen Suche und KI-Antworten verstehen"
description: "Eine kurze Einführung in die semantische Suche mit Cloudflare Vectorize und in RAG, die Suche, Belege und KI-Antworten voneinander abgrenzt."
date: 2026-07-31T12:00
author: gui
tags: ["Technologie", "Cloudflare", "Vectorize", "RAG", "Website-Suche"]
image: /uploads/acecore-generated/blog-cloudflare-pages-security.webp
callout:
  type: tip
  title: "RAG bedeutet: erst suchen, dann antworten"
  text: "Vectorize findet öffentliche Informationen mit ähnlicher Bedeutung. RAG nutzt ausgewählte Informationen als Belege, damit eine KI eine Antwort formuliert. Weder Vectorize allein noch ein allein antwortendes Modell ist RAG."
processFigure:
  eyebrow: RAG-Grundlagen
  title: "Vier Schritte von einer Frage zu einer belegten Antwort"
  description: "Ein Suchergebnis ist noch keine Antwort: Zuerst wird die ursprüngliche öffentliche Seite abgerufen und erst dann als Kontext verwendet."
  variant: inline
  steps:
    - title: Öffentliche Informationen vorbereiten
      description: "Nur Seiten aufnehmen, die Leser sehen dürfen."
      icon: i-lucide-file-check-2
      accent: slate
    - title: Nach Bedeutung suchen
      description: "Die Frage in ein embedding umwandeln und mit Vectorize nahe Informationen finden."
      icon: i-lucide-search
      accent: brand
    - title: Belege auswählen
      description: "Quellseite, URL und Aktualität prüfen, bevor Informationen für eine Antwort ausgewählt werden."
      icon: i-lucide-list-checks
      accent: amber
    - title: Antworten oder zurückstellen
      description: "Nur bei ausreichenden Belegen eine Antwort erzeugen, sonst erklären, dass dies nicht bestätigt werden kann."
      icon: i-lucide-message-square-text
      accent: emerald
linkCards:
  - href: /insights/cloudflare-vectorize-safe-implementation/
    title: Detaillierter Leitfaden für eine sichere Vectorize-Implementierung
    description: "Lesen Sie ihn für öffentliche HTML-Corpora, differenzielle Synchronisierung, Preview/Production-Trennung und API-Grenzen."
    icon: i-lucide-wrench
  - href: https://developers.cloudflare.com/vectorize/
    title: Offizielle Cloudflare-Vectorize-Dokumentation
    description: "Dort finden Sie die offiziellen Informationen zu Funktionen, embeddings und queries von Vectorize."
    icon: i-lucide-book-open
  - href: https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/
    title: Cloudflare-Leitfaden zu Vektordatenbanken und RAG
    description: "Erklärt, wie aus der Vektorsuche abgerufener Kontext einen LLM-prompt ergänzen kann."
    icon: i-lucide-network
---

## Zuerst: Was ist RAG?

RAG steht für **Retrieval Augmented Generation**. Einfach gesagt werden zuerst passende Informationen gesucht; anschließend erzeugt eine KI mit diesen Informationen eine Antwort.

Man kann Vectorize als Katalog eines Bibliothekars verstehen, der Materialien mit ähnlicher Bedeutung findet. RAG ist die gesamte Arbeit des Bibliothekars: Materialien finden, ausgewählte Quellen lesen und mit Angabe der Herkunft antworten.

Statt eine Frage direkt an ein KI-Modell zu senden, werden verwandte Materialien aus den eigenen öffentlichen Informationen abgerufen und als Kontext hinzugefügt. Cloudflare beschreibt RAG als die Nutzung von Kontext aus einer Vektorsuche zur Ergänzung des an ein LLM gesendeten prompts. [Cloudflare-Dokumentation](https://developers.cloudflare.com/vectorize/reference/what-is-a-vector-database/)

## Vectorize und RAG haben unterschiedliche Aufgaben

| Baustein  | Aufgabe                                          | Was er allein kann                                             |
| --------- | ------------------------------------------------ | -------------------------------------------------------------- |
| Pagefind  | Wörter auf Seiten finden                         | Produktnamen, Eigennamen und Fehlercodes schnell finden        |
| Vectorize | Informationen mit ähnlicher Bedeutung finden     | Kandidaten für Umschreibungen und verwandte Seiten zurückgeben |
| RAG       | Mit abgerufenen Belegen eine KI-Antwort erzeugen | Eine Antwort zusammen mit Links zu Quellseiten zurückgeben     |

Vectorize erzeugt keine Antwort. RAG ist mehr als Suche. Erst der Vertrag zwischen Abruf, Auswahl der Belege, Antworterzeugung und Quellenanzeige ermöglicht es Lesern, eine Antwort zu überprüfen.

## Wo anfangen?

Ein Chatbot muss nicht der erste Schritt sein. Diese Reihenfolge ist leichter zu verstehen und sicherer zu betreiben.

1. Pagefind als normale Suche beibehalten.
2. Vectorize zum Finden verwandter Seiten ergänzen und die Suchqualität bewerten.
3. Zulässige Quellen, Quellenlinks und das Verhalten bei unzureichenden Belegen festlegen.
4. RAG-Antworten nur ergänzen, wenn diese Bedingungen erfüllt werden können.

So wird die Qualität der durchsuchbaren Informationen geprüft, bevor das Erscheinungsbild von KI-Antworten optimiert wird.

## Vier Entscheidungen vor RAG

| Entscheidung         | Einfacher Einstieg                                                           | Warum                                                                        |
| -------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Umfang der Fragen    | Nur öffentliche Website-Informationen                                        | Verhindert, dass Entwürfe oder interne Informationen in einer Antwort landen |
| Anzeige der Belege   | Mit jeder Antwort auf die Originalseite verlinken                            | Leser können die Antwort überprüfen                                          |
| Unzureichende Belege | „Das kann ich nicht bestätigen“ sagen                                        | Vermeidet plausibel klingende Vermutungen                                    |
| Trennung der Suche   | Pagefind während der Eingabe; Vectorize/RAG nach einer ausdrücklichen Aktion | Macht Datenübertragung, Kosten und Wartezeit nachvollziehbar                 |

RAG macht falsche Antworten nicht unmöglich. Qualität entsteht durch die Auswahl des Corpus, die Prüfung der Belege und die klare Definition, wann nicht geantwortet wird.

## Implementierungsdetails getrennt lesen

Diese Seite erklärt, warum Vectorize und RAG eingesetzt werden. Öffentliche HTML-Corpora, content hash, differenzielle Synchronisierung, Preview/Production-Trennung und rate limits stehen im [ausführlichen Leitfaden für eine sichere Vectorize-Implementierung](/insights/cloudflare-vectorize-safe-implementation/).

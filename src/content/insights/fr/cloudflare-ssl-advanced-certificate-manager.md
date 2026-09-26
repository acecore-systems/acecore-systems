---
title: "Quelle était l’ancienne option SSL payante de Cloudflare ? De Dedicated SSL à Advanced Certificate Manager"
description: "L’ancienne option payante de Cloudflare, « Dedicated SSL Certificates », a été renommée et enrichie en 2021 sous le nom « Advanced Certificate Manager (ACM) ». Cet article explique les différences avec Universal SSL gratuit et les cas où ACM est nécessaire."
date: 2026-03-31T00:00
author: gui
tags: ["Technologie", "Cloudflare", "Sécurité", "Infrastructure"]
image: /uploads/acecore-generated/blog-cloudflare-ssl-advanced-certificate-manager.webp
lastUpdated: "2026-09-26T18:45:00+09:00"
---

Cloudflare a fait évoluer **Dedicated SSL Certificates** vers **Advanced Certificate Manager (ACM)** en 2021. Avant de choisir un certificat, vérifiez les noms d’hôte et le type de configuration DNS.

## Portée d’Universal SSL

Avec une **configuration DNS complète**, Universal SSL gratuit couvre normalement le domaine racine et les sous-domaines de premier niveau. `*.example.com` couvre `www.example.com`, mais pas `api.staging.example.com`. Avec une **configuration CNAME (partielle)**, Cloudflare émet un certificat Universal pour chaque nom d’hôte proxifié, quelle que soit sa profondeur. Un sous-domaine profond ne nécessite donc pas toujours ACM.

Cloudflare décrit aujourd’hui les certificats Universal comme gratuits et non partagés. L’ancienne affirmation selon laquelle ils sont partagés entre sites est dépassée.

## Quand envisager ACM

ACM est une option payante. Elle permet de choisir l’autorité de certification, la méthode de validation, la durée de validité et les noms couverts. Un certificat avancé accepte jusqu’à 50 noms d’hôte, domaine racine compris. Les durées possibles dépendent de l’autorité et de l’offre ; **un an est réservé aux clients Enterprise utilisant SSL.com**. Tous les forfaits ne permettent pas de choisir librement entre 14 et 365 jours.

Pour couvrir automatiquement des sous-domaines profonds proxifiés avec un DNS complet, envisagez **Total TLS**. Pour quelques noms précis, un certificat avancé ou personnalisé peut suffire. Total TLS exige un DNS complet et exclut les noms utilisés par certains produits, notamment Cloudflare Tunnel.

**Les certificats avancés ne s’appliquent pas aux domaines personnalisés de Cloudflare Pages ou R2.** Ces produits utilisent une autre voie de certification. Acheter ACM pour un site Pages n’applique pas ce certificat au nom d’hôte Pages.

## Avant l’achat

1. Listez les noms d’hôte et identifiez la configuration DNS complète ou CNAME.
2. Vérifiez la couverture réelle d’Universal SSL.
3. Confirmez l’autorité, la durée de validité et les conditions de Total TLS nécessaires.
4. Consultez le prix et les conditions actuels dans le tableau de bord Cloudflare de votre offre.

N’achetez pas uniquement pour l’affichage du nom commun (CN) ; vérifiez que les noms requis figurent dans les SAN.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)

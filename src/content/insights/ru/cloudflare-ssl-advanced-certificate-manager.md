---
title: "Что представляла собой прежняя платная SSL-опция Cloudflare — от Dedicated SSL к Advanced Certificate Manager"
description: "Ранее платная опция Cloudflare «Dedicated SSL Certificates» в 2021 году была переименована и расширена до «Advanced Certificate Manager (ACM)». В статье разбираются отличия от бесплатного Universal SSL и случаи, когда нужен ACM."
date: 2026-03-31T00:00
author: gui
tags: ["Технологии", "Cloudflare", "Безопасность", "Инфраструктура"]
image: /uploads/acecore-generated/blog-cloudflare-ssl-advanced-certificate-manager.webp
lastUpdated: "2026-09-26T19:15:00+09:00"
---

В 2021 году Cloudflare преобразовала прежнюю услугу **Dedicated SSL Certificates** в **Advanced Certificate Manager (ACM)**. Перед выбором сертификата проверьте имена хостов и схему подключения DNS.

## Когда достаточно Universal SSL

При **полном подключении DNS** бесплатный Universal SSL обычно покрывает корневой домен и поддомены первого уровня. `*.example.com` покрывает `www.example.com`, но не `api.staging.example.com`. При **частичном подключении через CNAME** Cloudflare выпускает отдельный Universal-сертификат для каждого проксируемого имени независимо от глубины. Поэтому многоуровневый поддомен не всегда требует ACM.

Сейчас Cloudflare описывает Universal-сертификаты как бесплатные и не используемые совместно с другими сайтами. Старое утверждение об общих сертификатах устарело.

## Когда рассмотреть ACM

ACM — платное дополнение. Оно позволяет выбрать центр сертификации, метод проверки, срок действия и имена хостов. Один расширенный сертификат охватывает до 50 имён, включая корневой домен. Доступные сроки зависят от центра и тарифа; **один год доступен только клиентам Enterprise с SSL.com**. Не каждый тариф позволяет произвольно выбрать срок от 14 до 365 дней.

Для автоматической защиты глубоких проксируемых поддоменов при полном подключении DNS можно использовать **Total TLS**. Для отдельных имён подойдёт расширенный или собственный сертификат. Total TLS требует полного подключения DNS и не выпускает сертификаты для имён некоторых продуктов, включая Cloudflare Tunnel.

**Расширенные сертификаты не применяются к пользовательским доменам Cloudflare Pages и R2.** Эти продукты используют другой механизм сертификатов. Покупка ACM для сайта Pages не применит такой сертификат к его имени.

## Проверка перед покупкой

1. Перечислите имена и определите схему подключения: полный DNS или CNAME.
2. Проверьте фактическое покрытие Universal SSL.
3. Уточните нужный центр, срок и условия Total TLS.
4. Проверьте актуальную цену и условия покупки в панели Cloudflare для своего тарифа.

Не покупайте ACM только ради отображения общего имени (CN); проверьте, что нужные имена входят в SAN сертификата.

## Official sources

- [Universal SSL limitations](https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/)
- [Advanced certificates](https://developers.cloudflare.com/ssl/edge-certificates/advanced-certificate-manager/)
- [Validity periods and renewal](https://developers.cloudflare.com/ssl/reference/certificate-validity-periods/)
- [Total TLS](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/total-tls/)

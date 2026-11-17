---
title: "Consultar e conciliar o estado das integrações no comércio eletrónico: separar produtos, expedição e análise de anúncios"
description: "Como verificar separadamente o estado da base de dados da loja, do fabricante e do Merchant Center, sem confundir a aceitação do envio com a publicação, a expedição ou a veiculação de anúncios."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Comércio eletrónico", "API", "Operações"]
---

No comércio eletrónico, o registo de produtos, os pedidos ao fabricante, a entrega e o envio de informações sobre produtos a sistemas externos avançam separadamente. Um registo de sucesso num sistema, por si só, não confirma o estado atual dos outros. Este artigo apresenta uma abordagem para conciliar estados através de consultas.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-commerce-state-readback">
  <figcaption><strong id="diagram-commerce-state-readback">Consultar e conciliar o estado das integrações no comércio eletrónico: separar produtos, expedição e análise de anúncios</strong><span>Como verificar separadamente o estado da base de dados da loja, do fabricante e do Merchant Center, sem confundir a aceitação do envio com a publicação, a expedição ou a veiculação de anúncios.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Loja</strong><span>Consultar os registos de produtos e pedidos.</span></li>
    <li><strong>Fabrico e expedição</strong><span>Conciliar os pedidos e o estado da expedição junto do fabricante.</span></li>
    <li><strong>Análise de produtos</strong><span>Distinguir a aceitação do envio do estado após o processamento.</span></li>
  </ol>
</figure>

## Verificar cada estado separadamente

| Sistema consultado | O que verificar                                          | O que essa consulta, por si só, não revela                             |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| Loja               | Definições de publicação e estado dos produtos e pedidos | Processamento pelo fabricante ou conclusão da entrega                  |
| Fabricante         | Estado dos pedidos, do fabrico e da expedição            | Apresentação na loja ou veiculação de anúncios                         |
| Merchant Center    | Estado dos produtos e problemas após o envio             | Disponibilidade de compra na loja ou apresentação efetiva dos anúncios |

Para a conciliação, utilize identificadores e versões que apontem para o mesmo objeto e registe a data e hora da consulta, bem como as falhas de obtenção. Se não for possível obter os dados, mantenha o estado como não verificado e não trate um sucesso antigo como o estado atual. As [consultas do Cloudflare D1](https://developers.cloudflare.com/d1/best-practices/query-d1/) e a [documentação da API da Printful](https://developers.printful.com/docs/edm/) são pontos de partida para verificar, respetivamente, os dados e as informações do fabricante.

## Aceitação do envio e consulta após o processamento

Na nossa integração interna com o Merchant, verificamos se a versão cujo envio foi aceite corresponde à versão e aos atributos das informações do produto consultadas posteriormente. Há casos em que os dados não coincidem mesmo após a aceitação, pelo que adicionámos um diagnóstico que regista motivos predefinidos, como objeto inexistente, versão diferente ou atributos diferentes. Os valores dos atributos dos produtos e as credenciais não são incluídos nos registos de diagnóstico.

A aceitação não garante a correspondência após o processamento nem a veiculação de anúncios. Na [gestão de produtos da Google Merchant API](https://developers.google.com/merchant/api/guides/products/overview), é possível verificar como são tratados os produtos enviados e as informações após o processamento. A publicação de produtos na loja e a análise externa de produtos e apresentação de anúncios também são verificações distintas.

## Não repetir operações de escrita com resultado desconhecido

Se a resposta a uma operação de criação ou envio se perder, reenviar o pedido presumindo que falhou pode gerar duplicados. Primeiro, consulte o objeto e o histórico para conciliar o estado; se não for possível confirmá-lo, mantenha a operação pendente. Também na conciliação de expedições, não inclua em registos públicos pedidos reais ou informações de rastreio que contenham dados pessoais; apenas os responsáveis que deles necessitam devem consultá-los. Comece por testar 4 casos com pedidos fictícios: normal, atraso, dados não obtidos e divergência. Data de verificação: 2026-11-17.

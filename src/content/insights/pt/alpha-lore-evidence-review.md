---
title: "Verificar se a IA contradiz os registros: revisão do cânone que distingue informações ausentes de acontecimentos diferentes"
description: "Como distinguir informações ausentes, contradições e cenas diferentes ao comparar textos gerados com os registros? Apresentamos a avaliação e os limites do conjunto fixo de 31 casos de Alpha-kun."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["IA", "Verificação", "Operação"]
---

Quando a IA gera textos com base em histórias existentes ou registros de trabalho, classificar como contradição tudo o que não está escrito nos registros pode levar à rejeição até mesmo de novas formas de expressão. Por outro lado, é importante não deixar passar textos que contrariem informações explícitas sobre o mesmo acontecimento. Usando a revisão de candidatos ao cânone de Alpha-kun como exemplo, examinamos os fundamentos das decisões e o escopo da avaliação.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-lore">
  <figcaption><strong id="diagram-lore">Comparar o candidato com os registros</strong><span>Verifique se o referente, o acontecimento e o momento são os mesmos antes de decidir.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Verificar os registros</strong><span>Localize o texto original e o referente relacionados ao candidato.</span></li>
    <li><strong>Comparar as cenas</strong><span>Examine as evidências de que se referem ao mesmo acontecimento e momento.</span></li>
    <li><strong>Distinguir os motivos</strong><span>Diferencie contradição explícita, extrapolação do escopo e informação ausente.</span></li>
  </ol>
</figure>

## Informação ausente não é contradição

Por exemplo, se o registro disser apenas «viu nuvens brancas durante o passeio», a cor das flores vistas nesse passeio não está registrada. A ausência dessa informação, por si só, não permite concluir que a pessoa não viu flores. Por outro lado, se o registro disser explicitamente que «não choveu» durante o mesmo passeio, isso contradiz um candidato que diga «choveu naquela ocasião». Este é um exemplo fictício para ilustrar a diferença entre os julgamentos.

Mesmo com indícios semelhantes, pode tratar-se de um passeio em outro dia. É preciso verificar as evidências de que o referente, o acontecimento e o momento são os mesmos e evitar tratar uma frase condicional como «se chover, voltarei para casa» como registro de que realmente choveu. Quando um candidato atribui um resultado oposto a uma cena cujo momento está explicitamente indefinido, o caso é tratado como extrapolação do escopo, separadamente de uma simples contradição.

## Comparar melhorias com casos fixos

No registro interno de alterações da revisão, foram avaliados 29 casos fixos anteriores e 2 casos sintéticos de controle, num total de 31 casos, com a mesma configuração de modelo usada em produção. A v13 coincidiu com as decisões de aceitação ou rejeição e os respectivos motivos esperados em todos os 31 casos, e houve 0 casos de regeneração causada por contradições identificadas erroneamente. Esse resultado refere-se ao conjunto fixo e não comprova a precisão para todos os textos nem o sucesso de acréscimos ao cânone surgidos naturalmente em produção.

Mantemos os resultados esperados e as entradas fixos para comparar as versões antiga e nova e acrescentamos os exemplos que falharam para verificar regressões. Nesse processo, quando não for possível relacionar uma citação do registro à afirmação do candidato, é importante permitir que uma pessoa confira o caso como evidência insuficiente. As [melhores práticas de avaliação da OpenAI](https://platform.openai.com/docs/guides/evaluation-best-practices) também são uma referência para criar conjuntos de avaliação de IA.

Para começar, prepare um pequeno número de registros reais que possam ser publicados e casos fictícios de controle. Depois, peça a uma pessoa que escreva as classificações esperadas: «mesma cena», «cena diferente», «informação ausente» e «contradição explícita». Data de verificação: 17/11/2026.

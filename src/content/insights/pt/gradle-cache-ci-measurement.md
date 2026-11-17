---
title: "Reduzir separadamente as execuções duplicadas do GitHub Actions e o tempo de build do Gradle"
description: "Revisamos as condições que iniciam execuções duplicadas de CI em push e PR e comparamos o cache do Gradle para Android no mesmo commit. Apresentamos os critérios de decisão e os limites das medições."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/astro-performance-tuning-cover-v2.webp
tags: ["GitHub Actions", "Android", "Operações"]
---

Se o CI do Android repete os mesmos processos a cada execução, uma comparação que inclua o tempo de restauração do cache pode ajudar a decidir se vale a pena adotá-lo. Usamos um teste no mesmo commit do job Android do DaysChat para mostrar como verificamos a velocidade e a reprodutibilidade.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-gradle">
  <figcaption><strong id="diagram-gradle">Comparar o cache com as mesmas entradas</strong><span>Analisamos o job inteiro, incluindo o custo de salvar e restaurar o cache.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Primeira execução</strong><span>Criar o cache e registrar o tempo de salvamento.</span></li>
    <li><strong>Nova execução no mesmo commit</strong><span>Verificar o tempo de restauração e as tarefas reutilizadas.</span></li>
    <li><strong>Validar os artefatos</strong><span>Verificar as arquiteturas de destino e a geração do APK.</span></li>
  </ol>
</figure>

## Evitar a mesma validação em push e PR

Em outro sistema de atas de reunião, tanto o push para uma branch de trabalho quanto o PR iniciavam o CI normal e o Rust parity. Limitamos o acionamento por push à main, mantivemos a validação do PR e disponibilizamos a execução manual para quem quisesse verificar alterações antes de abrir um PR. As condições de acionamento das releases de produção não foram alteradas.

Em uma investigação interna, no mês 11, houve 97 execuções acionadas por push cuja validação no PR correspondente também foi bem-sucedida, totalizando 342 minutos em runners Linux. Esse é o tempo de execução das atividades analisadas quanto à duplicação, não o tempo ou o valor de cobrança efetivamente economizado após a mudança. Antes de definir o escopo, é preciso verificar como validar alterações sem PR e garantir que as verificações obrigatórias e as releases não sejam interrompidas. As condições de push e pull_request podem ser consultadas nos [eventos do GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).

## Resultados medidos e condições do job

Na comparação do mesmo commit registrada internamente, o job Android levou 16 minutos e 20 segundos na primeira execução e 6 minutos e 16 segundos na nova execução, incluindo a restauração. Foram reutilizadas 194 tarefas do Gradle, e as verificações de x86_64 e arm64-v8a e a geração do APK também foram concluídas com sucesso. O salvamento inicial levou 34 segundos, a restauração na nova execução levou 62 segundos e o cache de teste tinha cerca de 1.81 GB.

| Item observado    | Primeira execução | Nova execução     |
| ----------------- | ----------------- | ----------------- |
| Job Android       | 16 min 20 s       | 6 min 16 s        |
| Operação de cache | Salvamento: 34 s  | Restauração: 62 s |

Este conjunto de 1 comparação foi medido com um cache exclusivo para PR. Na configuração final, apenas a main salva o cache compartilhado, e os PRs o restauram somente para leitura. Não medimos se a mesma redução ocorre em todos os PRs na configuração final nem se o valor cobrado diminui. Os resultados também variam conforme o ambiente de execução e a taxa de correspondência do cache.

## Definir condições de reutilização e salvamento seguro

O [cache de build do Gradle](https://docs.gradle.org/current/userguide/build_cache.html) usa as entradas e saídas das tarefas para decidir se elas podem ser reutilizadas. Declarações imprecisas das entradas podem levar ao uso de saídas antigas; por isso, primeiro compare uma execução limpa com os artefatos e resultados dos testes. Verifique também se o cache é invalidado conforme o esperado quando as dependências ou as configurações de build mudam.

Restrinja quem pode salvar o cache e configure o sistema para que alterações não confiáveis não atualizem o cache compartilhado. O [cache de dependências do GitHub Actions](https://docs.github.com/en/actions/concepts/workflows-and-actions/dependency-caching) tem restrições de acesso e recomendações de uso. Não use o cache para armazenar segredos e monitore conjuntamente o tamanho, os tempos de salvamento e restauração e a duração total do job.

Primeiro, limite o escopo a 1 job e registre os artefatos e os tempos da primeira execução e da nova execução no mesmo commit. Mesmo que haja redução, verifique separadamente se o build funciona normalmente com outras alterações ou quando o cache está ausente. Data da verificação: 2026-11-17.

---
title: "Como investigar o lag no Minecraft: métricas silenciosas e armazenamento compartilhado"
description: "Da coleta discreta de TPS/MSPT à correlação de JFR com observações de E/S do sistema operacional. Separa a investigação de causa já concluída das melhorias de desempenho ainda não testadas."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/minecraft-latency-investigation-cover-v1.webp
tags: ["Minecraft", "Monitoring", "Performance"]
callout:
  type: note
  title: "Separar investigação de causa de resultados de melhoria"
  text: "A monitoração contínua e a investigação das esperas ao salvar foram concluídas. A migração para outro armazenamento e a comparação de desempenho ainda não foram feitas; a investigação não comprova falha de componente nem elimina o lag para todos os jogadores."
---

O lag no Minecraft pode ter causas diferentes: processamento de ticks do servidor, breves pausas ao salvar, rede ou renderização no cliente. Apresentamos de forma anônima uma investigação em vários servidores Paper, sem revelar nomes de host ou configurações internas.

## Meça médias e pausas breves separadamente

Registre TPS, MSPT médio, máximo e p95, além da contagem acumulada de ticks lentos. Uma média boa pode esconder pausas breves. O uso de CPU do host inteiro não distingue trabalho em uma única thread de espera de E/S.

## Colete sem ruído e registre dados ausentes

Neste caso, um plugin pequeno gravou em JSON local as medições obtidas pela API pública do Paper, e um coletor as agregou em séries temporais de monitoração. A E/S de arquivos ocorreu fora da thread principal do jogo; substituir um arquivo temporário evitou que leitores vissem uma atualização parcial. Isso não ocultou os registros normais do console.

Confira também os horários e se a coleta teve sucesso. Não trate como normal um valor antigo de um coletor parado nem substitua dados ausentes por zero TPS.

## Correlacione janelas limitadas de JVM, SO e salvamento

Enquanto o problema era reproduzível, JFR, observações de espera do SO e E/S de blocos foram coletados em janelas separadas e limitadas. As observações foram comparadas com a série contínua de MSPT e a pressão periódica de E/S para distinguir atividade do GC de esperas durante salvamentos síncronos. As coletas não ocorreram todas ao mesmo tempo. Para começar a investigar Paper, consulte o [guia oficial de perfilamento com spark](https://docs.papermc.io/paper/profiling/). Neste caso, JFR e observações do SO foram acrescentados para investigar esperas durante o salvamento.

Em uma janela normal de 240 segundos e outra com travamento de 220 segundos, as medianas por segundo de write-await foram 1.60 ms e 43.71 ms; os máximos foram 6.00 ms e 123.57 ms. São duas janelas de observação, não resultados de antes e depois nem um benchmark geral.

Além de esperas em salvamentos síncronos e no journal do sistema de arquivos, também houve atrasos em solicitações ao dispositivo feitas por vários aplicativos, restringindo o candidato à rota de armazenamento compartilhado. Um evento de conclusão de um [tracepoint de blocos do Linux](https://www.kernel.org/doc/html/latest/core-api/tracepoint.html) pode representar apenas parte de uma solicitação; por isso, solicitações sem correspondência não foram misturadas a uma estatística de toda a E/S. O tempo e o volume da coleta foram limitados, e seu custo foi considerado.

<figure class="article-diagram" data-layout="compare" data-tone="green" data-count="2" aria-labelledby="diagram-minecraft-latency-investigation">
  <figcaption>
    <strong id="diagram-minecraft-latency-investigation">Separar observações de hipóteses</strong>
    <span>Métricas contínuas e amostras limitadas usam janelas diferentes. O efeito da migração do armazenamento não foi testado.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 19V5M4 19h16"/><path d="m7 15 4-5 3 2 5-7"/></svg></span>
      <strong>Métricas contínuas sem ruído</strong>
      <span>Registre TPS/MSPT e dados ausentes sem aumentar o log normal do console.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="12" cy="12" r="4"/><path d="M6 8h.01M18 16h.01"/></svg></span>
      <strong>Investigação limitada</strong>
      <span>Colete JFR, SO e block I/O separadamente e compare. O caminho de armazenamento compartilhado é uma hipótese, não uma falha confirmada.</span>
    </li>
  </ol>
</figure>

## Trate a próxima etapa como um teste separado

Depois da investigação, a captura limitada foi encerrada e a coleta contínua foi confirmada como normal. Ainda não foi feito um teste comparando vários ciclos sob uso semelhante após a migração do armazenamento. Este registro prepara a próxima medida com planos de backup, restauração e reversão; não reduz a durabilidade dos salvamentos nem atribui a causa ao GC ou a um plugin específico sem evidências.

Para distinguir sinais de monitoração de diagnóstico, consulte [Monitoramento e investigação de incidentes com OpenClaw](/insights/openclaw-monitoring-investigation/). Para testes de recuperação, consulte [Monitoramento de backup com R2 e restic](/insights/restic-r2-backup-verification/).

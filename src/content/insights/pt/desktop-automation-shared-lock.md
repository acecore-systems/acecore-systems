---
title: "Separar com segurança a automação de telas de autenticação: como evitar entradas simultâneas em uma área de trabalho compartilhada"
description: "Apresentamos como definir o escopo da exclusão mútua, interromper operações em caso de conflito e verificar novamente o destino antes do envio quando várias automações usam a mesma tela."
date: "2026-11-17T12:00:00+09:00"
author: gui
image: /images/insights/covers/multi-service-session-lifecycle-cover-v1.webp
tags: ["Autenticação", "Automação", "Operações"]
---

Quando várias automações usam a mesma área de trabalho simultaneamente, uma delas pode inserir dados na tela aberta por outra. Ao lidar com telas de autenticação, é importante permitir apenas uma operação de tela por vez e confirmar o destino imediatamente antes do envio. Explicamos isso usando como exemplo testes sintéticos que não utilizam informações confidenciais nem destinos de conexão reais.

<figure class="article-diagram" data-layout="flow" data-tone="blue" data-count="3" aria-labelledby="diagram-desktop-lock">
  <figcaption><strong id="diagram-desktop-lock">Evitar conflitos nas operações de tela</strong><span>Limite o uso da tela compartilhada a uma operação por vez.</span></figcaption>
  <ol class="article-diagram__nodes">
    <li><strong>Obter acesso exclusivo</strong><span>Se outro processo estiver usando a tela, não prossiga.</span></li>
    <li><strong>Verificar novamente o destino</strong><span>Confira a tela e o destino da conexão antes do envio.</span></li>
    <li><strong>Liberar e verificar o resultado</strong><span>Após operar a tela, verifique o resultado separadamente.</span></li>
  </ol>
</figure>

## Tratar a mesma área de trabalho como um recurso compartilhado

Mesmo que cada automação tenha seu próprio bloqueio, isso não evita conflitos se todas inserirem dados na mesma tela. Os processos que usam a mesma área de trabalho devem participar de um mecanismo comum de exclusão mútua, e os que não conseguirem obter o bloqueio devem parar antes de clicar ou inserir dados. A [explicação sobre mutexes no Windows](https://learn.microsoft.com/en-us/windows/win32/sync/using-mutex-objects) também é uma referência útil sobre mecanismos para controlar o acesso simultâneo a recursos compartilhados.

Mantenha a exclusão mútua durante a entrada de dados e as transições de tela e, antes do envio, verifique novamente a tela atual e o destino da conexão. Para decidir se é necessário continuar ocupando a tela durante processos externos com longos tempos de espera, examine o período em que a tela é realmente usada. Inclua também no projeto a liberação em caso de exceção, o estado da tela após a interrupção de um processo e o tratamento de envios cujo resultado seja desconhecido.

## O que verificamos em telas sintéticas

Em um fluxo de autenticação interno registrado, incluímos as transições de tela e a verificação e as operações anteriores ao envio no escopo da exclusão mútua compartilhada. Em telas sintéticas fixas, verificamos o envio bem-sucedido, a interrupção por conflito, a transição para autenticação multifator e exceções durante o clique. Isso não representa um teste com credenciais reais nem demonstra que o procedimento funciona em todos os sites.

Se não estiver claro se um envio já foi realizado, verifique o estado no destino em vez de repetir o envio. O bloqueio é um mecanismo que reduz o risco de inserção incorreta, mas não substitui a verificação de identidade, a autorização nem a conferência dos dados inseridos e do resultado do envio.

## O que testar primeiro

Prepare um formulário fictício e inicie dois processos simultaneamente. Verifique se apenas um deles opera a tela, se o outro para antes de inserir dados e se o próximo processo consegue prosseguir mesmo após uma exceção no meio da operação. Acrescente também um caso em que a tela muda durante o processo e garanta que o envio não ocorra se a nova verificação falhar. Data da verificação: 2026-11-17.

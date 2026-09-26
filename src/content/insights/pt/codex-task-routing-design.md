---
title: "Como projetar a divisão de tarefas no Codex: o plugin público Task Routing"
description: "As escolhas do Codex Task Routing: preservar a configuração do agente principal, identificar a política efetiva, delimitar a entrega e verificar a execução."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/codex-task-routing-design.webp
tags: ["Tecnologia", "IA", "Desenvolvimento"]
callout:
  type: note
  title: "O que foi verificado"
  text: "Foram conferidos o código público, os PRs incorporados, o CI em três sistemas operacionais e a instalação em ambiente isolado. Este artigo não afirma ganho medido de qualidade ou uso nem execução de um modelo delegado em conta real."
---

Ao conduzir vários trabalhos no Codex, escolher um modelo é apenas parte da decisão. Também é preciso definir qual etapa pode ser separada, que contexto acompanha a entrega e como verificar o resultado. A Acecore publicou o [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) para tornar essas decisões explícitas.

## O trabalho comum fica com o agente principal

O agente principal conduz pesquisa, implementação e verificação rotineiras. Uma etapa delimitada só é delegada quando há valor concreto. O plugin preserva o modelo e a configuração de raciocínio escolhidos pelo usuário. Evita repassar trabalho apenas para outra instância do mesmo modelo ou paralelizar sem uma tarefa independente para o agente principal.

Uma entrega exige mais do que “escreva um artigo”: precisa indicar fontes primárias, escopo, ferramentas disponíveis, critérios de aceitação e quando devolver uma dúvida não resolvida. O agente principal verifica mudanças importantes e evidências, não apenas a conclusão.

## Política e execução são coisas distintas

No início da tarefa, o plugin apresenta a política efetiva e seu hash. Configurações personalizadas não alteram silenciosamente o agente principal. O hook não chama modelos nem faz solicitações de rede.

Um nome de modelo na configuração não comprova que ele foi executado. Conexão, execução e resultado precisam de verificações separadas; medições indisponíveis ficam registradas como ausentes. A rota para o Chat comum é opcional e para quando disponibilidade ou permissão não estão claras.

## Limites das verificações

O [PR de atualização](https://github.com/acecore-systems/codex-task-routing/pull/13) registra 134 testes unitários, CI em Windows, Ubuntu e macOS, além de instalação, hooks, reinstalação e remoção em ambiente Codex isolado. Um [PR anterior](https://github.com/acecore-systems/codex-task-routing/pull/12) aprimorou diagnósticos no Windows e verificações do pacote.

Esses testes cobrem o pacote e a configuração. Não demonstram execução de modelos delegados em conta real, benefício medido de qualidade ou uso, nem a rota do Chat comum em todos os ambientes. Requisitos e instruções estão no [README público](https://github.com/acecore-systems/codex-task-routing#readme).

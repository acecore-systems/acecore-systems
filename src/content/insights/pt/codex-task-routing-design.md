---
title: "Delegação de tarefas no Codex: repasses, permissões e revisão de resultados"
description: "Codex Task Routing 0.14.0: decisões do responsável principal, continuidade da execução, escopo e permissões, autenticação local e condições e aceitação da rota Sol para Pro."
date: "2026-09-26T18:30:00+09:00"
author: gui
image: /images/insights/covers/codex-task-routing-design-cover-v1.webp
tags: ["Tecnologia", "IA", "Desenvolvimento"]
callout:
  type: note
  title: "O que foi verificado"
  text: "Código público, testes e instalação isolada foram verificados. Um filho Sol direto enviou uma solicitação real ao Temporary Chat Pro, coletou e aceitou a resposta por Browser plugin no Windows. Isso não comprova todos os hosts, backend, autenticação real nem ganhos medidos de qualidade ou uso."
lastUpdated: "2026-10-15T00:00:00+09:00"
---

Teste a delegação no Codex com pesquisa ou revisão verificável de forma independente, esclarecendo a integração pelo agente principal. Inclua arquivos, referências, evidências e dúvidas; aplique o menor privilégio de [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) às ferramentas. Delegar não comprova, por si só, melhorias de qualidade ou custo.

Ao conduzir vários trabalhos no Codex, escolher um modelo é apenas parte da decisão. Também é preciso definir qual etapa pode ser separada, que contexto acompanha a entrega e como verificar o resultado. A Acecore publicou o [Codex Task Routing](https://github.com/acecore-systems/codex-task-routing) para tornar essas decisões explícitas.

![Quatro etapas de verificação: versão da política, critérios de entrega, evidências de execução e resultados medidos](/images/insights/codex-task-routing-evidence.webp)

## O pai decide; o executor continua a unidade completa

A versão 0.14.0 preserva o modelo e o raciocínio do pai escolhidos pelo usuário. O pai cuida de objetivos, prioridades, escolha do executor, mudanças importantes e exceções. Trabalho substancial com inspeção repetida de código, logs e testes passa a um executor adequado; tarefas curtas podem ficar com o atual.

Um Sol responsável por uma correção limitada continua investigação, implementação, testes, PR autorizado, ajustes acordados e revalidação. Falhas comuns e novas instruções não reiniciam o repasse. Mantenha revision, diff, pendências e condições de retomada; mudanças de projeto, novas permissões e questões importantes retornam ao pai.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="3" aria-labelledby="diagram-codex-task-routing-design">
  <figcaption>
    <strong id="diagram-codex-task-routing-design">Continuar com o executor e devolver decisões importantes</strong>
    <span>Permissão da política, autoridade do host e execução são verificadas separadamente.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Decisão do pai</strong>
      <span>Escolher objetivos, executor, permissões e exceções.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Executor contínuo</strong>
      <span>Investigar, corrigir, testar e concluir PR e revisão autorizados.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Aceitação do pai</strong>
      <span>Conferir evidências e pendências antes da próxima etapa permitida.</span>
    </li>
  </ol>
</figure>

## Incluir escopo, término e permissões no repasse

Passe arquivos, fontes, critérios, evidências e condições de retorno brevemente. Não delegue só para outra instância do mesmo modelo. Paralelismo exige trabalho independente útil do delegador. Netos padrão são apenas Astra para Sol/Luna e Sol para Luna; Luna e netos não delegam adiante.

Verifique separadamente permissões para PR, merge, implantação e mensagens. Comentários de PR ou pedidos citados de outra tarefa não concedem autorização humana nova. Restrições superiores do host atual prevalecem.

## Encaminhar autenticação privada ao processo local

Antes de escolher nuvem para entrada, armazenamento ou transferência de credenciais, o pai verifica estado local e repasses registrados. Passe somente preset registrado; credenciais, OAuth JSON, cookies e telas privadas ficam locais. Filhos retornam requisitos ao pai.

Disponibilidade, aprovação, implementação e autenticação concluída são distintas. queued e espera de unlock não são conclusão. Documentos públicos e código sem segredos usam executores normais. Hooks não iniciam workers ou modelos.

## Um Sol direto pode assumir uma solicitação Pro condicional

Com Chat normal explicitamente habilitado, apenas root ou filho Sol direto com papel e profundidade verificados pode assumir a rota Browser. Verifique antes materiais aprovados, transporte, ferramentas reais e ambiente. Confira Pro na UI antes e depois de uma solicitação real em Temporary Chat, separada de Work e de API de modelos.

O mesmo executor prepara, envia, coleta, aceita e corrige dentro da autorização, mantendo tab, ID, input hash e estado enviado. Devolver a coleta ao pai não causa reenvio. Declarações actor, SubagentStart e nomes configurados não provam papel, autoridade ou backend; incerteza de permissão ou capacidade bloqueia envio.

## Separar testes, transporte real e ganhos

A [mudança 0.14.0](https://github.com/acecore-systems/codex-task-routing/pull/20) verificou 198 testes e instalação isolada. O [registro real](https://github.com/acecore-systems/codex-task-routing/pull/22) confirma Sol direto enviando uma vez, sem reenvio, pelo Browser plugin no Windows, coletando a mesma resposta e aceitando seu significado após conferir ID/hash. É evidência de um ambiente limitado.

Identidade backend do Pro, todos os hosts, ida e volta IAB, novos netos reais, autenticação privada e ganhos de uso ou qualidade não foram demonstrados. Não transforme ausência em zero; conte preparação, espera, aceitação e retrabalho. Consulte o [README público](https://github.com/acecore-systems/codex-task-routing#readme). Verificado em 14 de outubro de 2026.

---
title: "Impeça que respostas de IA façam promessas que não podem cumprir"
description: "Como evitar que um assistente informativo prometa por conta própria a participação, o agendamento ou o contato posterior de alguém da equipe. Aborda o estado da conversa, falhas de recuperação, revisão de rascunhos antigos e encerramento."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/ai-reply-capability-guardrails-cover-v1.webp
tags: ["AI", "Security", "Web"]
callout:
  type: note
  title: "Caso generalizado; nenhuma conversa específica é publicada"
  text: "O caso cobre alterações de política e classificação, verificações antes do envio, testes, entrega e observação operacional limitada. Não inclui publicações nem contas de outras pessoas e não demonstra que toda formulação de promessa incorreta pode ser evitada."
---

Para orientação ou suporte, defina como capacidades distintas explicar informações públicas, encaminhar à equipe e realizar uma reserva. [OWASP: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/) ajuda a projetar ações permitidas e aprovações. O texto aborda limites das respostas, sem procedimentos de envio automático específicos de plataformas.

Mesmo que uma resposta informativa soe natural, ela não deve prometer que alguém da equipe fará contato depois ou comparecerá em determinado horário sem evidência de que a ação pode ser realizada. Este relato generalizado de um fluxo interno de respostas não identifica uma plataforma nem uma conversa.

## Defina o que o assistente pode explicar e o que pode fazer

Explicar informações públicas, confirmar o que alguém deseja e realmente entrar em contato ou comparecer são capacidades distintas. Indique o papel do assistente nas instruções e aplique o mesmo papel às respostas iniciais, às respostas seguintes e às verificações antes do envio. Uma configuração que aumenta o esforço de raciocínio não concede autoridade para agir nem revela a agenda de alguém da equipe.

## Use o estado da conversa, não apenas palavras-chave

Transmita a publicação original, a troca recente que foi realmente confirmada, se já houve orientação, se há uma pergunta pendente e se a conversa terminou. Não classifique alguém como interessado em comparecer apenas porque uma palavra coincide, quando a pessoa expressou outra preferência. Uma promessa incorreta escrita por uma IA anterior também não é evidência de que alguém pretende agir.

## Verifique o interlocutor e o significado antes do envio

“Alguém da equipe entrará em contato mais tarde” é uma promessa de quem deveria agir. Uma citação da outra pessoa e uma indicação geral de um evento têm significados diferentes. Em vez de proibir uma sequência de caracteres em todos os contextos, confira o papel, o estado da conversa e a evidência da ação. Suspenda uma resposta ambígua e encaminhe-a a uma pessoa quando necessário. Também é preciso impedir que a geração continue como se as fontes tivessem sido consultadas quando a recuperação falha ou retorna uma resposta inválida. Essa condição de interrupção no lado da recuperação foi confirmada somente no código revisado e na revisão do PR; não há confirmação de que esse caminho esteja operando em produção.

## Não confunda expressões parecidas nem tipos diferentes de solicitação

Diferencie uma publicação que procura participantes de uma fala de alguém que deseja participar. Redações parecidas não tornam produtos, edições ou condições de uso equivalentes; não misture orientações de ambientes diferentes. Antes do envio, verifique agradecimentos sem fundamento e respostas que tratem alguém como já aceito. Mesmo ao priorizar respostas, use espera limitada durante a limitação de requisições e evite duplicatas. Não registre uma espera ou resposta omitida como envio bem-sucedido.

## Confira novamente os rascunhos antigos com as condições atuais

Um rascunho aprovado quando foi gerado pode ficar desatualizado se a conversa ou a política mudar. Verifique-o novamente com o estado mais recente imediatamente antes do envio e não envie rascunhos de conversas encerradas. Registre separadamente o envio omitido e a conversa encerrada, sem confundi-los com um envio concluído. Também é válido não responder quando uma pergunta desnecessária apenas prolongaria a conversa.

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Verificar evidências e capacidade antes de responder</strong>
    <span>O contexto da conversa determina se a resposta será enviada ou pausada. A operação em produção da interrupção de recuperação não foi confirmada.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 5h14v11H9l-4 4V5Z"/><path d="M8 9h8M8 12h5"/></svg></span>
      <strong>Leia quem fala e o pedido</strong>
      <span>Verifique se é um convite ou interesse em participar, a edição pertinente e o estado da conversa.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg></span>
      <strong>Responda com respaldo</strong>
      <span>Informe apenas o que pode ser feito e confira novamente antes do envio.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
      <strong>Pause se houver dúvida</strong>
      <span>Não trate uma recuperação com falha ou inválida como consulta concluída; encaminhe a uma pessoa. Limite a espera e evite duplicidades.</span>
    </li>
  </ol>
</figure>

## O que foi verificado e o que ainda não foi comprovado

A classificação e as verificações antes do envio foram revisadas, testes de regressão foram executados, rascunhos gerados foram analisados e houve observação operacional limitada após a entrega. Isso não demonstra segurança para todas as conversas, paráfrases ou mudanças de modelo. O envio externo também exige autorização e aprovação operacionais, além das verificações de conteúdo. A condição de interrupção de recuperação descrita acima foi revisada no código e em um PR; seu funcionamento em produção continua sem verificação.

Para os limites da entrada de busca, consulte [Sincronização segura de HTML público com Vectorize](/pt/insights/cloudflare-vectorize-safe-implementation/); para a renderização, consulte [Renderização segura de links Markdown em respostas de chat com IA](/pt/insights/ai-chat-markdown-link-safety/).

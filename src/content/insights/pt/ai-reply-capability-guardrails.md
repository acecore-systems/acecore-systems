---
title: "Impeça que respostas de IA façam promessas que não podem cumprir"
description: "Evitar promessas de ações que a IA não executa: contexto, presença medida, frescor e falhas, anúncios com personalidade, supressão de textos similares e barreiras de envio."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
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

## Usar presença medida e horário observado

Anúncios separam humanos no chat de voz público e jogadores simultâneos somados em todos os servidores Minecraft monitorados. Basta um indicador atingir 15 pessoas; não se somam os dois. Todas as fontes Minecraft precisam estar dentro de 30 segundos e voz, 120 segundos. Se só um indicador está disponível e atende, descreva apenas ele.

Dados indisponíveis ou vencidos não são zero. Só se prepara nova chegada quando ambos são obtidos e ficam abaixo do limite. Não se repete o mesmo pico contínuo e aguardam-se pelo menos 3 horas após a tentativa anterior. Consulta apenas de presença não chama IA.

## Preservar a personalidade e pular anúncios quase iguais

Cada anúncio usa personalidade e tom compartilhados e os últimos 20 anúncios, com presença em linha separada. O modelo não escreve números e horários: inserem-se medições obtidas novamente após gerar. Se apenas números mudam num texto similar, tenta-se regenerar uma vez e depois pula-se. Falha, revisão humana necessária ou mudança do indicador qualificado impedem publicar, sem modelo fixo de fallback.

Texto aprovado não basta. Confira conta, sessão, restrições, exclusão mútua e frescor antes do clique. Resultados incertos não são reenviados automaticamente; sucesso exige publicação com autor, texto completo e hora correspondentes. Implementação, testes, configuração e verificações operacionais limitadas foram concluídos; postagem real após atingir o limite não foi demonstrada neste escopo. Verificado em 14 de outubro de 2026.

<figure class="article-diagram" data-layout="branches" data-tone="violet" data-count="3" aria-labelledby="diagram-ai-reply-capability-guardrails">
  <figcaption>
    <strong id="diagram-ai-reply-capability-guardrails">Conferir evidência, frescor e autorização</strong>
    <span>Texto natural não autoriza postar. Ausência não é zero; conferir antes de enviar.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Ler contexto e medidas</strong>
      <span>Conferir falante, pedido, presença e horário.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Gerar e validar com base</strong>
      <span>Comparar capacidade, personalidade, similaridade e condições.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Enviar autorizado ou reter</strong>
      <span>Conferir sessão, frescor e exclusão; não reenviar resultados incertos.</span>
    </li>
  </ol>
</figure>

## O que foi verificado e o que ainda não foi comprovado

A classificação e as verificações antes do envio foram revisadas, testes de regressão foram executados, rascunhos gerados foram analisados e houve observação operacional limitada após a entrega. Isso não demonstra segurança para todas as conversas, paráfrases ou mudanças de modelo. O envio externo também exige autorização e aprovação operacionais, além das verificações de conteúdo. A condição de interrupção de recuperação descrita acima foi revisada no código e em um PR; seu funcionamento em produção continua sem verificação.

Para os limites da entrada de busca, consulte [Sincronização segura de HTML público com Vectorize](/pt/insights/cloudflare-vectorize-safe-implementation/); para a renderização, consulte [Renderização segura de links Markdown em respostas de chat com IA](/pt/insights/ai-chat-markdown-link-safety/).

---
title: "Como tratar webhooks de pagamento e reembolso com segurança: reconciliação de estado nos Workers"
description: "Um exemplo de implementação que separa verificação de assinatura, eventos duplicados ou atrasados, estado do reembolso e respostas de APIs externas. Também mostra a revalidação de permissões antes de ações administrativas."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/cloudflare-payment-event-boundaries-cover-v1.webp
tags: ["Cloudflare Workers", "Stripe", "Security"]
callout:
  type: note
  title: "Separar a evidência da implementação das operações reais"
  text: "Neste caso anonimizado, foram verificadas a implementação, os testes, a publicação em produção e a reconciliação somente de leitura com APIs externas. Nenhum reembolso, cancelamento ou ajuste de pontos de cliente foi executado como teste, e não se afirma a verificação completa de todos os fluxos de pagamento."
---

Receber um evento do provedor de pagamentos não conclui por si só um pedido ou reembolso. Este exemplo anonimizado mostra como um fluxo operacional nos Workers reconcilia o estado do provedor com os registros locais. Dados de clientes, identificadores de transações reais e destinos internos de notificações foram omitidos.

## Verifique a assinatura e impeça duplicidade na entrada

Valide a assinatura usando o corpo original da requisição, sem alterações, e confira se o evento pertence ao modo de produção ou teste esperado. Registre o processamento e reivindique uma reserva de processamento para evitar repetir uma ação de negócio quando o mesmo evento for reenviado. Isso não garante que os eventos cheguem em ordem. Consulte o [guia oficial de webhooks da Stripe](https://docs.stripe.com/webhooks).

## Consulte o estado atual diante de um evento de reembolso atrasado

Esta implementação trata `refund.created`, `refund.updated` e `refund.failed`. Para um reembolso em gestão, busca novamente o objeto atual na Stripe para que um evento atrasado não faça o registro local voltar a um estado anterior. Distingue valores reembolsados com sucesso e pendentes antes de decidir se o pedido foi totalmente reembolsado.

Confere valor, moeda, PaymentIntent, metadados que vinculam pedido e operação, e identificadores já armazenados. IDs de pagamento podem começar com `py_` e IDs de reembolso com `pyr_`; a implementação foi ajustada para não rejeitar uma resposta válida apenas por causa de um prefixo conhecido. Aceitar outro prefixo não afrouxa as verificações de valor e identidade. Valores desconhecidos não são contabilizados como zero.

## Mantenha separados os resultados de reembolso, pontos e notificações

Verifique saldo e permissões antes de solicitar um reembolso; depois de consultar o estado externo e imediatamente antes da gravação, confira novamente as permissões e a validade da operação. Use uma chave de idempotência e uma reserva próprias para cada operação. Se o resultado externo for incerto, reconcilie o estado atual em vez de solicitar o reembolso novamente sem verificação.

Um reembolso bem-sucedido e um ajuste de pontos bem-sucedido são estados diferentes. Uma falha posterior não deve repetir o reembolso; registre qualquer reconciliação ou reparo necessário. A configuração de notificações, o recebimento real e o acompanhamento da equipe são critérios de aceitação separados do processamento de eventos de pagamento. Este artigo não afirma que as notificações estejam operacionais.

<figure class="article-diagram" data-layout="flow" data-tone="amber" data-count="3" aria-labelledby="diagram-cloudflare-payment-event-boundaries">
  <figcaption>
    <strong id="diagram-cloudflare-payment-event-boundaries">Do webhook a resultados separados</strong>
    <span>Confira o estado atual antes de registrar a conclusão. Nenhum reembolso nem ajuste de pontos de cliente foi executado.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 5h16v14H4z"/><path d="M8 9h8M8 12h5M8 15h3"/></svg></span>
      <strong>Validar na entrada</strong>
      <span>Confira o body original, o mode e o event ID; identifique reenvios e processamento em andamento.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10h5"/></svg></span>
      <strong>Conciliar o estado atual</strong>
      <span>Não reverta registros por causa de um evento atrasado; compare valor, moeda e pedido.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="5" width="6" height="14" rx="1"/><rect x="14" y="5" width="6" height="14" rx="1"/><path d="M11 12h2"/></svg></span>
      <strong>Registrar resultados separadamente</strong>
      <span>Reembolso, pontos e notificações têm estados distintos. Se o resultado externo for incerto, reconcilie antes de repetir a operação.</span>
    </li>
  </ol>
</figure>

## Verifique respostas no Node e no runtime dos Workers

Testar um fetch externo apenas no Node pode deixar passar diferenças do runtime dos Workers. Neste caso, reproduzimos um problema de compatibilidade com `redirect: 'error'` e alteramos para `redirect: 'manual'` com verificação explícita do status HTTP. Não trate uma resposta 3xx ou uma página de erro como JSON normal nem siga automaticamente um redirecionamento para outro host levando a autorização. Consulte a [API Request dos Workers](https://developers.cloudflare.com/workers/runtime-apis/request/).

## Registre os limites de publicação e aceitação

As alterações no banco de dados, o processamento dependente e a interface de gestão foram publicados em sequência. Foram verificados testes, CI, telas de produção somente para leitura e a consistência com consultas às APIs dos provedores. Nenhuma operação financeira de cliente foi executada para teste. A exportação CSV também trata como texto células que poderiam ser interpretadas como fórmulas e não substitui tarifas desconhecidas por zero.

Para entender o limite de login administrativo, consulte [Projeto de sessões entre vários serviços](/insights/multi-service-session-lifecycle/).

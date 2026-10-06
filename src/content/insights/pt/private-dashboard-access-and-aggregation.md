---
title: "Criar um painel operacional protegido com Cloudflare Pages e D1"
description: "Um projeto anonimizado que protege a entrada com Cloudflare Access e consulta agregados operacionais do D1 por meio de Pages Functions. Separa a publicação em produção, a interface autenticada e o uso de índices verificados dos itens que não foram testados."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/private-dashboard-access-and-aggregation-cover-v1.webp
tags: ["Cloudflare Pages", "Cloudflare D1", "Security"]
callout:
  type: note
  title: "Separar implementação, interface de produção e verificação do índice"
  text: "Este caso anonimizado implementa uma interface Pages protegida pelo Access e agregados D1 somente para leitura. Foram verificados a publicação em produção integrada ao GitHub, a interface autenticada e o uso do índice por uma consulta de produção. Cargas elevadas e desempenho entre várias organizações não foram testados."
---

Quando as informações operacionais ficam espalhadas entre logs e bancos de dados, pode ser difícil para a equipe conferir o estado atual com segurança. Este exemplo anonimizado explica como verificar acesso, agregação e publicação de um painel. Ele não inclui domínios, contas, conteúdo de publicações nem números operacionais reais.

## Coloque a página e a API atrás do limite de acesso

Ocultar uma página estática do Cloudflare Pages não basta se a API de dados ainda puder ser chamada diretamente. Inclua a interface e a API no limite do Cloudflare Access para que somente a equipe operacional possa ler os dados. Como procedimento de verificação, teste a página e a API antes e depois da autenticação. Neste caso, foram confirmados em produção o limite de autenticação da página e a exibição de dados na interface após o login dedicado. O registro disponível não confirma uma chamada direta sem autenticação ao endpoint da API; essa continua sendo uma verificação de aceitação separada. Não coloque segredos de autenticação no código do navegador.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-private-dashboard-access-and-aggregation">
  <figcaption>
    <strong id="diagram-private-dashboard-access-and-aggregation">Proteger a página e a API</strong>
    <span>O acesso direto não autenticado à API não foi testado. As verificações cobriram um único ambiente operacional.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6V4a4 4 0 0 1 8 0v2M9 13h6"/></svg></span>
      <strong>Painel autenticado</strong>
      <span>Após autenticação no Access, o operador consulta agregados protegidos.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3M20 5v5M4 12v7c0 1.7 3.6 3 8 3"/></svg></span>
      <strong>API somente leitura</strong>
      <span>Leia o D1 dentro do mesmo limite. O bloqueio de acesso direto não autenticado à URL da API não foi verificado.</span>
    </li>
  </ol>
</figure>

## Separe gravações de agregações somente para leitura

Um endpoint GET do Pages Functions consulta o D1 e reúne em uma resposta as contagens por hora, o estado recente do processamento e o modo de execução. Limite a própria API do painel a operações somente de leitura; não dependa de ocultar um botão na interface. Defina o período, o fuso horário e o significado de estados confirmados e pendentes para não somar contagens diferentes. Mostre valores ausentes ou não resolvidos separadamente, sem tratá-los como ações bem-sucedidas nem como zero.

## Verifique os índices do D1 com a consulta de agregação

As telas operacionais filtram repetidamente períodos recentes; sua aparência não prova que um índice seja útil. Depois de adicionar um índice para as condições reais de agregação, confira o plano de consulta no D1 de produção e confirme que o índice previsto é usado. Criar um índice e confirmar que uma consulta o utiliza são verificações diferentes. Neste caso, ambos foram confirmados em produção, mas não houve benchmark de melhoria no tempo de resposta ou de resistência sob carga elevada.

## Confira autenticação e exibição após a publicação em produção

Publique o Pages em produção pela integração com GitHub e confirme o sucesso do deploy do commit esperado e que o domínio personalizado esteja ativo. Depois, verifique se a página fica protegida antes da autenticação e se os dados do painel aparecem após o login. CI aprovado ou deploy bem-sucedido, por si só, não comprova que uma pessoa autenticada consiga ver a interface de produção.

Este caso anonimizado verificou, em um único ambiente operacional, o limite de acesso, a tela de produção e o uso de índice pela consulta de agregação do D1. Não testou a separação de permissões entre organizações, carga com mais usuários ou cenários de invasão em todas as configurações de autenticação. Para a arquitetura mais ampla do site em Pages, consulte [Arquitetura de sites com Cloudflare Pages](/insights/astro-cloudflare-site-architecture/).

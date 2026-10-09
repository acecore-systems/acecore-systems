---
title: "Separar o cache de borda para imagens públicas dos limites da API"
description: "Um caso em que a API de conteúdo e as solicitações de imagens compartilhavam o mesmo limite durante a navegação repetida. Aborda a reutilização de imagens públicas, a validação de respostas bem-sucedidas, os limites entre WAF e aplicação e as verificações em produção."
date: "2026-10-06T02:20:00+09:00"
lastUpdated: "2026-10-09T15:00:00+09:00"
author: gui
image: /images/insights/covers/public-image-cache-and-api-rate-limits-cover-v1.webp
tags: ["Cloudflare", "Performance", "Web"]
callout:
  type: note
  title: "Verifique o cache e os limites separadamente"
  text: "Este caso confirma a implementação, o CI, a publicação em produção pela integração com GitHub e a comparação do conteúdo de imagens representativas com o estado do cache. Não mede a taxa de acertos em todos os data centers nem ganhos de desempenho sob alta carga."
---

Em diários e catálogos com imagens, cada mudança de data ou página gera solicitações tanto para a API de conteúdo quanto para as imagens. Descrevemos um caso em que as imagens pararam de carregar durante a navegação repetida, sem revelar URLs operacionais, rotas internas ou valores de limite.

## Reproduzir a navegação consecutiva a partir de uma imagem

Busque repetidamente a mesma imagem pública e compare hash do corpo, status e cache. Depois carregue texto e várias imagens ao trocar de página, verificando quais solicitações entram no limite. Um HIT não basta: teste o conteúdo correto e a proteção da API.

[Cloudflare Cache API：Leitura condicional e cache por localização](https://developers.cloudflare.com/workers/runtime-apis/cache/)

## Conteúdo e imagens consumiam o mesmo limite

Neste caso, as solicitações à API dinâmica e os GETs de imagens públicas eram contabilizados pela mesma regra de limite do WAF. Até mudanças normais de página podiam gerar várias solicitações ao mesmo tempo: o conteúdo carregava, mas as imagens podiam ser limitadas.

Adicionar um cache de borda para imagens não ajuda as solicitações que o WAF bloqueia antes que cheguem até ele. Alteramos separadamente a carga na origem e quais solicitações são contabilizadas no mesmo limite. Os limites existentes da aplicação e as quotas do processo de geração continuam valendo para suas respectivas finalidades.

## Reutilize apenas imagens públicas que possam ser compartilhadas

As imagens tratadas aqui são imutáveis: o mesmo asset ID público sempre retorna o mesmo conteúdo. Validamos o formato do asset ID, a fronteira da solicitação e a configuração do Service Binding antes de consultar uma entrada de cache identificada pelo mesmo host e asset ID. Um cache aquecido não dispensa essas verificações de entrada.

Strings de consulta que não alteram o conteúdo e cabeçalhos da solicitação do usuário final não dividem o cache da mesma imagem. Essa escolha só é válida porque são imagens públicas e imutáveis. Ela não pode ser aplicada sem alterações a imagens privadas cujo conteúdo varia por usuário ou organização.

## Armazene somente respostas 200 validadas

Quando não há item em cache, a imagem é obtida de um Service Binding privado. Validamos o HTTP status, o Content-Type da imagem, o Content-Length e o body da resposta, armazenando apenas uma resposta 200 que atenda a essas condições. Respostas parciais, bodies vazios, metadata inválida e respostas de falha não são armazenadas.

Armazenar o conteúdo da imagem é diferente de retornar 304 quando o ETag coincide. As gravações no cache são agendadas com waitUntil, e falhas de leitura ou gravação do cache não devem impedir a entrega de uma imagem válida obtida da origem. Se uma solicitação posterior puder usar o cache, a busca pelo Service Binding pode ser ignorada.

A [Cloudflare Cache API](https://developers.cloudflare.com/workers/runtime-apis/cache/) explica solicitações condicionais com ETag e a natureza do cache por data center. Um HIT em um data center não significa que todos tenham HIT. Os cabeçalhos de resposta do Pages Functions não podem ser definidos apenas por meio de [_headers para arquivos estáticos](https://developers.cloudflare.com/pages/configuration/headers/); defina-os na Function.

## Trate os limites da API dinâmica de forma independente

Proteger a API dinâmica é um requisito diferente de armazenar imagens em cache. Neste caso, excluímos os GETs de imagens públicas da contabilização do WAF e, depois de aplicar a alteração, lemos novamente as APIs dinâmicas visadas, o período do limite, a ação e o estado habilitado. Também salvamos a configuração anterior para reversão.

Escolha os limites com base no número de solicitações geradas pela navegação normal e na carga da operação protegida. Também é preciso verificar as condições por plano da [limitação de taxa da Cloudflare](https://developers.cloudflare.com/waf/rate-limiting-rules/). Um valor em uma nota operacional do repositório não comprova que uma regra esteja habilitada em produção.

<figure class="article-diagram" data-layout="boundary" data-tone="teal" data-count="2" aria-labelledby="diagram-public-image-cache-and-api-rate-limits">
  <figcaption>
    <strong id="diagram-public-image-cache-and-api-rate-limits">Imagens públicas e API dinâmica</strong>
    <span>Projete separadamente a reutilização de imagens públicas imutáveis e a proteção de APIs dinâmicas. Imagens privadas ficam fora do escopo.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg></span>
      <strong>GET de imagem pública</strong>
      <span>Verifique o limite da solicitação e reutilize a mesma imagem do cache. Armazene apenas respostas 200 validadas.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m9 12 2 2 4-4"/></svg></span>
      <strong>API dinâmica</strong>
      <span>Proteja o processamento com WAF e a quota da aplicação. Esses limites são separados do cache de imagens.</span>
    </li>
  </ol>
</figure>

## Verifique o conteúdo das imagens em produção

Os testes unitários cobriram a reutilização da mesma imagem pública, a separação por host e asset ID, a verificação da fronteira antes de usar o cache, respostas 304, falhas do cache e respostas que não devem ser armazenadas. Após o CI, confirmamos o deployment em produção por meio de um push ao GitHub e o custom domain; em seguida comparamos o resultado HTTP de imagens representativas, o estado HIT ou MISS informado pela aplicação e o hash dos bytes obtidos.

Em produção, também buscamos o conteúdo e várias imagens consecutivamente e confirmamos que não eram limitados naquela condição de teste de navegação normal. Foi uma verificação de um padrão limitado de solicitações, não um teste da fronteira sob alta carga.

Exibir o estado do cache, por si só, não prova que a imagem correta foi retornada. Verificamos separadamente a obtenção do conteúdo, a obtenção das imagens, a configuração do WAF e o resultado de visualização na UI. Este registro confirma a entrega de imagens representativas; não demonstra navegação contínua de todos os usuários e data centers nem ganhos de desempenho sob alta carga.

Para a divisão entre partes estáticas e dinâmicas do site, consulte [a arquitetura geral de Astro e Cloudflare](/insights/astro-cloudflare-site-architecture/). Para otimizar a entrega de imagens, CSS e outros recursos, consulte [o ajuste de desempenho do Astro](/insights/astro-performance-tuning/).

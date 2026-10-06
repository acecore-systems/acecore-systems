---
title: "Como verificamos a migração do Dynmap para 512px e removemos imagens antigas do R2"
description: "Registro da migração de 89 mapas em oito servidores para imagens de 512px, com verificação pública e limpeza dos dados antigos no R2."
date: "2026-09-27T22:40:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/dynmap-512-migration.webp
tags: ["Tecnologia", "Cloudflare"]
callout:
  type: note
  title: "Escopo verificado"
  text: "Uma auditoria de produção em 11 de setembro de 2026 confirmou a migração e a remoção das imagens antigas. O valor faturado e a taxa de redução de custos em operação normal não foram verificados."
---

Alteramos o formato das imagens de um Dynmap que distribui mapas pelo Cloudflare R2 e limpamos os dados antigos. O escopo incluiu oito servidores e 89 mapas. A ordem foi essencial: conferir as novas imagens publicamente antes de apagar as antigas.

## Migrar em etapas com área de renderização limitada

Padronizamos os mapas de produção em imagens de 512px. Para os 21 mapas que precisavam de renderização adicional, limitamos a área a um raio de 2.000 blocos em torno do centro público. Não exigimos a renderização do mundo inteiro; as atualizações normais continuaram durante a mudança.

Também melhoramos as tentativas após falhas de comunicação com o R2, a preservação de atualizações pendentes após erros de escrita e a distinção entre uma imagem de zoom ausente e um erro de leitura. O [PR #9 do fork do Dynmap](https://github.com/acecore-systems/dynmap/pull/9) registra a retomada das atualizações de zoom após reinício. Isso não impede falhas internas no Cloudflare.

<figure class="article-diagram" data-layout="flow" data-tone="green" data-count="3" aria-labelledby="diagram-dynmap-512-migration">
  <figcaption>
    <strong id="diagram-dynmap-512-migration">Remover os dados antigos somente após verificar as novas imagens</strong>
    <span>Audite a saída pública e o armazenamento antes da limpeza. As imagens antigas não têm backup e a economia em operação normal não foi confirmada.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">1</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M3 5l9-3 9 3v14l-9 3-9-3z M12 2v20 M3 5l9 3 9-3 M3 12l9 3 9-3"/>
        </svg>
      </span>
      <strong>Limitar a área e gerar novas imagens</strong>
      <span>Defina o escopo de 512px e a área de renderização; gere novas imagens enquanto as atualizações normais continuam.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">2</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M10.5 3a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15z M16 16l5 5"/>
        </svg>
      </span>
      <strong>Auditar imagens públicas e armazenamento</strong>
      <span>Verifique separadamente imagens normais e de zoom, recursos web, JSON em tempo real e prefixos de armazenamento previstos.</span>
    </li>
    <li>
      <span class="article-diagram__symbol">
        <span aria-hidden="true">3</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <path d="M4 7h16 M9 7V4h6v3 M7 7l1 14h8l1-14"/>
        </svg>
      </span>
      <strong>Limpar os dados antigos após a auditoria</strong>
      <span>Remova imagens e hashes antigos após a auditoria. Não há backup; se forem necessários, será preciso renderizá-los novamente a partir do mundo.</span>
    </li>
  </ol>
</figure>

## Verificar separadamente o mapa público e o armazenamento

Após a mudança, verificamos uma imagem normal e uma de zoom em cada um dos 89 mapas publicados: 178 imagens no total. Confirmamos os 512px e revisamos os recursos web e a atualização do JSON em tempo real. No R2, auditamos se os caminhos correspondiam aos 89 prefixos de mapas de produção e se 192 prefixos antigos de imagens normais e diurnas estavam vazios.

Só então removemos 11.707.356 objetos de imagens e arquivos hash antigos, cerca de 51,71 GB. Não há backup do conteúdo das imagens antigas; se necessário, elas devem ser renderizadas novamente a partir dos mundos. Mantivemos as imagens atuais, os mundos e os backups de configuração e JAR. Uma auditoria final confirmou que não restavam imagens antigas, dados de transição ou hashes antigos, em vez de depender apenas da conclusão do processo de exclusão.

## Não confundir mudança de capacidade com valor cobrado

Em dois períodos consecutivos de 24 horas que incluíam a migração, os PutObject bem-sucedidos caíram de 240.835 para 90.423. Como ambos incluíam trabalho de migração, a comparação não representa a redução em operação normal nem uma estimativa mensal. O valor faturado não foi verificado.

Em migrações semelhantes, examine separadamente as [métricas de operações e armazenamento do R2](https://developers.cloudflare.com/r2/platform/metrics-analytics/) e confira o mapa público, as imagens atuais e os dados antigos nessa ordem. Defina o escopo da exclusão e a forma de recuperação antes de remover os dados.

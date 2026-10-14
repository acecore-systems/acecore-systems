---
title: "Importar dados do perfil como rascunho: comparar, escolher e publicar com cuidado"
description: "Importe URL públicas, texto, CSV, HTML e JSON para rascunhos de perfil. Abrange mídias limitadas, ordem dos links, preservação após falhas de releitura e decisões de salvar e publicar."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Implementação confirmada; falta a aceitação em uma conta real"
  text: "Importações de arquivos e de URL, imagens e áudio públicos limitados foram implementadas, integradas e implantadas. Foram verificadas interações sintéticas e algumas mídias públicas. Direitos, salvamento e publicação pelo titular real, integrações oficiais e respostas 429 da origem continuam como pendências separadas."
---

Ao transferir um perfil existente para outro editor, compare os valores atuais com os dados candidatos da importação antes de substituir qualquer coisa. Este exemplo anonimizado explica os limites entre importar dados e publicar um perfil.

## Testar a preservação de edições com uma biografia

Edite manualmente a biografia e importe um texto diferente como candidato. Confirme que campos não selecionados permanecem, substituições podem ser revisadas e cancelar restaura o original. Compare depois rascunho e página pública: importar sozinho não deve alterar a publicação.

[OWASP：Validar formato, valores e tamanho da entrada](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html)

## Defina primeiro os formatos de entrada compatíveis

Texto, CSV, HTML estático, JSON comum e modelos agora acompanham a obtenção de candidatos de URL de perfis públicos compatíveis. O HTML é analisado como dados, sem executar scripts ou marcação original na página pública. Comprimento, quantidade, formato e links HTTPS são validados.

Os links mantêm a ordem de aparição e os parênteses correspondentes na URL. Uma URL em Markdown não é coletada duas vezes, mas sua repetição em outro ponto permanece um candidato separado. Ordem e duplicatas dependem da decisão do titular.

## Revise os candidatos antes de substituir valores existentes

Não publique os resultados da análise imediatamente; compare-os primeiro com os valores atuais. A pessoa proprietária escolhe os campos individualmente e pode editar os valores candidatos antes de aplicá-los ao editor. Aplicar um campo escolhido substitui seu valor atual, então revise as diferenças a cada importação. Também é possível desfazer a alteração. Esses controles não garantem a resolução automática de conflitos com edições feitas em outra tela ou por outra pessoa.

Se a releitura da mesma URL ou arquivo falhar, preserve candidatos, edições, seleções, mapeamentos CSV e mídias obtidas. Mostre o erro e indique que são candidatos anteriores. Substitua-os quando a origem, método, texto ou arquivo mudar, ou após uma releitura bem-sucedida. A preservação não aplica, salva nem publica conteúdo.

## Diferenciar obtenção por URL e integração oficial

A obtenção se limita a estruturas públicas conhecidas de Profcard, lit.link, POTOFU, HTML Meishi e foriio. Verifique identidade, exclusões de indexação e consistência dos candidatos, sem ampliar para páginas autenticadas ou destinos proibidos. Isso não comprova integração oficial de login ou API nem migração completa.

O modelo JSON comum e as informações por serviço continuam disponíveis. URL não compatíveis e conteúdo dinâmico usam texto colado ou arquivos. Respostas 401, 403 ou 429 interrompem a obtenção; outro navegador ou API não deve contornar essas restrições.

[OWASP: Limitar destinos e redirecionamentos para prevenir SSRF](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)

## Ver a imagem ou ouvir o áudio obtido antes de escolher

Além de imagens de perfil GIF, cartões de links e publicações conhecidas podem fornecer imagens e títulos de obras. Há suporte limitado a links permitidos do GitHub para imagem, WAV e MP3 no campo de links do titular e a arquivos públicos individuais do Dropbox. Cartões no HTML inicial do POTOFU são admitidos; descrições, páginas extras, players incorporados e a galeria do foriio ficam fora do escopo concluído.

Revalide origem e candidato, host, path, redirecionamentos, MIME, conteúdo, tamanho e prazo. O titular vê ou ouve os mesmos bytes obtidos e confirma direitos, título e descrição. Apenas anexos escolhidos entram em obras ainda não salvas, são preparados pela carga existente e seguem o salvamento normal. Titular, perfil, tipo e estado ready são novamente validados, preservando entradas manuais e o snapshot público.

<figure class="article-diagram" data-layout="flow" data-tone="violet" data-count="4" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Limites de obtenção, seleção, salvamento e publicação</strong>
    <span>Falhas de releitura preservam candidatos anteriores. Importar não altera o snapshot público.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Ler entradas limitadas</strong>
      <span>Validar URL, formatos e restrições.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Comparar e selecionar</strong>
      <span>Conferir mídias e preservar edições.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Salvar rascunho</strong>
      <span>Salvar campos escolhidos e anexos preparados.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">4</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 4v6a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v4"/><path d="M18 4v3a3 3 0 0 1-3 3H9a3 3 0 0 0-3 3v7"/></svg></span>
      <strong>Titular publica</strong>
      <span>Atualizar o snapshot em outra operação.</span>
    </li>
  </ol>
</figure>

## Não deduza qualificações ou direitos a partir do texto importado

As palavras de uma biografia ou página externa não comprovam, por si só, uma qualificação, vínculo, categoria ou licença. Separe textos descritivos que podem entrar como candidatos das informações que exigem verificação de identidade ou solicitação. Se os dados externos mudarem, o perfil confirmado pelo proprietário não será atualizado nem publicado automaticamente.

## Mantenha o salvamento e a publicação como decisões distintas

Aplicar candidatos importados, salvar um rascunho e atualizar a versão pública são ações diferentes. A aceitação também deve cobrir conflitos de salvamento; salvar com sucesso não significa que o perfil foi publicado. Antes de tornar links públicos, incluindo URLs do calendário público, peça ao proprietário que revise os valores; mantenha notas privadas fora dos dados públicos.

## Atualização relacionada: abrir links HTTPS de eventos do calendário público

Uma melhoria de edição, independente da importação de perfis, adiciona links HTTPS a eventos do calendário público. O evento abre o destino diretamente em uma nova aba; eventos sem URL continuam visíveis, mas sem um link acionável. Valide o formato da URL, rejeite credenciais embutidas e limite o tamanho da entrada. Inclua **noopener noreferrer** e informe no nome acessível que uma nova aba será aberta.

Os formulários relacionados também removem o campo de título desnecessário dos horários de disponibilidade para colaboração e os campos de notas privadas. Foram verificados as alterações no banco de dados, o CI, a publicação em produção e as telas com dados de verificação. Ainda não foi confirmada a aceitação com o proprietário entrando na conta, salvando um evento real e publicando-o.

## O que foi confirmado e qual aceitação falta

Implementação, CI e implantação cobrem URL limitadas, GIF, imagens de obras e áudio. Foram verificadas edição e reversão sintéticas e a obtenção de alguns arquivos públicos. O perfil de origem POTOFU ainda retorna 429; obter um arquivo CDN não comprova obter o perfil. A aceitação pelo titular real, de direitos até salvar e publicar, continua pendente. Verificado em 14 de outubro de 2026.

Para conhecer os limites do CSS publicado, consulte [CSS de usuário seguro e temas públicos versionados](/insights/user-css-versioned-theme-safety/). Para os limites de login, consulte [Ciclo de vida de sessões entre serviços](/insights/multi-service-session-lifecycle/).

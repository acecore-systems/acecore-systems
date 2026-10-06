---
title: "Importar dados do perfil como rascunho: comparar, escolher e publicar com cuidado"
description: "Uma implementação geral para importar perfis de texto, CSV, HTML estático e JSON comum. Saiba como comparar valores atuais, escolher campos para substituir ou desfazer alterações e manter o salvamento separado da publicação."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T08:52:00+09:00"
author: gui
image: /images/insights/covers/profile-import-draft-boundaries-cover-v1.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Implementação confirmada; falta a aceitação em uma conta real"
  text: "A importação de texto, CSV, HTML estático e JSON comum foi implementada, integrada e publicada em produção. A aceitação completa, da importação ao salvamento e à publicação em uma conta real, continua pendente. A obtenção automática por URLs específicas de serviços e a migração de imagens ou áudio ficam fora do escopo concluído."
---

Ao transferir um perfil existente para outro editor, compare os valores atuais com os dados candidatos da importação antes de substituir qualquer coisa. Este exemplo anonimizado explica os limites entre importar dados e publicar um perfil.

## Defina primeiro os formatos de entrada compatíveis

Além das opções iniciais de texto, CSV e HTML estático, o fluxo agora lê um arquivo JSON comum e oferece um modelo para download. Analisar conteúdo colado ou um arquivo é diferente de visitar uma URL para buscar os dados. Formatos de exportação específicos de cada serviço, busca automática por URL, migração de imagens ou áudio, páginas dinâmicas e APIs de serviços externos não foram concluídos.

Trate o HTML apenas como dados de entrada. Não execute scripts nem renderize o próprio HTML importado na página pública. Limite o tamanho do texto, os campos, os links e os formatos de entrada; depois transforme a origem em candidatos de texto adequados ao perfil.

## Revise os candidatos antes de substituir valores existentes

Não publique os resultados da análise imediatamente; compare-os primeiro com os valores atuais. A pessoa proprietária escolhe os campos individualmente e pode editar os valores candidatos antes de aplicá-los ao editor. Aplicar um campo escolhido substitui seu valor atual, então revise as diferenças a cada importação. Também é possível desfazer a alteração. Esses controles não garantem a resolução automática de conflitos com edições feitas em outra tela ou por outra pessoa.

## Separe o JSON comum do suporte específico a cada serviço

A interface mostra o estado de suporte de 7 serviços de atividade. Conseguir ler dados no formato comum não significa que o fluxo possa buscar um perfil diretamente na URL de cada serviço. Para URLs não compatíveis, ele orienta a importação por meio de conteúdo colado. Exibir o estado dos 7 serviços não significa que exportações próprias ou integrações por API tenham sido implementadas para todos.

Com dados sintéticos, foram verificados a importação JSON, a comparação com valores existentes, a aplicação de campos selecionados, a reversão e o layout móvel. A aceitação do fluxo completo, da importação ao salvamento e à publicação em uma conta real, ainda precisa ser feita separadamente.

## Não deduza qualificações ou direitos a partir do texto importado

As palavras de uma biografia ou página externa não comprovam, por si só, uma qualificação, vínculo, categoria ou licença. Separe textos descritivos que podem entrar como candidatos das informações que exigem verificação de identidade ou solicitação. Se os dados externos mudarem, o perfil confirmado pelo proprietário não será atualizado nem publicado automaticamente.

## Mantenha o salvamento e a publicação como decisões distintas

Aplicar candidatos importados, salvar um rascunho e atualizar a versão pública são ações diferentes. A aceitação também deve cobrir conflitos de salvamento; salvar com sucesso não significa que o perfil foi publicado. Antes de tornar links públicos, incluindo URLs do calendário público, peça ao proprietário que revise os valores; mantenha notas privadas fora dos dados públicos.

## Atualização relacionada: abrir links HTTPS de eventos do calendário público

Uma melhoria de edição, independente da importação de perfis, adiciona links HTTPS a eventos do calendário público. O evento abre o destino diretamente em uma nova aba; eventos sem URL continuam visíveis, mas sem um link acionável. Valide o formato da URL, rejeite credenciais embutidas e limite o tamanho da entrada. Inclua **noopener noreferrer** e informe no nome acessível que uma nova aba será aberta.

Os formulários relacionados também removem o campo de título desnecessário dos horários de disponibilidade para colaboração e os campos de notas privadas. Foram verificados as alterações no banco de dados, o CI, a publicação em produção e as telas com dados de verificação. Ainda não foi confirmada a aceitação com o proprietário entrando na conta, salvando um evento real e publicando-o.

<figure class="article-diagram" data-layout="boundary" data-tone="violet" data-count="2" aria-labelledby="diagram-profile-import-draft-boundaries">
  <figcaption>
    <strong id="diagram-profile-import-draft-boundaries">Limites da importação e dos links do calendário</strong>
    <span>São funções de edição distintas. A aceitação do salvamento e da publicação por uma pessoa conectada ainda não foi verificada.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M6 3h8l4 4v14H6z"/><path d="M14 3v5h5M9 12h6M9 16h4"/></svg></span>
      <strong>Importar perfil</strong>
      <span>A pessoa revisa e edita os formatos compatíveis. Salvar e publicar são ações separadas.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M14 15h5m-2-2 2 2-2 2"/></svg></span>
      <strong>Link do calendário público</strong>
      <span>Abra links HTTPS em uma nova aba segura. Eventos sem link não são interativos.</span>
    </li>
  </ol>
</figure>

## O que foi confirmado e qual aceitação falta

A implementação, integração e publicação em produção da importação por texto, CSV, HTML estático e JSON comum foram confirmadas. No entanto, ainda não foi concluído um teste completo com uma pessoa real, desde a importação e edição até o salvamento e a conferência do resultado publicado. A ideia mais ampla de criar automaticamente um perfil completo a partir da URL de um serviço de atividade também não está concluída.

Para conhecer os limites do CSS publicado, consulte [CSS de usuário seguro e temas públicos versionados](/insights/user-css-versioned-theme-safety/). Para os limites de login, consulte [Ciclo de vida de sessões entre serviços](/insights/multi-service-session-lifecycle/).

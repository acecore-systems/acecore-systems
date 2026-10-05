---
title: "Importar dados do perfil como rascunho: revisão, substituição e limites da publicação"
description: "Uma implementação generalizada para importar dados de perfil de texto, CSV e HTML estático. Explica como comparar valores atuais, selecionar e substituir campos, separar o salvamento da publicação e identificar entradas não compatíveis."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/profile-import-draft-boundaries.webp
tags: ["Web", "Import", "Security"]
callout:
  type: note
  title: "Escopo da implementação da etapa 1"
  text: "A implementação, a integração e o deploy em produção da importação de texto, CSV e HTML estático foram confirmados. A aceitação completa em uma conta real, da importação ao salvamento e à publicação, continua pendente; a busca direta por URL e a migração de imagens ou áudio não fazem parte desta entrega."
---

Ao transferir um perfil existente para outro editor, compare primeiro o valor atual com o candidato importado e decida o que será substituído. Este relato generalizado de uma implementação da etapa 1 explica os limites entre importar e publicar.

## Defina primeiro os formatos de entrada aceitos

Nesta etapa, são aceitos texto, CSV e HTML estático. Analisar conteúdo colado ou um arquivo é diferente de acessar uma URL para buscar o conteúdo. JSON, imagens, áudio, páginas dinâmicas e APIs de serviços externos não fazem parte da implementação concluída.

Trate o HTML apenas como dado de entrada: não execute scripts nem renderize o próprio HTML importado na página pública. Defina limites para o tamanho do texto, campos, links e formatos de entrada; em seguida, transforme a origem em candidatos de texto necessários ao perfil.

## Separe a revisão dos candidatos da edição do perfil

Não publique os resultados analisados imediatamente; compare primeiro os valores atuais com os candidatos. A pessoa proprietária seleciona os campos individualmente e pode editar os valores candidatos antes de aplicá-los ao editor. Cada campo selecionado substitui o valor atual, portanto confira as diferenças em toda importação. É possível desfazer antes de salvar, mas isso não significa que a proteção automática de edições manuais ou a mesclagem de conflitos esteja concluída.

## Não deduza qualificações ou direitos do texto importado

Expressões em uma biografia ou página externa não comprovam automaticamente uma qualificação, afiliação, categoria ou licença. Mantenha o texto descritivo que pode ser importado como candidato separado das informações que exigem verificação de identidade ou uma solicitação. Novas informações em outros sites não atualizam nem publicam automaticamente o perfil confirmado pela pessoa proprietária.

## Mantenha salvar e publicar como decisões separadas

Aplicar candidatos importados, salvar o rascunho e atualizar a versão pública são ações distintas. Os testes de aceitação ainda precisam cobrir conflitos ao salvar; o sucesso do salvamento não significa que o perfil foi publicado. Revise os links, inclusive URLs de calendários públicos, antes de publicar seus valores e não misture notas privadas com os dados públicos.

## Atualização relacionada: abrir links HTTPS em eventos públicos

Uma melhoria de edição independente da importação permite adicionar links HTTPS aos eventos do calendário público. O evento abre diretamente o destino em outra aba; eventos sem URL aparecem sem um link acionável. Valide o formato, a ausência de credenciais embutidas e o tamanho da URL. Use `noopener noreferrer` e indique a abertura de outra aba no nome acessível.

Os formulários relacionados também removem um título desnecessário nos horários disponíveis para colaboração e os campos de notas particulares. Foram verificados banco de dados, CI, publicação em produção e telas com dados de verificação; o proprietário entrar, salvar um evento real e publicá-lo ainda não foi validado.

## O que foi verificado e o que falta aceitar

A implementação, a integração e o deploy em produção do fluxo de importação da etapa 1 foram confirmados. No entanto, ainda não foi concluído um teste integral com uma pessoa usuária real, desde a importação e edição até o salvamento e a conferência da exibição publicada. A ideia mais ampla de criar automaticamente um perfil completo a partir da URL de uma plataforma de atividade também não está concluída.

Para os limites do CSS publicado, consulte [CSS de usuário seguro e temas públicos com versões fixas](/insights/user-css-versioned-theme-safety/). Para os limites de login, consulte [Ciclos de sessão entre serviços](/insights/multi-service-session-lifecycle/).

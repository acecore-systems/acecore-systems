---
title: "Como lidar com segurança com CSS de usuários e temas públicos"
description: "Uma visão geral da edição de perfis com controles gráficos e CSS escrito à mão. Aborda limites de CSS permitido, rascunhos e versões publicadas, versões imutáveis de temas, remoção da listagem e suspensão pela operação."
date: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Verificar a implementação não equivale à aceitação completa por usuários"
  text: "Este caso anonimizado abrange implementação, alteração de banco de dados, entrega em produção e renderização de dados de teste. Na data da revisão, não havia temas públicos. O envio e a aplicação de ponta a ponta por usuários reais, assim como vendas pagas, não foram demonstrados."
---

Um editor de perfil que permite ajustar cores e espaçamentos por uma interface gráfica e, opcionalmente, escrever uma sintaxe CSS limitada precisa cuidar tanto da usabilidade quanto da segurança do código exibido em páginas públicas. Este caso anonimizado ajuda a separar edição e distribuição.

## Limite o CSS com uma gramática pequena

Não insira CSS arbitrário diretamente em uma página pública. Analise a sintaxe e permita somente componentes, propriedades e valores compatíveis. A implementação atual aceita intencionalmente uma gramática pequena; a edição mais ampla de CSS continua sendo um pedido adicional não concluído. Este caso limita as regras a classes selecionadas e a um conjunto reduzido de pseudoclasses, rejeitando URLs externas, at-rules, seletores de atributo irrestritos, delimitadores HTML e um número excessivo de regras.

Restrinja o CSS aceito a uma área de perfil definida, gere-o novamente e valide-o também antes da publicação. Mantenha as configurações da interface gráfica e o texto escrito à mão disponíveis para edição, mas fixe no snapshot público somente o CSS validado. O escopo, por si só, não torna CSS arbitrário seguro. Consulte a [especificação W3C Selectors](https://www.w3.org/TR/selectors-4/) para conhecer os conceitos de seletores.

## Separe prévia, rascunho e publicação

Experimentar ou aplicar um tema altera um rascunho. A página pública só muda depois que a pessoa responsável a publica. Poder editar novamente o CSS escrito à mão também é diferente de enviar esse original aos visitantes. Detecte conflitos ao salvar e torne as tentativas idempotentes para que reenviar uma operação não atualize uma versão ou um rascunho duas vezes.

## Não deixe a atualização de outra pessoa alterar um design em uso

Separe as informações mutáveis da listagem de temas das versões imutáveis. A pessoa importa um ID de versão específico, portanto uma nova versão publicada pelo autor não altera silenciosamente um rascunho ou design já publicado. Preserve a origem, a versão e a atribuição da licença após a edição. Se um perfil público passar a ser privado, não deixe o nome ou a imagem do rascunho do autor vazar para o tema distribuído.

## Diferencie remoção da listagem e suspensão pela operação

O autor pode retirar um tema da listagem e impedir novas descobertas e aplicações sem necessariamente revogar de imediato uma versão já fixada. A suspensão operacional de um tema perigoso exige outro limite: parar de servir seu CSS, inclusive o CSS em snapshots existentes, e voltar à aparência padrão. Depois de restaurar um snapshot antigo, confira o estado atual de suspensão para impedir que o CSS anterior à suspensão reapareça.

## O que verificar antes de publicar

Teste seletores fora do escopo, solicitações externas, tamanho da entrada, conflitos ao salvar, tentativas repetidas, alterações de privacidade do autor, remoção da listagem, suspensão operacional e restauração. O código, a entrega e a exibição de dados de teste foram verificados, mas isso não é um teste de ponta a ponta em que uma pessoa real envia um tema e outra o aplica. Os termos da licença também não garantem que o CSS enviado ao navegador nunca será copiado.

Para a entrada da edição, consulte [Limites de rascunho na importação de perfis](/pt/insights/profile-import-draft-boundaries/); para a operação do CMS, consulte o [guia do Sveltia CMS](/pt/insights/cms-selection-and-turnstile/).

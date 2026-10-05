---
title: "CSS de usuários e temas públicos com segurança: fonte compartilhada, escopo de renderização e versões fixas"
description: "Um projeto anonimizado de edição de perfil em que a interface gráfica e a edição direta compartilham uma única fonte de CSS. Aborda sintaxe CSS ampla dentro dos limites de renderização, rascunhos e versões publicadas, versões imutáveis de temas, remoção da listagem e suspensão operacional."
date: "2026-10-06T01:10:00+09:00"
lastUpdated: "2026-10-06T02:20:00+09:00"
author: gui
image: /images/insights/user-css-versioned-theme-safety-20261006-v2.webp
tags: ["CSS", "Security", "Web"]
callout:
  type: note
  title: "Verificar a implementação não equivale à aceitação completa pelos usuários"
  text: "Foram confirmados a alteração de banco de dados, a publicação em produção e a exibição de dados de teste da loja de temas com versões fixas. A expansão para compartilhar a fonte de CSS com a interface gráfica foi confirmada integrada à main, com CI aprovada; dentro do escopo desta auditoria, não foram confirmadas a publicação dessa expansão em produção nem a aceitação com login. O envio e a aplicação de temas de ponta a ponta por usuários reais, assim como vendas pagas, não foram demonstrados."
---

Um editor de perfil que permite ajustar cores e espaçamentos por uma interface gráfica e editar todo o layout com CSS precisa cuidar tanto da usabilidade quanto da segurança do código exibido em páginas públicas. Este caso anonimizado descreve os limites entre edição e distribuição.

## Compartilhar a mesma fonte de CSS entre a interface gráfica e a edição direta

Em uma expansão posterior, o CSS completo passou a ser a fonte principal do tema, e a interface gráfica foi alterada para editar as mesmas declarações de CSS. Comentários escritos à mão, declarações que a interface não gerencia e regras responsivas são preservados. O formato anterior, com configurações da interface e CSS adicional, também é migrado para uma folha de estilos completa e editável. Alterar apenas configurações auxiliares usadas para exibir uma lista de opções não significa que o CSS renderizado mudou.

As expansões de backend e frontend foram integradas, cada uma, à respectiva branch main, e CI e testes de implementação foram verificados. Dentro do escopo desta auditoria, isso não comprova publicação em produção nem um fluxo completo testado por um usuário autenticado.

## Suportar sintaxe CSS ampla dentro do limite de renderização

Os limites iniciais baseados em uma pequena lista de propriedades permitidas foram ampliados para incluir Grid e Flex, variáveis, gradientes, pseudo-elementos, transformações, animações e regras como @media, @supports e @container. Isso não significa inserir CSS arbitrário sem inspeção. A árvore sintática é analisada, e cada ramo do seletor é confinado a descendentes da região de perfil designada. O mesmo limite se aplica dentro de regras condicionais; áreas externas de operação e indicadores de licença não fazem parte do tema. [W3C Selectors](https://www.w3.org/TR/selectors-4/) é um ponto de partida para consultar a especificação de seletores.

Os nomes de variáveis e keyframes são reescritos com nomes exclusivos no CSS publicado para evitar conflitos com variáveis da interface externa ou animações de outro tema. Os nomes originais permanecem disponíveis para edição. O wrapper externo de renderização também usa containment e isolation para confinar os efeitos de regras amplas de layout à região de perfil.

São rejeitados a obtenção de recursos externos, regras globais como @import e @font-face, sintaxe que não pode ser analisada, CSS nesting, o terminador style do HTML e referências a animações cujos nomes não possam ser resolvidos com segurança. Os tamanhos da entrada e do resultado gerado também são verificados. Na publicação e no carregamento de um snapshot, a consistência entre o escopo, os nomes exclusivos e a string CSS canonical validada é conferida novamente. Suportar sintaxe ampla não garante a mesma renderização em todos os navegadores.

## Separar prévia, rascunho e publicação

Experimentar ou aplicar um tema altera um rascunho. A página pública só muda quando o proprietário publica. Poder voltar a editar o CSS escrito à mão também é diferente de entregar esse texto original aos visitantes. O contrato de salvamento detecta conflitos e evita duplicar uma versão ou atualizar o rascunho novamente quando uma operação é repetida.

## Não deixar a atualização de outro autor alterar um design em uso

As informações editáveis da listagem do tema são separadas de suas versões imutáveis. O usuário importa uma versão específica pelo ID; quando o autor publica uma nova versão, os rascunhos e versões publicadas existentes não mudam automaticamente. A origem e a versão aplicadas, bem como a fonte dos termos de uso, permanecem associadas após a edição. Se um perfil público voltar a ser privado, o nome e a imagem do rascunho do autor não devem vazar para o tema distribuído.

## Diferenciar remoção da listagem e suspensão operacional

Quando o autor remove um tema da listagem, novas descobertas e aplicações são interrompidas, mas isso não revoga necessariamente de imediato os usos existentes de uma versão fixada. A suspensão operacional de um tema perigoso tem outro limite: interromper sua obtenção pública e o CSS de snapshots existentes, além de restaurar a aparência padrão. Mesmo ao voltar a um snapshot antigo, o estado atual de suspensão é verificado para não reativar CSS anterior à suspensão.

## O que verificar antes de publicar

Verifique seletores fora do escopo, solicitações externas, tamanho da entrada, conflitos de salvamento, reenvios, a mudança do perfil do autor para privado, remoção da listagem, suspensão operacional e reversão. Foram confirmadas a publicação em produção da loja de versões fixas e a exibição com dados de teste, mas dentro do escopo desta auditoria não foram confirmadas a publicação em produção nem a aceitação com login da expansão do editor CSS. Uma verificação anterior encontrou zero temas públicos; isso não informa a quantidade atual. Não foram demonstrados testes completos com usuários reais enviando e aplicando temas nem vendas pagas. Os termos de uso não podem garantir que o CSS entregue ao navegador jamais seja copiado.

Para a entrada de edição, consulte [a importação de perfil como rascunho](/insights/profile-import-draft-boundaries/); para operações do CMS, consulte [o guia do Sveltia CMS](/insights/cms-selection-and-turnstile/).

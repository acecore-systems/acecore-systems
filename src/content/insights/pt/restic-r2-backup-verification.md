---
title: "Backups restic no R2: do armazenamento à restauração verificada"
description: "Acompanhe separadamente a atualidade dos snapshots, integridade e restauração, indicando a recuperação de aplicações ainda não testada."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-06T01:10:00+09:00"
author: gui
image: /images/insights/restic-r2-backup-verification.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "Recuperação completa exige outra verificação"
  text: "Foram realizados backups periódicos, monitoramento, retenção e extração/integridade de dados selecionados. Não foram demonstrados o início de todas as aplicações nem a recuperação de desastres com credenciais separadas."
---

Um job concluído não prova que os dados necessários possam ser recuperados. Este caso interno generalizado avalia armazenamento, integridade, restauração e recuperação do serviço separadamente. Não documenta migração concluída de outro serviço.

## Definir origem e sucesso

O projeto usa criptografia e deduplicação do restic com a API compatível com S3 do R2. Confira operações na [tabela de compatibilidade](https://developers.cloudflare.com/r2/api/s3/api/). Para bancos ativos, planeje captura consistente com dumps ou pausa da aplicação, quando adequado.

## Monitorar a atualidade

Acompanhe separadamente o último snapshot bem-sucedido, atrasos, falhas e resultados de integridade/restauração. Iniciar o job não é sucesso. Aviso malsucedido também difere de backup malsucedido.

## Verificar integridade e extração

`restic check` padrão e verificações que leem dados têm escopos distintos. `--read-data` lê todos os dados; registre o escopo de verificações parciais. Combine [verificações do repositório](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [restauração](https://restic.readthedocs.io/en/stable/050_restore.html) em local isolado e comparação de conteúdo ou hashes. Extrair arquivos não verifica o início da aplicação.

## Usar restic para retenção

Selecione snapshots pela política do restic e use `forget`, `prune` e `check`, conferindo previamente o que ficará. Apagar objetos no R2 apenas pela idade pode remover dados compartilhados necessários a snapshots mantidos. Siga a [documentação de retenção](https://restic.readthedocs.io/en/stable/060_forget.html); limpar imagens de distribuição é outro caso.

## Verificações pendentes

Foram realizados operação periódica, monitoramento/avisos, retenção e extração/integridade de dados selecionados. Faltam validar todas as aplicações iniciando, recuperação de configuração e dependências e acesso a credenciais separadas. Tempo de recuperação e perda aceitável exigem medição. Não se afirma recuperação completa nem economia comprovada.

## Atualização de 6 de outubro de 2026: locks antigos e concorrência nos testes de restauração

Em uma alteração adicional, verifica-se a atividade dos processos no mesmo host antes de executar o desbloqueio normal do restic, que trata apenas locks antigos. Não se usa a opção que remove todos os locks, inclusive os de operações em andamento. Conflitos usam novas tentativas limitadas com <code>--retry-lock</code>; testes de restauração e prune não reiniciam o processo indefinidamente quando falham. Verificar a atividade em um host não comprova que não exista operação concorrente em outro host.

Os dados são extraídos com <code>restore --verify</code> para um diretório temporário isolado. Depois de verificar os arquivos necessários e sua integridade, registra-se a correspondência entre o snapshot verificado e a configuração. Primeiro confirma-se a restauração dos dados-alvo; em seguida, revisa-se o que deve ser mantido antes do prune. A atualidade do backup é determinada por um snapshot que realmente terminou com sucesso, não pelo início do processo ou por suas novas tentativas.

A restauração confirmada dos dados-alvo continua distinta da recuperação completa, que inclui iniciar todas as aplicações e recuperar suas credenciais. Para o tratamento de janelas de manutenção e falhas de coleta, consulte também [Monitoramento e investigação de incidentes](/insights/openclaw-monitoring-investigation/).

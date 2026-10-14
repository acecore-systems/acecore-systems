---
title: "Backups restic no R2: do armazenamento à restauração verificada"
description: "Separar frescor, integridade e restauração no R2/restic: versão PostgreSQL após atualização do OS, runtime isolado Samba, testes DB/LDAP e condições da recuperação completa."
date: "2026-09-30T20:53:00+09:00"
lastUpdated: "2026-10-15T00:00:00+09:00"
author: gui
image: /images/insights/covers/restic-r2-backup-verification-cover-v1.webp
tags: ["Cloudflare R2", "restic", "Backup"]
callout:
  type: note
  title: "Recuperação completa exige outra verificação"
  text: "Foram realizados backups periódicos, monitoramento, retenção e extração/integridade de dados selecionados. Não foram demonstrados o início de todas as aplicações nem a recuperação de desastres com credenciais separadas."
---

Um job concluído não prova que os dados necessários possam ser recuperados. Este caso interno generalizado avalia armazenamento, integridade, restauração e recuperação do serviço separadamente. Não documenta migração concluída de outro serviço.

## Fixar o ID do snapshot e um objetivo de recuperação

Registre o ID e restaure os arquivos necessários em um destino vazio e isolado. Verifique referências e permissões das configurações, ou carregue o banco em isolamento. Anote o tempo. Repita as mesmas verificações periodicamente para comparar atualidade e escopo recuperável.

[restic：Restaurar em um destino isolado](https://restic.readthedocs.io/en/stable/050_restore.html)

## Definir origem e sucesso

O projeto usa criptografia e deduplicação do restic com a API compatível com S3 do R2. Confira operações na [tabela de compatibilidade](https://developers.cloudflare.com/r2/api/s3/api/). Para bancos ativos, planeje captura consistente com dumps ou pausa da aplicação, quando adequado.

## Monitorar a atualidade

Acompanhe separadamente o último snapshot bem-sucedido, atrasos, falhas e resultados de integridade/restauração. Iniciar o job não é sucesso. Aviso malsucedido também difere de backup malsucedido.

## Verificar integridade e extração

`restic check` padrão e verificações que leem dados têm escopos distintos. `--read-data` lê todos os dados; registre o escopo de verificações parciais. Combine [verificações do repositório](https://restic.readthedocs.io/en/stable/045_working_with_repos.html), [restauração](https://restic.readthedocs.io/en/stable/050_restore.html) em local isolado e comparação de conteúdo ou hashes. Extrair arquivos não verifica o início da aplicação.

## Usar restic para retenção

Selecione snapshots pela política do restic e use `forget`, `prune` e `check`, conferindo previamente o que ficará. Apagar objetos no R2 apenas pela idade pode remover dados compartilhados necessários a snapshots mantidos. Siga a [documentação de retenção](https://restic.readthedocs.io/en/stable/060_forget.html); limpar imagens de distribuição é outro caso.

## Conferir o PostgreSQL do teste após atualizar o OS

Após atualizar o OS, o teste falhou por referenciar o caminho fixo de um major antigo do PostgreSQL. A mudança escolhe o major instalado mais recente em ordem numérica com todas as ferramentas executáveis de servidor, usando a mesma versão para inicializar, iniciar, restaurar, conferir e encerrar. Sem conjunto completo, falha em vez de conectar a outro banco em execução e declarar sucesso.

Confira formato e compatibilidade do destino na [documentação PostgreSQL de SQL dump e restauração](https://www.postgresql.org/docs/current/backup-dump.html). Seleção automática não garante todo dump. A mudança foi verificada por testes e CI; restaurar o banco real do R2 continua uma aceitação separada.

## Recriar runtime dentro do Samba isolado

Ler o banco restaurado não bastava: sem runtime para sockets internos o DC isolado não iniciava. Separe namespaces de rede, PID e mount, confirme isolamento e só dentro crie tmpfs privado em `/run` e `/run/samba`. Use configuração e destinos gerados para isolamento, sem misturar testes ao runtime e listeners de produção.

Com [samba-tool oficial, domain backup restore e dbcheck](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), foram verificados banco restaurado, início do DC e prontidão LDAP. Esse caminho Samba foi validado com backup R2 real. Recuperar logins de todos os aplicativos, conexões e credenciais separadamente guardadas ainda exige outros testes. Verificado em 14 de outubro de 2026.

<figure class="article-diagram" data-layout="layers" data-tone="amber" data-count="3" aria-labelledby="diagram-restic-r2-backup-verification">
  <figcaption>
    <strong id="diagram-restic-r2-backup-verification">Do snapshot à restauração por serviço e recuperação completa</strong>
    <span>Samba DC, DB e LDAP foram verificados com R2 real; PostgreSQL real e recuperação global ficam separados.</span>
  </figcaption>
  <ol class="article-diagram__nodes">
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">1</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v5h5M8 12h8M8 16h6"/></svg></span>
      <strong>Snapshot bem-sucedido e frescor</strong>
      <span>Registrar sucesso real e escopo.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">2</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M8 10l2 2 3-4"/></svg></span>
      <strong>Recriar isolamento</strong>
      <span>Conferir versão DB, rede/PID/mount e runtime.</span>
    </li>
    <li>
      <span class="article-diagram__symbol"><span aria-hidden="true">3</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></svg></span>
      <strong>Testar início do serviço</strong>
      <span>Samba DB e LDAP verificados; recuperação de todos os apps não demonstrada.</span>
    </li>
  </ol>
</figure>

## Verificações pendentes

Foram realizados operação periódica, monitoramento/avisos, retenção e extração/integridade de dados selecionados. Faltam validar todas as aplicações iniciando, recuperação de configuração e dependências e acesso a credenciais separadas. Tempo de recuperação e perda aceitável exigem medição. Não se afirma recuperação completa nem economia comprovada.

## Atualização de 6 de outubro de 2026: locks antigos e concorrência nos testes de restauração

Em uma alteração adicional, verifica-se a atividade dos processos no mesmo host antes de executar o desbloqueio normal do restic, que trata apenas locks antigos. Não se usa a opção que remove todos os locks, inclusive os de operações em andamento. Conflitos usam novas tentativas limitadas com <code>--retry-lock</code>; testes de restauração e prune não reiniciam o processo indefinidamente quando falham. Verificar a atividade em um host não comprova que não exista operação concorrente em outro host.

Os dados são extraídos com <code>restore --verify</code> para um diretório temporário isolado. Depois de verificar os arquivos necessários e sua integridade, registra-se a correspondência entre o snapshot verificado e a configuração. Primeiro confirma-se a restauração dos dados-alvo; em seguida, revisa-se o que deve ser mantido antes do prune. A atualidade do backup é determinada por um snapshot que realmente terminou com sucesso, não pelo início do processo ou por suas novas tentativas.

A restauração confirmada dos dados-alvo continua distinta da recuperação completa, que inclui iniciar todas as aplicações e recuperar suas credenciais. Para o tratamento de janelas de manutenção e falhas de coleta, consulte também [Monitoramento e investigação de incidentes](/insights/openclaw-monitoring-investigation/).

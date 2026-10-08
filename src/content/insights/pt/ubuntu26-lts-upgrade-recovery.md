---
title: "Migração e recuperação do Ubuntu 26.04: AD, backups e atualização sem jogadores"
description: "Lições de seis servidores Ubuntu: compatibilidade do Samba e SSSD, recuperação da conectividade, restauração real do R2 e manutenção do Velocity sem jogadores."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "A versão exibida não comprova a conclusão"
  text: "Verifique reinicialização normal, conexões, retorno automático dos serviços, configuração preservada e restauração dos backups pertinentes. Login interativo, jogo real e recuperação completa de desastres exigem testes separados."
processFigure:
  eyebrow: "Critérios de manutenção"
  title: "Das evidências iniciais à restauração após a atualização"
  description: "Se uma etapa falhar, registre o destino e o estado e faça uma recuperação limitada antes de continuar."
  variant: inline
  steps:
    - title: "Escopo e acesso de recuperação"
      description: "Verificar dependências, condições de parada, configuração e backups."
      icon: i-lucide-server
      accent: brand
    - title: "Parada e atualização"
      description: "Controlar novas conexões, encerrar corretamente e aplicar a atualização autorizada."
      icon: i-lucide-wrench
      accent: amber
    - title: "Inicialização e restauração"
      description: "Testar por outra rota, restabelecer os estados e restaurar a mesma geração."
      icon: i-lucide-shield-check
      accent: emerald
---

Atualizar o Ubuntu também exige preservar autenticação, rede, backups e dependências de inicialização. O resultado esperado é voltar à operação normal depois da reinicialização.

Em 8 de outubro de 2026, concluímos a migração ou atualização de seis servidores Ubuntu para web, autenticação, bots, CTF e um proxy Minecraft. Dois passaram de 24.04 para 26.04; quatro já usavam 26.04 e receberam atualizações normais e uma reinicialização. Este artigo generaliza os problemas e as verificações observados.

## Separar migração de versão e atualização normal

Uma migração LTS segue o [procedimento oficial do Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/) com `do-release-upgrade`. As mudanças de pacotes e o tempo necessário diferem da atualização de um host que já utiliza 26.04. Uma condição de «nenhuma remoção» usada na manutenção normal não deve ser transferida sem ajustes para uma migração.

Primeiro identificamos funções, dependências, indisponibilidade aceitável e acesso ao console de recuperação. Guardamos Netplan, SSH, autenticação, serviços, contêineres, timers e holds do APT em um local exclusivo de root. Esses arquivos podem conter segredos e não devem ser publicados.

Trabalhamos em um host de cada vez e verificamos o fim de outras manutenções. Atualizar a frota inteira não autoriza iniciar backups deliberadamente parados ou alterar máquinas com outro sistema operacional.

## Restaurar antes de confiar nos backups

Um armazenamento bem-sucedido não comprova a recuperação. Antes da atualização, restauramos uma geração específica do R2 em uma área separada e verificamos bancos de dados, configurações e conteúdo ZIP conforme o destino. Veja também a [verificação de backups com R2 e restic](/insights/restic-r2-backup-verification/).

Para Samba AD, usamos as [operações de backup do `samba-tool`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html) e testamos o banco restaurado e as respostas LDAP em um DC isolado. Copiar arquivos de uma base em execução não era suficiente.

Nosso verificador do Samba 4.23 falhava porque mudar os caminhos de DB e PID não criava `/run/samba/nmbd`, necessário aos sockets internos. Passamos a confirmar o isolamento dos namespaces de rede e montagem antes de preparar um `/run` próprio dentro da verificação. Isso não significa montar um tmpfs de testes sobre o `/run` do host de produção.

Antes de usar uma imagem de disco do provedor, confira restrições de inicialização durante a criação, tamanho, duração e unidades de cobrança. No trabalho adicional usamos backups de aplicações verificados e configurações do SO salvas, sem novas imagens. Isso não garante a cobertura de uma imagem completa. Os backups deliberadamente parados permaneceram parados.

## Conferir primeiro o pacote Samba AD/DC

O Ubuntu 26.04 exige `samba-ad-dc` para AD/DC. Verifique sua presença no sistema anterior conforme as [notas de migração LTS](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases).

```bash
dpkg-query -W samba-ad-dc
```

Se faltar, confirme o papel AD/DC e as fontes oficiais do APT e instale antes da migração. Preservar o domínio existente não exige recriá-lo nem elevar seu nível funcional.

## Inspecionar o estado após uma atualização interrompida

O servidor de autenticação tinha pacotes não configurados e não possuía o initrd do novo kernel. Inspecionamos pelo console, concluímos a configuração necessária e geramos o initrd, depois voltamos à inicialização normal com systemd.

Uma inicialização temporária com `init=/bin/bash` contorna a autenticação normal. Obtivemos autorização para essa inicialização e começamos pela inspeção somente leitura. Não mudamos permanentemente GRUB ou senhas e removemos a supressão temporária do início de serviços.

Estes são exemplos de verificação, não um script universal de reparo. Revise as saídas antes de publicá-las para evitar segredos ou dados de conexão.

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

Se o código de saída da atualização original não foi registrado, não invente um resultado de sucesso. Documente os reparos e as observações posteriores. A presença dos arquivos do kernel não prova uma inicialização normal com ele.

## Reparar rede e autenticação com base em evidências

Arquivos Netplan corretos podem ser regenerados por outro componente ao iniciar. Em nosso modelo de gestão, comparamos os hashes originais e desativamos apenas a regeneração pela [configuração de rede do cloud-init](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). Isso não é uma orientação universal para redes gerenciadas pelo provedor.

A ausência de SSH também pode vir das dependências de inicialização. O journal mostrou um ciclo entre sockets antigos de encaminhamento LDAP e a VPN, levando o systemd a cancelar sua inicialização. Após verificar listeners e tráfego atuais, desativamos apenas os sockets obsoletos. Um serviço inactive aguardando ativação por socket não representa, por si só, uma falha.

O SSSD rejeitava `config_file_version` e apresentava conflito entre ativação por monitor e socket. Consultamos as [mudanças do SSSD 2.10](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes) e a [referência do Ubuntu](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html), preservamos proprietário e permissões e limitamos as alterações. Não desativamos todos os sockets do SSSD.

Depois verificamos `sssctl config-check`, responders NSS/PAM/PAC, estado Online do domínio e `adcli testjoin` com a chave de máquina existente. Não foi necessário substituir chaves nem ingressar novamente no domínio.

| Problema observado         | Evidência                           | Verificação após reparo                   |
| -------------------------- | ----------------------------------- | ----------------------------------------- |
| Componentes AD/DC ausentes | Pacotes e notas de migração         | Samba, DB/LDAP e ID original do domínio   |
| VPN ausente após iniciar   | Ciclo e cancelamento no journal     | SSH, VPN, DNS e LDAP após reinício normal |
| Falhas do SSSD e sockets   | Validador e conflitos de responders | Responders, Online e ingresso da máquina  |

## Sem jogadores: dados recentes e controle de entrada

O Velocity só foi atualizado quando não havia jogadores. Coletamos contagens por JSON e status ping, sem enviar `list` ou `glist` periodicamente aos consoles. Conferimos os nove backends ativos, inclusive um fora do monitoramento JSON de oito hosts, além do proxy.

A condição exigia todas as contagens zeradas e observações e snapshots de monitoramento com até 15 segundos. Jogadores presentes, dados ausentes, consultas falhas, valores antigos ou alvos sem cobertura exigiam esperar. Os nomes dos jogadores não eram necessários.

1. Confirmar zeros recentes em todos os alvos e o fim das manutenções anteriores.
2. Verificar a restauração prévia e salvar configurações e estados do destino.
3. Consultar novamente as contagens imediatamente antes da parada.
4. Fechar temporariamente novas entradas de jogo e exigir novos zeros após o fechamento.
5. Solicitar o encerramento normal do Velocity e confirmar a saída antes de atualizar o APT.
6. Reiniciar normalmente, verificar de forma independente, reabrir e restaurar o backup final.

As regras cobriam o TCP/UDP necessário em IPv4/IPv6 e permaneciam durante o reinício. Regras temporárias próprias preservaram SSH, VPN, API e backends, sem substituir o firewall existente. A reabertura incluiu remover unidades e regras temporárias.

Usamos [`shutdown` do Velocity](https://docs.papermc.io/velocity/built-in-commands/) para encerrar corretamente. Backends, mundos e plugins não foram parados nem atualizados nesse trabalho.

## Tratar atualizações graduais conforme a etapa

A manutenção normal incluiu simulação sem remoção, obtenção estrita dos índices APT, conservação das configurações e retorno dos timers e holds. Usamos `NEEDRESTART_MODE=l` para manter a ordem prevista de reinícios. Um worker verificava host e estado parado sem depender da conexão SSH.

Sete pacotes ficaram adiados conforme as [atualizações graduais do Ubuntu](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/). Não forçamos sua inclusão para esvaziar a lista pendente.

Os pré-requisitos de uma migração de versão são diferentes: o procedimento oficial inclui atualizar os pacotes graduais. A política cotidiana pós-migração não se aplica sem ajustes aos requisitos de `do-release-upgrade`.

## Comprovar a conclusão com reinício e a mesma geração de backup

Os seis servidores iniciaram normalmente com Ubuntu 26.04.1 e o novo kernel. Conferimos boot IDs alterados, consistência de pacotes, unidades falhas, SSH/VPN, recuperação automática dos serviços e retorno de configurações, timers, holds e entrada.

No Velocity, testamos status Java, respostas RakNet do Geyser e conexões de outro host. A API econômica retornou 200 pela rota permitida, 401 sem autenticação e 200 com autenticação. Um 200 isolado não verifica a fronteira de autenticação.

Nos destinos com backups ativos, salvamos o estado final e restauramos essa mesma geração. Uma restauração anterior não foi usada como prova de um novo backup. Backups deliberadamente desativados permaneceram assim.

Essas verificações confirmaram a volta à operação normal. Login interativo, jogo real, publicações ou geração dos bots e recuperação integral de desastres exigem outros testes. A migração de Debian para Ubuntu ficou fora do escopo.

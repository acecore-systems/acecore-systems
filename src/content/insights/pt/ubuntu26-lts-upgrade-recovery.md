---
title: "Atualizar um servidor Ubuntu em produção: preparação, recuperação da conexão e verificações após a reinicialização"
description: "Com exemplos da migração do Ubuntu 24.04 para o 26.04 e das atualizações regulares, explicamos em detalhes como testar a restauração de backups, preservar configurações, decidir quando interromper um serviço sem usuários, diagnosticar problemas quando o SSH não volta e definir os critérios de conclusão."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Linux", "Cópias de segurança", "Operações"]
callout:
  type: note
  title: "Antes de começar, defina como reverter e quais são os critérios de conclusão"
  text: "Confirme que é possível recuperar as configurações e os dados, operar mesmo se o SSH cair e garantir que os serviços voltem automaticamente após uma reinicialização normal. O simples sucesso do comando de atualização não confirma esses 3 pontos."
processFigure:
  eyebrow: "Fluxo do trabalho de atualização"
  title: "Da preparação para a recuperação à verificação da restauração após a atualização"
  description: "Avance somente depois que as verificações de cada etapa forem aprovadas. Se algo falhar, registre o estado naquele momento e as operações já realizadas."
  variant: inline
  steps:
    - title: "Restauração e preservação das configurações"
      description: "Recupere os dados necessários e assegure uma via de conexão e as configurações anteriores às alterações."
      icon: i-lucide-server
      accent: brand
    - title: "Controle de novas solicitações e atualização"
      description: "Confirme novamente a utilização, encerre os serviços normalmente e aplique a atualização planejada."
      icon: i-lucide-wrench
      accent: amber
    - title: "Reinicialização e verificação do funcionamento"
      description: "Verifique a conexão externa, a inicialização automática, a restauração das configurações originais e um novo backup."
      icon: i-lucide-shield-check
      accent: emerald
---

Ao atualizar um servidor Ubuntu em produção, além de atualizar os pacotes, é preciso interromper os serviços e seguir os procedimentos para voltar à operação após a reinicialização. Problemas como a perda da conexão SSH, configurações de autenticação incompatíveis com a nova versão ou a impossibilidade de restaurar um backup também podem ocorrer depois que o comando de atualização termina.

Neste artigo, organizamos as lições aprendidas com a migração do Ubuntu 24.04 para o 26.04 LTS e com as atualizações regulares posteriores em um procedimento aplicável a outros servidores. A premissa é que você tenha privilégios de administrador e possa reservar uma janela de manutenção que permita interromper os serviços. Primeiro, apresentamos a preparação e o procedimento comuns; na segunda parte, explicamos como diagnosticar problemas de conexão, autenticação e inicialização.

## 1. Defina o tipo de atualização e o escopo do trabalho

Primeiro, decida se você vai mudar a versão principal do sistema operacional ou atualizar os pacotes da mesma versão. A quantidade de alterações necessária e os itens a verificar são diferentes em cada caso.

| Trabalho              | Exemplo                                           | Mecanismo usado      | O que verificar antes                                                                    |
| --------------------- | ------------------------------------------------- | -------------------- | ---------------------------------------------------------------------------------------- |
| Atualização regular   | Correções e atualização do kernel no Ubuntu 26.04 | APT                  | Atualizações, instalações e remoções previstas; impacto das reinicializações de serviços |
| Atualização de versão | Migração do Ubuntu 24.04 para o 26.04             | `do-release-upgrade` | Requisitos oficiais de migração, compatibilidade e pacotes descontinuados ou divididos   |

`apt-get dist-upgrade` é um comando que ajusta as dependências em relação às fontes configuradas. Apesar de conter «dist» no nome, não é um comando específico para migrar para a próxima versão LTS do Ubuntu. Faça a atualização de versão seguindo o [procedimento oficial do Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/). Em produção, não use o `-d`, destinado a versões de desenvolvimento, nem altere manualmente apenas as fontes do APT. A mudança de Debian para Ubuntu também não está entre as atualizações que podem ser feitas com este procedimento.

Além do nome do host, verifique os serviços dos quais o servidor depende: DNS, autenticação, banco de dados e VPN de acesso. Se houver vários servidores, avance com 1 servidor por vez, confirmando que as dependências permanecem estáveis. Se o trabalho coincidir com outra manutenção ou com um processo de backup, defina a ordem com antecedência.

Defina também os critérios para interromper o trabalho, como «a restauração falhou», «não foi possível obter um pacote necessário», «o encerramento normal não foi possível» ou «não foi possível acessar o console de recuperação». É mais fácil decidir quando se reserva tempo para recuperação desde o início do que continuar a atualização até o fim da janela de manutenção.

## 2. Garanta uma forma de operar mesmo se o SSH cair

Antes da atualização, confirme que você consegue acessar o console de recuperação pela interface de gerenciamento do VPS ou da nuvem. Não basta abrir a tela: é preciso ter um método de login que permita operar o sistema operacional. Se o único acesso alternativo depender da mesma VPN ou do mesmo servidor de autenticação que o SSH, você não poderá usá-lo caso essa dependência falhe.

O botão de reinicialização pode resolver uma interrupção ou instabilidade temporária. Erros de configuração e problemas na ordem de inicialização persistem depois de reiniciar. Antes de repetir reinicializações sem saber se a atualização foi interrompida, prepare-se para verificar o estado atual pelo console.

Se você usar uma imagem de disco fornecida pelo provedor, verifique se a inicialização ou a operação fica limitada durante a captura, a previsão de conclusão, o espaço de armazenamento e a unidade de cobrança. Se usar um backup da aplicação, também será necessário um procedimento para reconstruir o sistema operacional e restaurar as configurações. Seja qual for a opção, anote antes do trabalho o que ela permite restaurar e o que fica de fora.

## 3. Restaure um backup em outro local

Mesmo que o processo de backup tenha sido concluído com sucesso, isso não garante que os dados necessários estejam incluídos nem que possam ser lidos. Antes da atualização, restaure em um diretório vazio de verificação uma versão cujo host de origem, horário de gravação e conteúdo tenham sido confirmados.

Por exemplo, se você usa a ferramenta de backup restic, pode fazer esta verificação em um shell de administrador que tenha as configurações de conexão existentes. Substitua `snapshot_id` pelo ID da versão que você verificou. Fixar o ID, em vez de usar `latest`, impede que o alvo da verificação mude caso um novo backup seja executado enquanto ela estiver em andamento.

```bash
# 既存のリポジトリ接続設定を使う。秘密値をコマンドに直書きしない。
snapshot_id='確認したスナップショットID'
umask 077
restore_dir=$(mktemp -d /var/tmp/restore-check.XXXXXX) || exit 1
restic restore "$snapshot_id" --target "$restore_dir" --verify
```

Não escolha o diretório de dados de produção como destino da restauração. Como o restic pode sobrescrever arquivos existentes, consulte a [especificação oficial de restauração](https://restic.readthedocs.io/en/stable/050_restore.html) e faça a verificação em um local vazio e isolado. Um exemplo de configuração que usa armazenamento de objetos como o R2 também é apresentado em [Como incorporar testes reais de restauração de backups](/insights/restic-r2-backup-verification/).

Depois da restauração, verifique os itens abaixo de acordo com o formato dos dados.

| Dados                                | O que verificar                                                                 | O que isso, por si só, não confirma               |
| ------------------------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| Arquivos compactados, como ZIP       | Extração e verificação de integridade; presença dos arquivos necessários        | Que a aplicação inicia e consegue usar o conteúdo |
| Dump de SQL                          | Importação em um banco de dados isolado; esquema e dados principais             | Consistência com anexos ou armazenamento externo  |
| SQLite                               | Existência e tamanho do arquivo restaurado; verificação de integridade do banco | Recuperação do serviço como um todo               |
| Configurações, certificados e chaves | Arquivos, proprietário, permissões e destinos referenciados                     | Configuração ou validade no serviço externo       |

Copiar diretamente um arquivo de banco de dados em execução pode resultar em um estado inconsistente. Use um método de backup que preserve a consistência, fornecido pelo banco de dados ou pela aplicação, e alinhe também o momento dos dados e dos arquivos relacionados. Alguns comandos de verificação podem criar um banco de dados vazio; por isso, antes de dizer que a verificação de integridade foi bem-sucedida, confirme que o arquivo restaurado realmente existe.

Se você iniciar um sistema de autenticação ou outro serviço para testar a restauração, isole também a rede para impedir que uma réplica com as mesmas informações de identidade se comunique com a produção. Se usar contêineres ou namespaces, verifique se estão isolados antes de montar volumes ou iniciar serviços. Confirme também que o processo que prepara um `/run` de teste não encobre o `/run` do host de produção.

## 4. Salve não apenas as configurações, mas também o estado original de operação

Além de copiar os arquivos de configuração, registre os estados a seguir. Guarde as cópias em um local acessível apenas aos administradores e separe os registros por trabalho para não sobrescrever os existentes.

| O que salvar                  | O que comparar posteriormente                                                             |
| ----------------------------- | ----------------------------------------------------------------------------------------- |
| Sistema operacional e pacotes | Versão, kernel em execução, pacotes instalados, fontes do APT e pacotes retidos (hold)    |
| Rede e SSH                    | Netplan, configurações de SSH e VPN e forma de gerenciamento do firewall                  |
| Serviços                      | Unit e drop-in, estado ativado ou desativado na inicialização e estado atual              |
| Tarefas agendadas             | Timer, cron, estado ativado ou desativado dos backups e próxima execução                  |
| Aplicações                    | Configurações, localização dos dados, configuração de contêineres e dependências externas |

Este é um exemplo de cópia das configurações em um Ubuntu que usa Netplan e systemd. Confirme que os diretórios de destino existem e execute os comandos depois de acessar um shell de root com `sudo -i`. O diretório criado com `mktemp` será novo, acessível apenas ao root e não sobrescreverá registros anteriores.

```bash
umask 077
record_dir=$(mktemp -d /root/ubuntu-upgrade.XXXXXX) || exit 1
cp -a /etc/netplan /etc/ssh /etc/systemd/system "$record_dir/" || exit 1
apt-mark showhold > "$record_dir/apt-hold.txt"
systemctl list-unit-files > "$record_dir/unit-files.txt"
systemctl list-units --type=service --all > "$record_dir/services.txt"
systemctl list-timers --all > "$record_dir/timers.txt"
cat /proc/sys/kernel/random/boot_id > "$record_dir/boot-id.txt"
```

Este exemplo não inclui configurações específicas das aplicações nem dados em armazenamento externo. Acrescente os itens identificados na tabela acima e registre o local das cópias no relatório do trabalho.

Exemplo de comandos de verificação. Guarde a saída como registro do trabalho e não a divulgue se ela incluir o nome do host, destinos de conexão ou conteúdo das configurações.

```bash
cat /etc/os-release
uname -r
cat /proc/sys/kernel/random/boot_id
apt-mark showhold
systemctl list-timers --all
systemctl --failed
sudo sshd -t
```

`sshd -t` verifica a sintaxe da configuração do SSH. Mesmo que seja bem-sucedido, isso não confirma que o host está acessível externamente. No caso do Netplan, verifique separadamente a sintaxe, o resultado gerado e a comunicação real.

Se você parar um timer ou alterar temporariamente um hold para a atualização, registre o estado original e o motivo. Ativar tudo indiscriminadamente depois do trabalho pode fazer voltar a executar tarefas que deveriam permanecer paradas. Ao restaurar configurações, compare as alterações feitas neste trabalho; não substitua todo o `/etc` por uma versão antiga.

## 5. Transforme a constatação de que não há usuários em uma condição segura para interromper o serviço

Para serviços que devem ser interrompidos apenas quando não houver usuários, verifique o escopo observado e o horário dos dados, além de confirmar que o número de usuários ou conexões é 0. Observar apenas o proxy de entrada não garante que os servidores por trás dele ou os trabalhos em execução também estejam sem usuários.

Liste primeiro todos os alvos que serão usados na decisão e obtenha valores recentes de cada um. Se houver uma falha na coleta, dados ausentes ou desatualizados ou servidores fora do monitoramento, não autorize a interrupção. Converter «sem valor» em 0 pode causar uma interrupção quando o monitoramento falhar.

Por exemplo, em um monitoramento que normalmente se atualiza a cada poucos segundos, você pode exigir que tanto o horário da observação como o da atualização dos dados de origem estejam dentro dos últimos 15 segundos. Esse limite de 15 segundos é apenas um exemplo de projeto. Defina-o de acordo com o intervalo de atualização real e verifique também a diferença entre os relógios. Se for possível tomar a decisão apenas com base no número de usuários, não é necessário coletar nomes de usuários nem enviar periodicamente comandos de listagem ao console.

Imediatamente antes de interromper, siga esta ordem:

1. Confirme que o número de usuários e processos é 0 em todos os alvos e que não há trabalhos de manutenção concorrentes.
2. Bloqueie novas solicitações na aplicação ou no balanceador de carga. Use um método que permita aguardar o encerramento normal dos processos existentes.
3. Depois de bloquear novas solicitações, use dados recém-gerados para confirmar novamente que o número em todos os alvos continua sendo 0.
4. Solicite o encerramento normal e confirme que o processo terminou e que os dados foram salvos.
5. Só reabra a entrada de solicitações depois de concluir as verificações de funcionamento após a atualização e a reinicialização.

Se encontrar um usuário depois de bloquear novas solicitações, não prossiga com a interrupção. Siga o procedimento definido previamente para aguardar ou reabrir a entrada. Não reutilize o valor 0 obtido anteriormente.

Se o controle for feito pelo firewall, verifique como são tratadas as novas conexões e as existentes, bem como IPv4 e IPv6 e TCP e UDP. Como o tratamento de UDP varia de acordo com a aplicação, considere também o modo de manutenção da própria aplicação. Mantenha o SSH e a VPN de administração e a comunicação interna disponíveis, e confirme que o bloqueio de novas solicitações será mantido durante a reinicialização. Use uma regra temporária específica para que, ao retomar o serviço, seja possível remover somente essa regra.

### Diferencie a solicitação de encerramento da conclusão do encerramento normal

Se usar `systemctl stop`, verifique primeiro o `ExecStop`, o tempo de tolerância para o encerramento e as configurações de encerramento forçado da unit de destino. Se o `ExecStop` apenas enviar uma solicitação de encerramento e retornar, o systemd poderá encerrar à força os processos que ainda estiverem ativos. Inclua também a espera pelo encerramento normal, de acordo com a [especificação do systemd](https://manpages.ubuntu.com/manpages/resolute/man5/systemd.service.5.html).

Se o serviço for encerrado por meio de uma entrada no console, o comando correto também precisa chegar ao processo de destino com uma quebra de linha. Em uma linha de comando de uma unit, não se pode presumir que expressões como `$()` ou pipes do shell estarão disponíveis automaticamente. Agrupe o processamento necessário em um script pequeno, inclua uma verificação para identificar corretamente o processo de destino e aguarde seu encerramento. Se houver timeout, investigue por que o encerramento normal falhou em vez de forçar o encerramento e continuar a atualização.

## 6. Separe a atualização regular em obtenção de índices, verificação do plano e aplicação

Quando a restauração estiver verificada e a preparação para a interrupção estiver concluída, obtenha primeiro os índices dos pacotes. Não prossiga usando índices antigos se alguma fonte de pacotes falhar.

```bash
# この段階ではパッケージを更新しない
sudo apt-get update -o APT::Update::Error-Mode=any &&
  sudo apt-get -s --no-remove dist-upgrade
```

Verifique o código de saída da simulação e as atualizações, instalações e remoções previstas. `--no-remove` serve para interromper o processo caso seja necessária alguma remoção. Como kernels e outros pacotes podem exigir a instalação de novos pacotes, não use «0 instalações» como condição geral para atualizações regulares. De acordo com a [especificação do APT](https://manpages.ubuntu.com/manpages/resolute/man8/apt-get.8.html), o estado durante uma simulação não é fixo. Verifique novamente, imediatamente antes da execução, se não há outro processo do APT em andamento e se o plano não mudou.

Se o plano não apresentar problemas e você confirmar que os serviços relevantes foram interrompidos, prossiga com a aplicação. Veja um exemplo de como exibir uma lista de sugestões adicionais de reinicialização em um ambiente que usa needrestart.

```bash
# 通常更新の予定を確認し、必要なサービスを正常停止した後に実行する
sudo env NEEDRESTART_MODE=l apt-get --no-remove dist-upgrade
```

`NEEDRESTART_MODE=l` define o [modo de exibição em lista do needrestart](https://github.com/liske/needrestart/blob/master/ex/needrestart.conf). Isso não proíbe todas as reinicializações de serviços causadas pelos próprios procedimentos de configuração dos pacotes. Execute a atualização em uma janela de manutenção com uma via de recuperação disponível, levando em conta também o impacto no SSH e na VPN. Não adicione `-y` sem uma verificação nem uma opção que substitua indiscriminadamente todos os arquivos de configuração.

Para se preparar para uma queda do SSH, use uma sessão administrativa, como a do tmux, que permita que o processo continue após a desconexão, e registre o resultado do comando. Se automatizar a execução, verifique imediatamente antes dela o host de destino, a versão do sistema operacional, o resultado da comparação das configurações, a verificação do backup e o estado de interrupção dos serviços; registre também as etapas intermediárias. Não inicie a mesma atualização novamente só porque a conexão caiu.

### Como lidar com atualizações que permanecem retidas pela distribuição em fases

A distribuição em fases do Ubuntu fornece atualizações regulares primeiro a parte dos usuários e reduz a distribuição se houver problemas. Se uma atualização regular deixar pacotes retidos devido à distribuição em fases, registre o motivo. Não é necessário forçar a aplicação apenas para reduzir a 0 a quantidade de pacotes retidos. [Explicação da distribuição em fases do Ubuntu](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)

A preparação para uma atualização de versão, porém, é diferente. O procedimento oficial do Ubuntu orienta atualizar a versão atual, incluindo as atualizações distribuídas em fases. Aplique os requisitos prévios indicados no procedimento oficial vigente naquele momento antes de executar `do-release-upgrade`. Uma atualização de versão também pode exigir a substituição ou remoção de pacotes; por isso, não use sem alterações o comando acima, destinado a atualizações regulares, como procedimento de migração.

Antes da execução, verifique as versões de destino oferecidas com o comando a seguir.

```bash
sudo do-release-upgrade -c
```

Depois que a versão LTS desejada for oferecida e a atualização e a reinicialização da versão atual, a verificação da restauração e as verificações de compatibilidade estiverem concluídas, execute `sudo do-release-upgrade` durante a janela de manutenção. Se a verificação não apresentar uma versão de destino, investigue as condições de disponibilidade. Não tente avançar especificando uma versão de desenvolvimento. Se surgir uma solicitação para confirmar uma alteração de arquivo de configuração, examine as diferenças e avalie o impacto nas configurações de conexão e autenticação.

## 7. Se o SSH não voltar, investigue a comunicação e a inicialização em sequência

Se não for possível conectar-se por SSH, use o console de recuperação para identificar o problema nas etapas a seguir.

| Etapa a verificar               | Exemplo de verificação             | O que investigar em seguida                                                |
| ------------------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| O sistema operacional iniciou?  | Console, `systemctl --failed`      | Modo de emergência, unit com falha ou configuração de pacotes interrompida |
| Há IP e rota?                   | `ip address`, `ip route`           | Origem da configuração do Netplan, nome da interface e alterações de rota  |
| O SSH está aguardando conexões? | `sshd -t`, service e socket do SSH | Erro de configuração e porta de escuta efetiva                             |
| É possível acessar de fora?     | Conexão a partir de outro host     | Firewall, VPN ou controles de comunicação na nuvem                         |

Investigue o journal referente à inicialização atual. Use `journalctl -b -u 対象unit` para verificar os motivos de falhas ou cancelamentos durante a inicialização e `systemctl show 対象unit -p After -p Before -p Requires -p Wants` para verificar as dependências.

Se a inicialização da VPN de acesso for cancelada, investigue também a ordem de inicialização, e não apenas a configuração de rede. Um exemplo de ciclo é quando uma unit de socket antiga aguarda a VPN e a VPN, por sua vez, aguarda outra etapa da inicialização. Depois de verificar as conexões em espera e a comunicação que estão sendo usadas atualmente, corrija somente as units cuja função já não é necessária. Na ativação por socket, pode ser normal que um serviço que aguarda conexões esteja inativo; não conclua que ele é desnecessário apenas pelo estado exibido.

### Quando o cloud-init recria a configuração de rede

O cloud-init é um mecanismo que realiza a configuração inicial em ambientes de nuvem, entre outras tarefas. Em uma arquitetura na qual os administradores mantêm o Netplan existente, verifique se uma nova geração de configurações após a atualização pode alterá-las. Para desativar a geração de configurações de rede, adicione o seguinte a um arquivo de gerenciamento em `/etc/cloud/cloud.cfg.d/`.

```yaml
network:
  config: disabled
```

Essa configuração [desativa somente a geração de configurações de rede pelo cloud-init](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). Não a aplique indiscriminadamente a ambientes que recebem a configuração de rede dos metadados da nuvem. Verifique quem gerencia as configurações e valide o backup e o hash do Netplan existente, o resultado gerado e a comunicação após uma reinicialização normal.

## 8. Verifique problemas de compatibilidade de autenticação ou inicialização somente nas configurações relevantes

Os itens a seguir se aplicam a ambientes que usam o software correspondente. Não é necessário instalá-lo em servidores que não o utilizam.

### Se você fornece autenticação de domínio Windows com o Samba

O Samba AD/DC é uma configuração que fornece autenticação e diretório para domínios Windows. Na migração para o Ubuntu 26.04, siga as [observações oficiais sobre a migração](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases) e verifique no sistema operacional antigo se o `samba-ad-dc` está instalado.

```bash
dpkg-query -W -f='${Status}\n' samba-ad-dc
apt-cache policy samba-ad-dc
```

Confirme que o resultado é `install ok installed`. Se o pacote não estiver instalado, confira as fontes oficiais e os pacotes que serão adicionados antes de instalá-lo no sistema operacional antigo. Não misture a instalação do pacote necessário com a recriação do domínio ou a alteração do nível funcional.

Para o backup, use o método apropriado de [`samba-tool domain backup`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), em vez de simplesmente copiar os arquivos do banco de dados. Na verificação da restauração, além do banco de dados, confirme também as respostas do diretório em um ambiente isolado. Em testes com o Samba 4.23, mesmo alterando os locais do banco de dados e do PID, houve casos em que a inicialização falhou porque faltava o socket interno `/run/samba/nmbd`. Inspecionar separadamente os dados persistentes e os diretórios de execução ajuda a distinguir um backup danificado de uma configuração de teste incompleta.

### Se o SSSD estiver integrado a um serviço externo de autenticação

O SSSD é um mecanismo para conectar o Linux a serviços de informações de usuários e autenticação, como AD ou LDAP. No [SSSD 2.10, `config_file_version` foi removido](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes). Se houver uma configuração antiga, salve o proprietário e as permissões do arquivo original antes de corrigi-la e verifique o resultado com `sudo sssctl config-check`.

Preste atenção também ao método de inicialização. Um responder iniciado pelo monitor do próprio SSSD pode entrar em conflito com o mesmo responder iniciado por um socket do systemd. Os responders são processos que tratam, por exemplo, consultas de informações de usuários e autenticação. Compare a [especificação de configuração da versão instalada](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html) com os logs e ajuste somente os componentes em conflito.

Após a correção, verifique a obtenção de informações de usuários, os processos de autenticação necessários e o estado Online do domínio. Na integração com AD, verifique também `adcli testjoin` usando a chave de máquina existente. Antes de recriar a chave ou reintegrar o domínio, identifique se o problema está na configuração ou no método de inicialização.

### Se a atualização foi interrompida e os pacotes ou arquivos de inicialização estão incompletos

Primeiro, verifique os pacotes não configurados e as dependências com `sudo dpkg --audit` e `sudo apt-get check`. Se outro processo do APT ou do dpkg estiver em andamento, não inicie outro processo simultaneamente. Também não force a execução removendo arquivos de bloqueio.

Se você confirmar que o processo terminou e que é necessário continuar a configuração de pacotes não configurados, use `sudo dpkg --configure -a` para retomá-la. Verifique o resultado antes de prosseguir e resolva primeiro eventuais problemas com as fontes de pacotes ou as dependências.

Mesmo que um novo kernel tenha sido instalado, o sistema não iniciará normalmente se faltar o initrd necessário à inicialização. Verifique o espaço em `/boot`, os kernels instalados e os arquivos de inicialização correspondentes. `update-initramfs -c -k 対象バージョン`, que cria um initrd, e `-u`, que atualiza um existente, têm finalidades diferentes. [Especificação do update-initramfs](https://manpages.ubuntu.com/manpages/resolute/man8/update-initramfs.8.html)

Escolha o kernel a reparar entre os kernels instalados. `uname -r` indica o kernel que está em execução no momento e, portanto, pode apontar para a versão antiga, anterior à atualização.

Se não for possível inicializar normalmente e você precisar usar um shell temporário de recuperação com acesso root, confirme a autorização do administrador e o procedimento, pois isso pode contornar a autenticação. Comece com uma inspeção somente de leitura e faça apenas as alterações necessárias. Reverta as opções de inicialização temporárias e a supressão da inicialização de serviços e, por fim, valide a inicialização normal pelo systemd. Conseguir iniciar um serviço no shell de recuperação não confirma que ele será iniciado automaticamente.

## 9. Compare os critérios de conclusão após a reinicialização

Quando a atualização terminar, confirme que a configuração dos pacotes foi concluída antes de fazer uma reinicialização normal. Depois dela, compare o registro anterior à atualização com os itens a seguir.

| Critério de conclusão                            | Evidências a verificar                                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| O sistema iniciou normalmente                    | O boot ID mudou e o sistema não permaneceu em um shell de recuperação ou modo de emergência |
| Está executando o sistema e o kernel previstos   | `/etc/os-release` e `uname -r`. Não decida apenas pela lista de pacotes instalados          |
| Os pacotes estão consistentes                    | Resultado de `dpkg --audit` e `apt-get check`                                               |
| Os serviços necessários voltaram automaticamente | Services, sockets e contêineres; units com falha e respostas externas                       |
| A conexão e a autenticação estão disponíveis     | SSH, VPN e rotas de autenticação necessárias testados a partir de outro host                |
| As alterações temporárias foram removidas        | Entrada de solicitações, firewall, timers, holds, units e diferenças nas configurações      |
| É possível restaurar o estado após a atualização | Resultado da restauração real de uma nova versão de backup e conteúdo verificado            |

Faça os testes não apenas dentro do host atualizado, mas também a partir de outro host cujo caminho de acesso se aproxime do uso real. Para uma API, além de confirmar o sucesso de uma solicitação válida, verifique que uma solicitação sem autenticação é recusada conforme esperado nas rotas que exigem autenticação. Uma resposta HTTP 200, por si só, não confirma os limites de autenticação nem as principais funções da aplicação.

Depois de reabrir a entrada de solicitações, confirme que não restaram units ou regras temporárias de manutenção. Para os itens protegidos por backup, salve novamente o estado final e restaure e verifique essa **nova versão do backup**. Não use o sucesso da restauração feita antes da atualização como evidência do backup posterior. Se um backup estava intencionalmente interrompido, mantenha-o nesse estado.

No registro final do trabalho, anote as alterações feitas, os resultados dos comandos, as operações adicionais realizadas para a recuperação, o que foi possível verificar e quaisquer itens que permaneceram retidos. Se não tiver testado o login de um usuário real ou uma operação principal, registre esse item como não verificado. Registre também separadamente a extração de parte do backup e a recuperação do serviço completo em outro ambiente.

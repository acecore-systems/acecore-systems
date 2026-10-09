---
title: "Mettre à jour un serveur Ubuntu en service : préparation, rétablissement de la connexion et vérifications après redémarrage"
description: "En prenant comme exemples la migration d’Ubuntu 24.04 vers 26.04 et les mises à jour ordinaires, cet article explique concrètement comment tester la restauration d’une sauvegarde, mettre la configuration à l’abri, décider de l’arrêt en l’absence d’utilisateurs, diagnostiquer le rétablissement de SSH et définir les critères de fin d’intervention."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Linux", "Sauvegarde", "Exploitation"]
callout:
  type: note
  title: "Définir avant l’intervention la procédure de retour arrière et les critères de fin"
  text: "Vérifiez que les données et la configuration peuvent être récupérées, que vous pouvez intervenir même si SSH est coupé et que les services redémarrent automatiquement après un redémarrage normal. La réussite des seules commandes de mise à jour ne permet pas de confirmer ces 3 points."
processFigure:
  eyebrow: "Déroulement de la mise à jour"
  title: "De la préparation de la reprise à la vérification de la restauration après mise à jour"
  description: "Ne passez à l’étape suivante qu’une fois les vérifications de chaque étape réussies. En cas d’échec, consignez l’état à ce moment-là et les opérations déjà effectuées."
  variant: inline
  steps:
    - title: "Restauration et mise à l’abri de la configuration"
      description: "Récupérer les données nécessaires et sécuriser le moyen de connexion ainsi que la configuration d’origine."
      icon: i-lucide-server
      accent: brand
    - title: "Contrôle des admissions et mise à jour"
      description: "Vérifier à nouveau l’utilisation, arrêter les services normalement et appliquer la mise à jour prévue."
      icon: i-lucide-wrench
      accent: amber
    - title: "Redémarrage et vérification du fonctionnement"
      description: "Vérifier les connexions externes, le démarrage automatique, le rétablissement de la configuration d’origine et la nouvelle sauvegarde."
      icon: i-lucide-shield-check
      accent: emerald
lastUpdated: "2026-10-09T15:00:00+09:00"
---

Mettre à jour un serveur Ubuntu en service ne consiste pas seulement à actualiser les paquets : il faut également arrêter les services, puis suivre une procédure pour remettre le serveur en exploitation après son redémarrage. Des problèmes peuvent survenir même après la fin de la commande de mise à jour : SSH ne se reconnecte pas, les paramètres d’authentification sont incompatibles avec la nouvelle version ou la sauvegarde est impossible à récupérer.

Cet article présente, sous la forme d’une procédure réutilisable sur d’autres serveurs, les enseignements tirés de la migration LTS d’Ubuntu 24.04 vers 26.04 et des mises à jour ordinaires effectuées après cette migration. Il faut disposer des privilèges d’administration et prévoir une plage de maintenance permettant l’interruption du service. Nous présentons d’abord les préparatifs et les étapes communes, puis détaillons, dans la seconde partie, le diagnostic des problèmes de connexion, d’authentification et de démarrage.

## Choisir la migration de 24.04 à 26.04 ou les mises à jour courantes

Déterminez si une nouvelle génération est nécessaire ou si des correctifs suffisent. La migration ajoute des vérifications d’authentification externe, VPN et bases de données ; les mises à jour courantes examinent paquets prévus et redémarrages. Ne commencez pas sans console de secours et restauration testée.

[Ubuntu Server：Conditions et préparation d’une migration LTS](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/)

## 1. Déterminer le type de mise à jour et son périmètre

Commencez par déterminer si vous changez de version du système d’exploitation ou si vous mettez à jour les paquets au sein de la même version. L’ampleur des modifications nécessaires et les vérifications diffèrent dans les deux cas.

| Opération                | Exemple                                               | Mécanisme utilisé    | Vérifications préalables                                                         |
| ------------------------ | ----------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| Mise à jour ordinaire    | Correctifs et mises à jour du noyau dans Ubuntu 26.04 | APT                  | Mises à jour, ajouts et suppressions prévus, impact du redémarrage des services  |
| Mise à niveau de version | Migration d’Ubuntu 24.04 vers 26.04                   | `do-release-upgrade` | Conditions officielles de migration, compatibilité, paquets supprimés ou scindés |

`apt-get dist-upgrade` ajuste les dépendances pour les dépôts configurés. Même si son nom contient « dist », ce n’est pas une commande dédiée à la migration vers la prochaine LTS d’Ubuntu. Effectuez les mises à niveau de version conformément à la [procédure officielle d’Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/). En production, n’utilisez pas l’option `-d`, destinée aux versions de développement, et ne modifiez pas manuellement les seuls dépôts APT. Le passage de Debian à Ubuntu ne fait pas non plus partie des mises à niveau possibles avec cette procédure.

Ne vous limitez pas au nom d’hôte : recensez aussi les DNS, les services d’authentification, les bases de données et le VPN de connexion dont dépend le serveur. Si vous mettez à jour plusieurs machines, mettez à jour 1 machine à la fois, en vérifiant que les dépendances restent stables. Si l’intervention chevauche une autre opération de maintenance ou une sauvegarde, définissez l’ordre des opérations à l’avance.

Définissez également les critères d’arrêt, par exemple : « la restauration a échoué », « un paquet nécessaire ne peut pas être téléchargé », « l’arrêt normal est impossible » ou « la console de récupération est inaccessible ». Il est plus facile de prendre une décision si vous réservez d’abord du temps à la reprise, plutôt que de poursuivre la mise à jour jusqu’à la fin de la plage de maintenance.

## 2. Prévoir un moyen d’agir même si SSH est coupé

Avant la mise à jour, vérifiez que vous pouvez accéder à la console de récupération depuis le panneau d’administration du VPS ou du fournisseur cloud. Il ne suffit pas d’ouvrir la console : vous devez disposer d’un moyen de vous connecter et d’agir réellement sur le système d’exploitation. Si votre seul autre accès dépend du même VPN ou du même serveur d’authentification que SSH, une panne de cette dépendance vous empêchera aussi de récupérer le serveur.

Le bouton de redémarrage peut résoudre un blocage ou une défaillance temporaire. En revanche, les erreurs de configuration et les problèmes d’ordre de démarrage réapparaîtront après le redémarrage. Avant de multiplier les redémarrages sans savoir si la mise à jour est toujours en cours, assurez-vous de pouvoir consulter l’état actuel depuis la console.

Si vous utilisez une image disque fournie par l’hébergeur, renseignez-vous sur les éventuelles restrictions de démarrage ou d’utilisation pendant sa création, le délai estimé, l’espace de stockage nécessaire et le mode de facturation. Si vous utilisez une sauvegarde de l’application, prévoyez aussi la procédure de reconstruction du système d’exploitation et de restauration de la configuration. Quel que soit votre choix, consignez avant l’intervention ce qui pourra être restauré et ce qui ne le pourra pas.

## 3. Restaurer réellement une sauvegarde vers un autre emplacement

Même si une tâche de sauvegarde a réussi, cela ne garantit pas que les données nécessaires sont incluses ni qu’elles peuvent être restaurées. Avant la mise à jour, restaurez une sauvegarde dont vous avez vérifié l’hôte cible, l’heure d’enregistrement et le contenu, dans un répertoire de validation vide.

Par exemple, si vous utilisez l’outil de sauvegarde restic, vous pouvez effectuer la vérification suivante depuis un shell d’administration disposant de la configuration de connexion existante. Remplacez `snapshot_id` par l’ID de la sauvegarde sélectionnée. En fixant l’ID plutôt qu’en utilisant `latest`, la cible ne changera pas si une nouvelle sauvegarde est créée pendant la vérification.

```bash
# 既存のリポジトリ接続設定を使う。秘密値をコマンドに直書きしない。
snapshot_id='確認したスナップショットID'
umask 077
restore_dir=$(mktemp -d /var/tmp/restore-check.XXXXXX) || exit 1
restic restore "$snapshot_id" --target "$restore_dir" --verify
```

Ne choisissez pas le répertoire de données de production comme destination de restauration. restic peut écraser les fichiers existants : consultez la [documentation officielle sur la restauration](https://restic.readthedocs.io/en/stable/050_restore.html) et effectuez la vérification dans un emplacement vide et isolé. Un exemple de configuration utilisant un stockage objet comme R2 est également présenté dans [Intégrer la restauration réelle d’une sauvegarde](/insights/restic-r2-backup-verification/).

Après la restauration, vérifiez les points suivants selon le format des données.

| Données                            | Vérifications                                                                | Ce que cela ne permet pas de vérifier à lui seul         |
| ---------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------- |
| Archive ZIP ou autre               | Extraction et vérification de l’intégrité, présence des fichiers nécessaires | Démarrage de l’application et utilisabilité du contenu   |
| Dump SQL                           | Importation dans une base isolée, schéma et données principales              | Cohérence avec les pièces jointes ou le stockage externe |
| SQLite                             | Présence et taille du fichier restauré, contrôle de l’intégrité de la base   | Restauration de l’ensemble du service                    |
| Configuration, certificats et clés | Fichiers concernés, propriétaire, permissions et références                  | Configuration ou validité côté services externes         |

Une simple copie des fichiers d’une base de données en cours d’exécution peut mélanger différents états d’écriture. Utilisez une méthode de sauvegarde qui préserve la cohérence, fournie par la base de données ou l’application, et veillez à ce que les données et les fichiers associés correspondent au même instant. Certaines commandes de vérification peuvent créer une nouvelle base vide : avant de conclure que le contrôle d’intégrité a réussi, vérifiez que le fichier restauré existe réellement.

Si vous démarrez une infrastructure d’authentification ou un autre service pour effectuer la validation, isolez également son réseau afin qu’une copie portant les mêmes identifiants ne communique pas avec la production. Si vous utilisez des conteneurs ou des espaces de noms, vérifiez leur isolation avant de procéder au montage ou au démarrage. Assurez-vous aussi qu’une opération préparant un `/run` pour la validation ne masque pas le `/run` de l’hôte de production.

## 4. Enregistrer l’état de fonctionnement initial, et pas seulement la configuration

En plus des copies de fichiers de configuration, consignez les éléments suivants. Stockez les informations dans un emplacement lisible uniquement par les administrateurs et séparez les enregistrements par intervention afin de ne pas écraser les précédents.

| Éléments à enregistrer | Informations à comparer ensuite                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| OS et paquets          | Version, noyau en cours d’exécution, paquets installés, dépôts APT et paquets bloqués        |
| Réseau et SSH          | Netplan, configuration SSH, configuration VPN et méthode de gestion du pare-feu              |
| Services               | Unit et drop-in, activation ou désactivation au démarrage, état de fonctionnement actuel     |
| Tâches planifiées      | Activation ou désactivation des timers, tâches cron et sauvegardes, prochaine exécution      |
| Applications           | Configuration, emplacement des données, configuration des conteneurs et dépendances externes |

Voici un exemple de sauvegarde de la configuration sur Ubuntu avec Netplan et systemd. Vérifiez que les répertoires concernés existent et exécutez les commandes après être passé dans un shell root avec `sudo -i`. Le répertoire créé avec `mktemp` est un nouvel emplacement accessible uniquement à root, qui n’écrase pas les enregistrements précédents.

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

Cet exemple ne couvre ni la configuration propre à l’application ni les données des stockages externes. Ajoutez les éléments recensés dans le tableau ci-dessus et consignez l’emplacement de sauvegarde dans le compte rendu de l’intervention.

Voici quelques exemples de commandes de vérification. Les sorties contenant le nom d’hôte, les destinations de connexion ou le contenu de la configuration ne doivent pas être publiées ; conservez-les dans le compte rendu de l’intervention.

```bash
cat /etc/os-release
uname -r
cat /proc/sys/kernel/random/boot_id
apt-mark showhold
systemctl list-timers --all
systemctl --failed
sudo sshd -t
```

`sshd -t` vérifie la syntaxe de la configuration SSH. Même s’il réussit, cela ne prouve pas que le serveur est accessible depuis l’extérieur. Pour Netplan aussi, vérifiez séparément la syntaxe, le résultat généré et la communication réelle.

Si vous arrêtez un timer ou modifiez temporairement l’état d’un paquet bloqué pour effectuer la mise à jour, consignez l’état initial et la raison du changement. Tout réactiver uniformément après l’intervention risquerait de relancer des tâches qui avaient été arrêtées intentionnellement. Lorsque vous restaurez la configuration, comparez les modifications apportées plutôt que de remplacer tout `/etc` par une ancienne version.

## 5. Passer de l’absence d’utilisateurs à un état où l’arrêt est possible

Pour un service qui ne doit être arrêté qu’en l’absence d’utilisateurs, ne vous contentez pas de vérifier que le nombre d’utilisateurs ou de connexions est égal à 0 : contrôlez également le périmètre observé et l’horodatage. Vérifier uniquement le proxy d’entrée ne permet pas de conclure que les serveurs en aval ou les tâches en cours sont également inactifs.

Répertoriez d’abord toutes les cibles à prendre en compte, puis récupérez des données récentes pour chacune d’elles. Si la collecte échoue, si une donnée est manquante ou ancienne, ou si un serveur n’est pas surveillé, n’autorisez pas l’arrêt. Ne transformez pas « aucune valeur » en 0 : en cas de défaillance de la supervision, cela pourrait déclencher l’arrêt.

Par exemple, pour un système de supervision dont les valeurs sont normalement actualisées toutes les quelques secondes, vous pouvez exiger que l’horodatage de l’observation et celui de la mise à jour des données sources datent tous deux de 15 secondes au maximum. Ces 15 secondes ne sont qu’un exemple de conception. Choisissez le seuil en fonction de l’intervalle réel de mise à jour et vérifiez également le décalage des horloges. Si le nombre d’utilisateurs suffit à prendre la décision, il n’est pas nécessaire de collecter leurs noms ni d’envoyer périodiquement des commandes listant les utilisateurs à une console.

Juste avant l’arrêt, procédez dans cet ordre.

1. Vérifiez que le nombre d’utilisateurs et de tâches est égal à 0 sur toutes les cibles et qu’aucune opération de maintenance concurrente n’est en cours.
2. Bloquez les nouvelles admissions dans l’application ou l’équilibreur de charge. Utilisez une méthode qui permet aux traitements existants de se terminer normalement.
3. Après avoir bloqué les admissions, vérifiez à nouveau que le nombre est égal à 0 sur toutes les cibles, à partir de nouvelles données.
4. Demandez l’arrêt normal et vérifiez que les processus se sont terminés et que les données ont été enregistrées.
5. Ne rétablissez les admissions qu’après avoir terminé les vérifications de fonctionnement suivant la mise à jour et le redémarrage.

Si un utilisateur est détecté après le blocage des admissions, ne poursuivez pas l’arrêt : appliquez la procédure d’attente ou de rétablissement des admissions définie à l’avance. Ne réutilisez pas la valeur 0 relevée précédemment.

Si vous utilisez le pare-feu pour contrôler les admissions, vérifiez le traitement des nouvelles connexions et des connexions existantes, ainsi que les protocoles IPv4, IPv6, TCP et UDP. Comme le comportement d’UDP varie selon les applications, envisagez également un mode maintenance côté application. Laissez accessibles SSH et le VPN d’administration, ainsi que les communications internes, et vérifiez que le blocage des admissions est maintenu pendant le redémarrage. Utilisez une règle temporaire dédiée afin de pouvoir retirer uniquement cette règle au rétablissement du service.

### Distinguer la demande d’arrêt normal de sa fin effective

Si vous utilisez `systemctl stop`, vérifiez à l’avance le `ExecStop` de l’unit concernée, le délai accordé à l’arrêt et le paramètre d’arrêt forcé. Si `ExecStop` se contente d’envoyer une demande d’arrêt puis se termine, les processus restants peuvent être arrêtés par systemd. Incluez aussi l’attente de l’arrêt normal, conformément aux [spécifications de systemd](https://manpages.ubuntu.com/manpages/resolute/man5/systemd.service.5.html).

Pour un service arrêté par une commande saisie dans sa console, cette commande doit parvenir au processus cible avec un retour à la ligne. Dans une ligne de commande d’unit, `$()` et les tubes du shell ne sont pas nécessairement interprétés automatiquement. Regroupez les opérations nécessaires dans un petit script, en ajoutant des vérifications pour éviter de confondre le processus cible et une attente de fin. En cas de dépassement du délai, ne forcez pas l’arrêt pour poursuivre la mise à jour : recherchez pourquoi l’arrêt normal est impossible.

## 6. Séparer la récupération des index, la vérification du plan et l’application des mises à jour ordinaires

Une fois la restauration vérifiée et l’arrêt préparé, commencez par récupérer les index des paquets. Ne poursuivez pas en utilisant des index obsolètes si certains dépôts n’ont pas répondu.

```bash
# この段階ではパッケージを更新しない
sudo apt-get update -o APT::Update::Error-Mode=any &&
  sudo apt-get -s --no-remove dist-upgrade
```

Vérifiez le code de sortie de la simulation ainsi que les mises à jour, ajouts et suppressions prévus. `--no-remove` permet d’interrompre l’opération si une suppression est nécessaire. Comme une mise à jour du noyau peut nécessiter l’ajout de nouveaux paquets, un nombre d’ajouts égal à 0 ne doit pas être une condition générale pour les mises à jour ordinaires. Selon la [documentation d’APT](https://manpages.ubuntu.com/manpages/resolute/man8/apt-get.8.html), l’état observé pendant une simulation n’est pas figé. Juste avant l’exécution, vérifiez aussi qu’aucune autre opération APT n’est en cours et que le plan n’a pas changé.

Si le plan est acceptable et que l’arrêt des services concernés est confirmé, appliquez la mise à jour. Dans un environnement qui utilise needrestart, voici un exemple pour afficher sous forme de liste les propositions de redémarrage supplémentaires.

```bash
# 通常更新の予定を確認し、必要なサービスを正常停止した後に実行する
sudo env NEEDRESTART_MODE=l apt-get --no-remove dist-upgrade
```

`NEEDRESTART_MODE=l` spécifie le [mode d’affichage en liste de needrestart](https://github.com/liske/needrestart/blob/master/ex/needrestart.conf). Ce réglage ne désactive pas tous les redémarrages de services déclenchés par les scripts de configuration des paquets. Effectuez l’opération durant une plage de maintenance où le moyen de rétablissement est disponible, en tenant compte de l’impact sur SSH et le VPN. N’ajoutez ni `-y` sans vérification ni option remplaçant systématiquement tous les fichiers de configuration.

Pour vous prémunir contre une coupure SSH, utilisez une session d’administration persistante après déconnexion, comme tmux, et consignez le résultat de la commande. Pour automatiser l’opération, vérifiez juste avant son lancement l’hôte cible, la version du système d’exploitation, la correspondance de la configuration, la validation de la sauvegarde et l’état d’arrêt, puis enregistrez également les résultats des étapes intermédiaires. Ne relancez pas la même mise à jour uniquement parce que la connexion a été coupée.

### Que faire des mises à jour encore retenues par le déploiement progressif

Le déploiement progressif d’Ubuntu fournit les mises à jour ordinaires à une partie des utilisateurs et peut en ralentir la diffusion en cas de problème. Si une mise à jour ordinaire reste retenue à cause de ce mécanisme, consignez-en la raison. Il n’est pas nécessaire de forcer son application uniquement pour ramener à 0 le nombre de paquets en attente. [En savoir plus sur le déploiement progressif d’Ubuntu](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/)

La préparation d’une mise à niveau de version est toutefois différente. La procédure officielle d’Ubuntu recommande de mettre à jour la version actuelle, y compris les paquets distribués progressivement. Avant d’exécuter `do-release-upgrade`, appliquez les conditions préalables indiquées dans la procédure officielle en vigueur à ce moment-là. Une mise à niveau de version peut nécessiter le remplacement ou la suppression de paquets : ne réutilisez donc pas telle quelle la commande prévue ci-dessus pour une mise à jour ordinaire.

Avant l’exécution, utilisez la commande suivante pour vérifier la version cible proposée.

```bash
sudo do-release-upgrade -c
```

Une fois que la LTS prévue est proposée et que la mise à jour de la version actuelle, le redémarrage, la validation de la restauration et les vérifications de compatibilité sont terminés, exécutez `sudo do-release-upgrade` pendant la plage de maintenance. Si la vérification seule ne propose aucune version cible, renseignez-vous sur les conditions de disponibilité. Ne passez pas à la version suivante en sélectionnant une version de développement. Si le système demande de confirmer une modification de fichier de configuration, examinez le diff et évaluez son impact sur les paramètres de connexion et d’authentification.

## 7. Si SSH ne revient pas, diagnostiquer successivement le réseau et le démarrage

Si SSH ne se connecte pas, utilisez la console de récupération pour examiner les points suivants.

| Étape à vérifier                                     | Exemple de vérification          | Éléments à examiner ensuite                                              |
| ---------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Le système d’exploitation a-t-il démarré ?           | Console, `systemctl --failed`    | Mode d’urgence, unit en échec, configuration de paquet interrompue       |
| Une adresse IP et une route sont-elles disponibles ? | `ip address`, `ip route`         | Source de génération de Netplan, nom de l’interface, changement de route |
| SSH est-il en écoute ?                               | `sshd -t`, service ou socket SSH | Erreur de configuration, port réellement en écoute                       |
| Le serveur est-il accessible depuis l’extérieur ?    | Connexion depuis un autre hôte   | Pare-feu, VPN, règles de communication côté cloud                        |

Examinez le journal pour le démarrage actuel. Utilisez `journalctl -b -u 対象unit` pour rechercher la cause d’un échec ou d’une annulation au démarrage, puis `systemctl show 対象unit -p After -p Before -p Requires -p Wants` pour vérifier les dépendances.

Si le démarrage du VPN d’accès est annulé, examinez non seulement la configuration du réseau, mais aussi l’ordre de démarrage. Par exemple, une ancienne unit socket peut attendre le VPN alors que celui-ci attend une autre étape de démarrage, ce qui crée une dépendance circulaire. Après avoir vérifié les points d’écoute et les communications utilisés actuellement, ne modifiez que les units dont le rôle est terminé. Avec l’activation par socket, le service qui attend une connexion peut être inactive à juste titre : ne le jugez donc pas inutile sur la seule base de son état.

### Si cloud-init régénère la configuration réseau

cloud-init est un mécanisme qui effectue notamment la configuration initiale dans le cloud. Si l’administrateur a choisi de gérer lui-même une configuration Netplan existante, vérifiez qu’une régénération après la mise à jour ne la modifiera pas. Pour désactiver la génération de configuration réseau, écrivez le paramètre suivant dans un fichier de configuration géré sous `/etc/cloud/cloud.cfg.d/`.

```yaml
network:
  config: disabled
```

Ce paramètre [désactive uniquement la génération de configuration réseau par cloud-init](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). Ne l’appliquez pas uniformément aux environnements qui reçoivent leur configuration réseau depuis les métadonnées du cloud. Vérifiez la source de gestion de la configuration, comparez la sauvegarde de Netplan et son empreinte, contrôlez le résultat généré et testez la communication après un redémarrage normal.

## 8. Vérifier les problèmes de compatibilité d’authentification et de démarrage uniquement dans les configurations concernées

Les vérifications suivantes concernent les environnements qui utilisent le logiciel correspondant. Il n’est pas nécessaire d’ajouter ces logiciels à un serveur où ils ne sont pas installés.

### Si Samba fournit l’authentification à un domaine Windows

Samba AD/DC est une configuration qui fournit l’authentification et l’annuaire d’un domaine Windows. Lors de la migration vers Ubuntu 26.04, suivez les [consignes officielles de migration](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases) et vérifiez sur l’ancien système d’exploitation si `samba-ad-dc` est installé.

```bash
dpkg-query -W -f='${Status}\n' samba-ad-dc
apt-cache policy samba-ad-dc
```

Vérifiez que le résultat indique `install ok installed`. Si le paquet n’est pas installé, vérifiez les dépôts officiels et les ajouts prévus avant de l’installer sur l’ancien système d’exploitation. Ne mêlez pas l’installation d’un paquet nécessaire à la recréation du domaine ou à la modification de son niveau fonctionnel.

Pour la sauvegarde, utilisez la méthode appropriée de [`samba-tool domain backup`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), plutôt qu’une simple copie des fichiers de base de données. Lors de la validation de la restauration, vérifiez également les réponses de l’annuaire dans un environnement isolé. Des tests avec Samba 4.23 ont mis en évidence un cas où le service ne démarrait pas, faute de socket interne `/run/samba/nmbd`, même après déplacement des emplacements de la base de données et du PID. En séparant les données persistantes des répertoires d’exécution, vous pouvez distinguer une sauvegarde endommagée d’un environnement de validation incomplet.

### Si SSSD est connecté à une infrastructure d’authentification externe

SSSD est un mécanisme permettant de connecter Linux à des sources d’informations utilisateur et d’authentification telles qu’AD ou LDAP. Dans SSSD 2.10, [`config_file_version` a été supprimé](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes). Si un ancien paramètre est toujours présent, sauvegardez le propriétaire et les permissions du fichier d’origine avant de le modifier, puis vérifiez la configuration avec `sudo sssctl config-check`.

Tenez également compte du mode de démarrage. Un responder lancé par le monitor de SSSD peut entrer en conflit avec le même responder lancé par un socket systemd. Les responders sont les processus chargés notamment des requêtes d’informations utilisateur et de l’authentification. Comparez les journaux à la [documentation de la configuration de la version installée](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html), puis ne modifiez que les éléments en conflit.

Après la correction, vérifiez la récupération des informations utilisateur, les opérations d’authentification nécessaires et l’état Online du domaine. Pour une connexion AD, vérifiez également `adcli testjoin` avec la clé machine existante. Avant de régénérer une clé ou de réintégrer le domaine, isolez les problèmes de configuration et de méthode de démarrage.

### Si la mise à jour a été interrompue et que des paquets ou fichiers de démarrage sont incomplets

Commencez par vérifier les paquets non configurés et les dépendances avec `sudo dpkg --audit` et `sudo apt-get check`. Si une autre opération APT ou dpkg est en cours, n’en lancez pas une seconde. Ne supprimez pas les fichiers de verrouillage pour forcer la procédure.

Si l’opération précédente est terminée et qu’il est établi qu’il faut poursuivre la configuration de paquets non configurés, relancez-la avec `sudo dpkg --configure -a`. Vérifiez le résultat avant d’avancer et réglez d’abord les problèmes de dépôts ou de dépendances qui subsistent.

Même si un nouveau noyau est installé, le système ne pourra pas démarrer normalement s’il lui manque l’initrd nécessaire au démarrage. Vérifiez l’espace disponible dans `/boot`, les noyaux installés et les fichiers de démarrage correspondants. `update-initramfs -c -k 対象バージョン`, qui crée un nouvel initrd, et `-u`, qui met à jour un initrd existant, ont des fonctions différentes. [Spécifications d’update-initramfs](https://manpages.ubuntu.com/manpages/resolute/man8/update-initramfs.8.html)

Sélectionnez le noyau à réparer dans la liste des noyaux installés. `uname -r` indique le noyau actuellement en cours d’exécution : il peut donc s’agir de l’ancienne version, antérieure à la mise à jour.

Si le démarrage normal est impossible et que vous utilisez temporairement un shell de récupération root, vérifiez que les administrateurs ont autorisé la procédure, car elle permet de contourner l’authentification. Commencez par effectuer des contrôles en lecture seule et n’appliquez que les modifications nécessaires. Rétablissez les paramètres de démarrage temporaires et les éventuelles désactivations de démarrage de services, puis vérifiez le système avec un démarrage systemd normal. Le simple fait de pouvoir démarrer un service depuis le shell de récupération ne confirme pas son démarrage automatique.

## 9. Vérifier les critères de fin après le redémarrage

Une fois la mise à jour terminée, vérifiez que la configuration des paquets est achevée, puis effectuez un redémarrage normal. Après le redémarrage, comparez les informations enregistrées avant la mise à jour et vérifiez les points suivants.

| Critère de fin                                         | Éléments de preuve à vérifier                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| Le système a démarré normalement                       | L’ID de démarrage a changé et le système n’est pas resté dans le shell de récupération ou le mode d’urgence |
| Le système utilise la version et le noyau prévus       | `/etc/os-release` et `uname -r`. Ne vous fiez pas uniquement à la liste des noyaux installés                |
| Les paquets sont cohérents                             | Résultats de `dpkg --audit` et de `apt-get check`                                                           |
| Les services nécessaires ont redémarré automatiquement | Services, sockets et conteneurs, units en échec et réponses depuis l’extérieur                              |
| Les connexions et l’authentification fonctionnent      | SSH, VPN et parcours d’authentification nécessaires testés depuis un autre hôte                             |
| Les changements temporaires ont été annulés            | Admissions, pare-feu, timers, paquets bloqués, units et différences de configuration                        |
| L’état après mise à jour peut être restauré            | Résultat de la restauration réelle de la nouvelle sauvegarde et contrôles effectués                         |

Effectuez les tests non seulement depuis l’hôte mis à jour, mais aussi depuis un autre hôte proche du parcours réellement utilisé. Pour une API, vérifiez qu’une requête valide réussit et, sur les parcours qui nécessitent une authentification, que les requêtes sans authentification sont refusées conformément aux spécifications. Un HTTP 200 ne suffit pas à vérifier les frontières d’authentification ou les principales fonctions de l’application.

Après le rétablissement des admissions, vérifiez qu’aucune unit temporaire ni règle de maintenance ne subsiste. Pour les systèmes couverts par une sauvegarde, sauvegardez à nouveau l’état final, puis restaurez et vérifiez cette **nouvelle génération de sauvegarde**. Ne réutilisez pas la réussite de la restauration effectuée avant la mise à jour comme preuve de la sauvegarde après mise à jour. Si une sauvegarde avait été arrêtée intentionnellement, conservez son état d’arrêt initial.

Dans le compte rendu final, consignez les modifications apportées, les résultats des commandes, les opérations supplémentaires effectuées pour la reprise, les éléments vérifiés et les points restant en attente. Si vous n’avez pas testé la connexion d’un véritable utilisateur ou les principales opérations, indiquez-les comme non vérifiés. Distinguez également la récupération d’une partie de la sauvegarde de la restauration complète du service dans un autre environnement.

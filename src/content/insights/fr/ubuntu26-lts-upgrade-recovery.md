---
title: "Migration et récupération Ubuntu 26.04 : AD, sauvegardes et mises à jour sans joueurs"
description: "Retour d'expérience sur six serveurs Ubuntu : compatibilité Samba et SSSD, rétablissement des connexions, restaurations R2 et maintenance de Velocity sans joueurs."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "Un numéro de version ne prouve pas la réussite"
  text: "Vérifier le redémarrage normal, les connexions, le retour automatique des services, la configuration préservée et la restauration des sauvegardes concernées. Connexion interactive, partie réelle et reprise complète après sinistre demandent des essais distincts."
processFigure:
  eyebrow: "Critères de maintenance"
  title: "Des preuves initiales à la restauration après mise à jour"
  description: "En cas d'échec, consigner la cible et son état, puis effectuer une récupération limitée avant de poursuivre."
  variant: inline
  steps:
    - title: "Périmètre et accès de secours"
      description: "Vérifier dépendances, conditions d'arrêt, configuration et sauvegardes."
      icon: i-lucide-server
      accent: brand
    - title: "Arrêt et mise à jour"
      description: "Contrôler les nouvelles connexions, arrêter proprement et appliquer la mise à jour autorisée."
      icon: i-lucide-wrench
      accent: amber
    - title: "Démarrage et restauration"
      description: "Tester depuis un autre chemin, rétablir les états et restaurer la même génération."
      icon: i-lucide-shield-check
      accent: emerald
---

Mettre Ubuntu à jour exige aussi de préserver l'authentification, le réseau, les sauvegardes et les dépendances de démarrage. Le résultat attendu est un retour au fonctionnement normal après redémarrage.

Le 8 octobre 2026, nous avons achevé la migration ou la mise à jour de six serveurs Ubuntu : web, authentification, bots, CTF et proxy Minecraft. Deux sont passés de 24.04 à 26.04 ; quatre utilisaient déjà 26.04 et ont reçu des mises à jour ordinaires et un redémarrage. Cet article généralise les problèmes et vérifications réellement observés.

## Distinguer migration de version et mise à jour ordinaire

Une migration LTS suit la [procédure officielle Ubuntu](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/) avec `do-release-upgrade`. Les changements de paquets et la durée diffèrent d'une mise à jour ordinaire. Une règle « aucune suppression » prévue pour cette dernière ne se transpose pas telle quelle à une migration.

Identifier d'abord les rôles, dépendances, indisponibilité acceptable et accès à la console de secours. Nous avons conservé Netplan, SSH, authentification, services, conteneurs, timers et holds APT dans un espace réservé à root. Ces archives peuvent contenir des secrets et ne doivent pas être publiées.

Traiter un serveur à la fois et vérifier la fin des autres maintenances. Mettre toute la flotte à jour ne justifie ni le lancement de sauvegardes volontairement arrêtées ni la modification de machines sous un autre OS.

## Restaurer avant de se fier à une sauvegarde

Un stockage réussi ne prouve pas la récupération. Avant la mise à jour, nous avons restauré une génération R2 déterminée dans un espace distinct et contrôlé, selon la cible, bases de données, configuration et contenu ZIP. Voir aussi la [vérification des sauvegardes R2 et restic](/insights/restic-r2-backup-verification/).

Pour Samba AD, nous avons utilisé les [opérations de sauvegarde de `samba-tool`](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), puis testé la base restaurée et les réponses LDAP dans un DC isolé. Une simple copie des fichiers d'une base active ne suffisait pas.

Notre vérificateur Samba 4.23 échouait : déplacer DB et PID ne créait pas `/run/samba/nmbd`, nécessaire aux sockets internes. Nous avons vérifié l'isolation des espaces de noms réseau et montage avant de préparer un `/run` propre au test. Il ne s'agit pas de monter un tmpfs de validation sur le `/run` du serveur de production.

Pour une image disque du fournisseur, vérifier au préalable les restrictions de démarrage pendant la création, la taille, la durée et les unités de facturation. Les travaux supplémentaires ont utilisé des sauvegardes applicatives vérifiées et la configuration du système conservée, sans nouvelle image disque. Cela ne garantit pas la couverture d'une image complète. Les sauvegardes volontairement arrêtées sont restées arrêtées.

## Vérifier le paquet Samba AD/DC avant la migration

Ubuntu 26.04 nécessite `samba-ad-dc` pour AD/DC. Vérifier sa présence sur l'ancien OS avec les [notes de migration LTS](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases).

```bash
dpkg-query -W samba-ad-dc
```

S'il manque, confirmer le rôle AD/DC et les sources officielles APT, puis l'installer avant la migration. Préserver le domaine existant n'exige ni de le recréer ni d'augmenter son niveau fonctionnel.

## Après une interruption, inspecter l'état actuel

Le serveur d'authentification conservait des paquets non configurés et aucun initrd pour le nouveau noyau. Après inspection dans la console de secours, nous avons terminé la configuration nécessaire et généré l'initrd, puis retrouvé un démarrage systemd normal.

Un démarrage temporaire `init=/bin/bash` contourne l'authentification normale. Il a été autorisé pour ce démarrage et l'inspection a commencé en lecture seule. Aucun changement permanent de GRUB ou de mot de passe n'a été effectué. L'inhibition temporaire du démarrage des services a aussi été retirée.

Ces commandes sont des exemples de contrôle, pas un script universel de réparation. Vérifier les sorties avant publication pour ne pas divulguer de secrets ou de connexions.

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

Si le code de sortie de la migration initiale manque, ne pas inventer une réussite. Consigner les réparations et les observations ultérieures. La présence des fichiers du noyau ne démontre pas son utilisation lors d'un démarrage normal.

## Corriger réseau et authentification à partir des preuves

Même corrects, les fichiers Netplan peuvent être régénérés par un autre composant au démarrage. Dans notre mode de gestion, nous avons comparé leurs hashes et désactivé uniquement la régénération dans la [configuration réseau cloud-init](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). Cette mesure ne s'applique pas indistinctement aux réseaux gérés par le cloud.

L'absence de SSH peut aussi résulter des dépendances de démarrage. Le journal montrait un cycle entre d'anciens sockets de relais LDAP et le VPN, dont systemd annulait le démarrage. Après contrôle des listeners et du trafic actuels, seuls les sockets obsolètes ont été désactivés au démarrage. Un service inactive en attente de socket activation n'est pas nécessairement défaillant.

SSSD signalait l'option supprimée `config_file_version` et un conflit entre activation par monitor et par socket. Nous avons consulté les [changements SSSD 2.10](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes) et la [référence Ubuntu](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html), conservé propriétaire et permissions et limité les modifications. Tous les sockets SSSD n'ont pas été désactivés.

Ensuite, nous avons vérifié `sssctl config-check`, les responders NSS/PAM/PAC, l'état Online et `adcli testjoin` avec la clé machine existante. Aucune nouvelle clé ni réadhésion au domaine n'était nécessaire.

| Problème observé           | Preuve                              | Contrôle après réparation                      |
| -------------------------- | ----------------------------------- | ---------------------------------------------- |
| Composants AD/DC manquants | Inventaire et notes de migration    | Samba, DB/LDAP et ID initial du domaine        |
| VPN absent après démarrage | Cycle et annulation dans le journal | SSH, VPN, DNS et LDAP après redémarrage normal |
| Échecs SSSD et sockets     | Validation et logs de conflit       | Responders, Online et adhésion machine         |

## Sans joueurs : données fraîches et contrôle des admissions

Velocity n'a été mis à jour qu'en l'absence de joueurs. Les nombres provenaient du suivi JSON et de status pings, sans commandes périodiques `list` ou `glist`. Les neuf backends actifs, dont un hors du suivi JSON de huit machines, et le proxy ont été contrôlés.

La condition exigeait des nombres tous nuls, avec observations et snapshots de suivi datant de 15 secondes au maximum. Présence, données manquantes, requête échouée, valeur ancienne ou cible non couverte imposaient d'attendre. Les noms des joueurs étaient inutiles.

1. Confirmer des zéros récents partout et la fin des maintenances précédentes.
2. Valider la restauration préalable et sauvegarder configuration et états de la cible.
3. Relire les nombres juste avant l'arrêt.
4. Fermer temporairement les nouvelles admissions de jeu, puis exiger de nouveaux zéros.
5. Demander l'arrêt propre de Velocity et confirmer sa sortie avant la mise à jour APT.
6. Redémarrer normalement, vérifier indépendamment, rouvrir puis restaurer la sauvegarde finale.

Les règles couvraient le TCP/UDP nécessaire en IPv4/IPv6 et persistaient pendant le redémarrage. Un ensemble temporaire dédié préservait SSH, VPN, API et backends sans remplacer le pare-feu existant. La réouverture incluait la suppression des unités et règles temporaires.

L'arrêt propre utilisait [`shutdown` dans Velocity](https://docs.papermc.io/velocity/built-in-commands/). Les backends, mondes et plugins n'ont été ni arrêtés ni mis à jour dans cette intervention.

## Adapter les mises à jour progressives à la phase de travail

La maintenance ordinaire comprenait simulation sans suppression, récupération stricte des index APT, conservation de configuration et rétablissement des timers et holds. `NEEDRESTART_MODE=l` gardait les redémarrages dans l'ordre prévu. Un worker vérifiait la machine et son état arrêté, indépendamment de la connexion SSH.

Sept paquets ont été différés selon les [mises à jour progressives Ubuntu](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/). Leur inclusion n'a pas été forcée pour vider la liste d'attente.

Les prérequis d'une migration de version sont différents : la procédure officielle inclut la mise à jour des paquets progressifs. Ne pas appliquer telle quelle la politique quotidienne après migration aux prérequis de `do-release-upgrade`.

## Confirmer la fin par redémarrage et restauration de la même génération

Les six serveurs ont démarré normalement sous Ubuntu 26.04.1 avec le nouveau noyau. Nous avons vérifié boot ID, cohérence des paquets, unités en échec, SSH/VPN, retour automatique des services et restauration des paramètres, timers, holds et admissions.

Pour Velocity, nous avons testé status Java, RakNet Geyser et les connexions depuis une autre machine. L'API économique renvoyait 200 par le chemin permis, 401 sans authentification et 200 avec authentification. Un simple 200 ne valide pas la frontière d'authentification.

Pour les cibles sauvegardées, l'état final a été capturé puis la même génération restaurée. Une ancienne réussite de restauration ne prouve pas une nouvelle sauvegarde. Les sauvegardes délibérément désactivées sont restées désactivées.

Ces contrôles confirment le retour à l'exploitation ordinaire. Connexion utilisateur interactive, jeu réel, publications ou générations des bots et reprise complète après sinistre nécessitent d'autres essais. La migration Debian vers Ubuntu était hors périmètre.

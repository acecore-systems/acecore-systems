---
title: "Ubuntu 26.04 migration and recovery: AD, backups, and idle updates"
description: "Lessons from migrating and updating six Ubuntu servers: Samba and SSSD compatibility, connectivity recovery, real R2 restores, idle Velocity maintenance, and evidence of completion."
date: "2026-10-08T13:35:00+09:00"
author: gui
image: /images/insights/covers/ubuntu26-lts-upgrade-recovery-cover-v1.webp
tags: ["Ubuntu", "Samba", "SSSD", "Backup", "Minecraft"]
callout:
  type: note
  title: "A version string does not prove completion"
  text: "Verify normal reboot, connectivity, automatic service recovery, preserved configuration, and restoration of the relevant backups. Interactive user login, real Minecraft gameplay, and full disaster recovery require separate tests."
processFigure:
  eyebrow: "Maintenance acceptance"
  title: "From pre-change evidence to a verified post-update restore"
  description: "If a step fails, record the target and state, then recover within the agreed scope before continuing."
  variant: inline
  steps:
    - title: "Scope and recovery access"
      description: "Check dependencies, stop conditions, original configuration, and backups."
      icon: i-lucide-server
      accent: brand
    - title: "Stop and update"
      description: "Control new admission, stop gracefully, and apply the approved update."
      icon: i-lucide-wrench
      accent: amber
    - title: "Boot and restore"
      description: "Check responses independently, restore original states, and test the same backup generation."
      icon: i-lucide-shield-check
      accent: emerald
---

Updating Ubuntu also means preserving authentication, networking, backups, and startup dependencies. The goal is a server that returns to normal operation after reboot.

On October 8, 2026, we completed migration or updates on six Ubuntu servers serving web, authentication, bots, CTF, and a Minecraft proxy. Two moved from 24.04 to 26.04; four already ran 26.04 and received routine package updates and reboots. This article generalizes the problems and checks actually observed.

## Separate release upgrades from routine updates

For an LTS migration, follow the [official Ubuntu release-upgrade procedure](https://ubuntu.com/server/docs/how-to/software/upgrade-your-release/) using `do-release-upgrade`. A routine update on an existing 26.04 host has different package changes and timing. A zero-removal guard for routine maintenance must not be copied unchanged into a release upgrade.

First identify roles, dependencies, acceptable downtime, and access to the recovery console. Save Netplan, SSH, authentication configuration, services, containers, timers, and APT holds in a root-restricted location. These archives can contain secrets and do not belong in public articles or repositories.

Work on one host at a time and confirm other maintenance has finished. An instruction to update the fleet does not justify enabling deliberately stopped backups or modifying hosts running another OS.

## Restore backups before relying on them

A successful storage job does not prove recoverability. Before updating, we restored the selected R2 generation into a separate workspace and checked the relevant databases, settings, and ZIP contents. See also [R2 and restic backup verification](/insights/restic-r2-backup-verification/).

For Samba AD, we used [`samba-tool` backup operations](https://www.samba.org/samba/docs/current/man-html/samba-tool.8.html), then checked the restored database and LDAP responses in an isolated DC. Copying live database files alone was insufficient.

Our Samba 4.23 verifier failed because changing database and PID paths did not provide the internal socket directory `/run/samba/nmbd`. We changed the verifier to check that network and mount namespaces were isolated from production before preparing its own `/run`. This does not mean mounting a verification tmpfs over the production host's `/run`.

Check a provider disk image's startup restrictions during capture, storage size, duration, and billing units beforehand. For the additional work, we used verified application backups and saved OS configuration without creating new disk images. This does not guarantee the same recovery coverage as a complete disk image. Deliberately stopped backups remained stopped.

## Check the Samba AD/DC package first

Ubuntu 26.04 AD/DC deployments require `samba-ad-dc`. Check its presence on the old OS using the [LTS migration notes](https://documentation.ubuntu.com/release-notes/26.04/summary-for-lts-users/#upgrading-an-ad-dc-from-previous-ubuntu-releases).

```bash
dpkg-query -W samba-ad-dc
```

If missing, confirm that this host is an AD/DC and that its APT source is official, then install the package before upgrading. Preserving the existing domain does not require provisioning it again or raising its functional level.

## Inspect the current state after an interrupted upgrade

Our authentication server had unconfigured packages and a missing initrd for the new kernel. We inspected it through the recovery console, completed the required package configuration and initrd generation, then returned to a normal systemd boot.

A temporary `init=/bin/bash` boot bypasses normal authentication. We obtained permission for that boot and started with read-only inspection. We did not permanently change GRUB or passwords, and removed temporary service-start suppression afterward.

These are inspection examples, not a universal repair script. Check output for secrets and connection details before publishing it.

```bash
cat /etc/os-release
uname -r
sudo dpkg --audit
sudo apt-get check
sudo sshd -t
systemctl --failed
cat /proc/sys/kernel/random/boot_id
```

If the original upgrade exit code was not recorded, do not invent a successful value. Record the repairs and subsequent observations instead. Installed kernel files do not prove the machine booted normally with that kernel.

## Repair networking and authentication from evidence

Correct Netplan files do not prevent another component from regenerating configuration at boot. In our management model, we compared the original hashes and disabled only regeneration through [cloud-init's network configuration](https://docs.cloud-init.io/en/24.3/reference/network-config.html#disabling-network-configuration). This is not a blanket setting for environments that rely on cloud-managed networking.

Missing SSH connectivity can also come from startup dependencies. Our journal showed a cycle between obsolete LDAP forwarding sockets and the VPN, causing systemd to cancel VPN startup. After checking current forwarding listeners and traffic, we disabled automatic startup only for the obsolete sockets. An inactive service waiting for socket activation is not, by itself, a failure.

SSSD checks identified the removed `config_file_version` option and conflicting monitor/socket activation. We compared [SSSD 2.10 changes](https://sssd.io/release-notes/sssd-2.10.0.html#configuration-changes) with [Ubuntu's configuration reference](https://manpages.ubuntu.com/manpages/resolute/man5/sssd.conf.5.html), preserved ownership and permissions, and made limited changes. We did not disable every SSSD socket.

We then checked `sssctl config-check`, NSS/PAM/PAC responders, the domain's Online state, and `adcli testjoin` using the existing machine key. No key replacement or domain rejoin was needed.

| Observed problem                   | Evidence                                                    | Verification after repair                      |
| ---------------------------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| Missing AD/DC components           | Package inventory and migration notes                       | Samba startup, DB/LDAP, original domain ID     |
| VPN absent after normal boot       | Journal entries showing a dependency cycle and cancellation | SSH, VPN, DNS, LDAP after a normal reboot      |
| SSSD configuration/socket failures | Config check and responder conflict logs                    | Responders running, Online state, machine join |

## Idle Minecraft maintenance needs fresh data and admission control

Velocity maintenance was allowed only when nobody was playing. We collected counts through JSON monitoring and status pings without regularly sending `list` or `glist` to consoles. We checked all nine running backends, including one outside the eight-host JSON monitoring set, plus the proxy.

The gate accepted only all-zero counts with observations and monitoring snapshots no older than 15 seconds. Occupancy, missing data, query failure, stale values, or an uncovered target meant waiting. Player names were unnecessary.

1. Confirm fresh zeros everywhere and completion of earlier maintenance.
2. Complete the pre-update restore check and save configuration and original states for this target.
3. Query counts again immediately before stopping.
4. Temporarily close new game admission and require another fresh all-zero observation afterward.
5. Request a graceful Velocity shutdown and confirm exit before routine APT updates.
6. Reboot normally, verify independently, reopen admission, and restore-test the post-update backup.

Admission control covered the required IPv4/IPv6 TCP/UDP traffic and survived reboot. A dedicated temporary rule set preserved SSH, VPN, API, and backend traffic without replacing the existing firewall. Reopening included removal of temporary units and rules.

We used Velocity's console [`shutdown`](https://docs.papermc.io/velocity/built-in-commands/) command for graceful exit. Backend software, worlds, and plugins were neither stopped nor updated as part of this work.

## Handle phased updates according to the maintenance stage

Routine maintenance included a no-removal simulation, strict APT index retrieval, configuration preservation, and restoration of original timers and holds. We used `NEEDRESTART_MODE=l` to keep service restarts in the planned order. A worker checked the target host and stopped state and ran independently of the SSH connection.

Seven remaining packages were deferred according to [Ubuntu's phased updates](https://ubuntu.com/project/docs/how-ubuntu-is-made/concepts/phased-updates/). We did not force inclusion just to empty the pending list.

Release-upgrade prerequisites differ: Ubuntu's official procedure includes updating phased packages. Do not apply the routine post-migration policy unchanged to the prerequisites of `do-release-upgrade`.

## Prove completion with reboot and the same backup generation

All six servers booted normally into Ubuntu 26.04.1 with the new kernel. We checked changed boot IDs, package consistency, failed units, SSH/VPN, automatic recovery of role services, and original configuration, timers, holds, and admission states.

For Velocity, we tested Java status responses, Geyser RakNet responses, and connectivity from another host. The economy API returned 200 through the permitted path, 401 without authentication, and 200 with authentication. An HTTP 200 alone does not verify the authentication boundary.

Where backups were enabled, we captured the completed state and restored that exact generation. An earlier restore success was not reused as evidence for a new backup. Backups intentionally disabled remained disabled.

These checks confirmed return to ordinary operation. Interactive user login, actual Minecraft gameplay, bot posting or generation, and a full disaster recovery exercise remain separate tests. Debian-to-Ubuntu migration was outside this case's scope.

# Agent instructions

## Infrastructure

Deploy inventory for this project lives in the sibling repo `rootfox.cc-infra` at `state/dplo/projects/notepad.rootfox.cc/`.

When deploy paths, ports, env, secrets refs, nginx, or dplo scripts change, update `rootfox.cc-infra` in the same change set and keep it current.

## Deploy

Repo `scripts/build.sh` is the local compile/migrate helper. Production deploy (pm2 + args) lives in dplo project scripts (`rootfox.cc-infra` / `/var/lib/dplo/projects/notepad.rootfox.cc/scripts/build.sh`).

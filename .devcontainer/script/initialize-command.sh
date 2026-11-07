#! /usr/bin/env bash

set -euo pipefail

cp -n .devcontainer/.env.local.example .devcontainer/.env.local || true
mkdir -p "${HOME}/.orca/worktrees"
mkdir -p "${HOME}/.t3"
mkdir -p "${HOME}/.config/ghealth"

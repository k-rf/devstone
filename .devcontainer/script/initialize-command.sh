#! /usr/bin/env bash

set -euo pipefail

cp -n .devcontainer/.env.local.example .devcontainer/.env.local || true

DOCKER_GID=$(stat -c '%g' /var/run/docker.sock)
sed -i "s/^DOCKER_GID=.*/DOCKER_GID=${DOCKER_GID}/" .devcontainer/.env

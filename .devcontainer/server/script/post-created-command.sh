#! /usr/bin/env bash

set -euo pipefail

LOCAL_HOME=$1
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SHARED_SCRIPT_DIR=$(cd "${SCRIPT_DIR}/../../script" && pwd)

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

echo "${SSH_PUB_KEY}" >> "${HOME}/.ssh/authorized_keys"
chmod 600 "${HOME}/.ssh/authorized_keys"

"${SHARED_SCRIPT_DIR}/post-created-command.sh" "${LOCAL_HOME}"

#! /usr/bin/env bash

set -euo pipefail

LOCAL_HOME=$1
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SHARED_SCRIPT_DIR=$(cd "${SCRIPT_DIR}/../../script" && pwd)

"${SHARED_SCRIPT_DIR}/post-created-command.sh" "${LOCAL_HOME}"

#! /usr/bin/env bash

set -euo pipefail

GHEALTH_COMMIT="9cf02743d9ca051500b7c1c181eb88a9ae8988a5"
INSTALL_DIR="${HOME}/.local/bin"
TMP_DIR=$(mktemp -d)

trap 'rm -rf "${TMP_DIR}"' EXIT

mkdir -p "${INSTALL_DIR}"

curl -fsSL "https://github.com/Google-Health-API/google-health-cli/archive/${GHEALTH_COMMIT}.tar.gz" \
  | tar -xz -C "${TMP_DIR}" --strip-components=1

go build -C "${TMP_DIR}" -o "${INSTALL_DIR}/ghealth" .
go clean -cache -modcache

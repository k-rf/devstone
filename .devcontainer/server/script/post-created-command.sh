#! /usr/bin/env bash

set -euo pipefail

LOCAL_HOME=$1
SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
SHARED_SCRIPT_DIR=$(cd "${SCRIPT_DIR}/../../script" && pwd)

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

echo "${SSH_PUB_KEY}" >> "${HOME}/.ssh/authorized_keys"
chmod 600 "${HOME}/.ssh/authorized_keys"

# REMARKS: ~/.bashrc の先頭（非対話ガードの前）に SSH Agent ソケット自動検出スクリプトを挿入する
if ! grep -q "SSH Agent Socket Auto-Discovery" "${HOME}/.bashrc"; then
  TEMP_RC=$(mktemp)
  cat <<'EOF' > "${TEMP_RC}"
# === SSH Agent Socket Auto-Discovery ===
# ホストからマウントされた agent ディレクトリから最新の有効ソケットを検出して設定する
AGENT_DIR="/home/devstone/.ssh/agent"
if [ -d "$AGENT_DIR" ]; then
  LATEST_SOCK=$(find "$AGENT_DIR" -maxdepth 2 -type s -printf '%T@ %p\n' 2>/dev/null | sort -n | tail -1 | cut -f2- -d" ")
  if [ -n "$LATEST_SOCK" ]; then
    export SSH_AUTH_SOCK="$LATEST_SOCK"
  fi
fi

EOF
  cat "${HOME}/.bashrc" >> "${TEMP_RC}"
  mv "${TEMP_RC}" "${HOME}/.bashrc"
fi

# REMARKS: ホームディレクトリにホストコンピューターと同等のパスで `.claude` を配置するためのシンボリックリンクを作成する。
sudo mkdir -p "${LOCAL_HOME}"
sudo ln -sf "${HOME}/.claude" "${LOCAL_HOME}/.claude"

# REMARKS: difftastic を diff コマンドの代替として使用するためのエイリアスを設定する。
sudo git config --system alias.dft "-c diff.external=\"difft --color always\" -c pager.diff=false diff"

proto install

# REMARKS: Orca SSH relay 等はホーム起点で動くため、ワークスペースの .prototools だけでは proto::detect::failed になり Node/Python 未検出と判定される。
python "${SHARED_SCRIPT_DIR}/pin-proto-globals.py" .prototools

pnpm install
moon run :build

mkdir -p "${HOME}/.bash_completion.d"
moon completions > "${HOME}/.bash_completion.d/moon.sh"

cat >> "${HOME}/.bashrc" <<'EOF'

# moon
source ${HOME}/.bash_completion.d/moon.sh
EOF

pnpm exec lefthook install

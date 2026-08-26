#! /usr/bin/env bash

set -euo pipefail

LOCAL_HOME=$1

# REMARKS: ホームディレクトリにホストコンピューターと同等のパスで `.claude` を配置するためのシンボリックリンクを作成する。
sudo mkdir -p "${LOCAL_HOME}"
sudo ln -sf "${HOME}/.claude" "${LOCAL_HOME}/.claude"

proto install

# Orca SSH relay 等はホーム起点で動くため、ワークスペースの .prototools だけでは proto::detect::failed になり Node/Python 未検出と判定される。
python "$(dirname "$0")/pin-proto-globals.py" .prototools

pnpm install
moon run :build

mkdir -p "${HOME}/.bash_completion.d"
moon completions > "${HOME}/.bash_completion.d/moon.sh"

# 非インタラクティブなSSH接続でもprotoのPATHが通るように、.bashrcの先頭に設定を挿入する
if ! grep -q "export PROTO_HOME=" "${HOME}/.bashrc"; then
    sed -i '1i # proto\nexport PROTO_HOME="$HOME/.proto"\nexport PATH="$PROTO_HOME/shims:$PROTO_HOME/bin:$PATH"\n' "${HOME}/.bashrc"
fi

cat >> "${HOME}/.bashrc" <<'EOF'

# moon
source ${HOME}/.bash_completion.d/moon.sh
EOF

pnpm exec lefthook install

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

echo "${SSH_PUB_KEY}" >> "${HOME}/.ssh/authorized_keys"
chmod 600 "${HOME}/.ssh/authorized_keys"

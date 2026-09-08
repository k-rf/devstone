#! /usr/bin/env bash

set -euo pipefail

LOCAL_HOME=$1

mkdir -p "${HOME}/.ssh"
chmod 700 "${HOME}/.ssh"

echo "${SSH_PUB_KEY}" >> "${HOME}/.ssh/authorized_keys"
chmod 600 "${HOME}/.ssh/authorized_keys"

# REMARKS: ホームディレクトリにホストコンピューターと同等のパスで `.claude` を配置するためのシンボリックリンクを作成する。
sudo mkdir -p "${LOCAL_HOME}"
sudo ln -sf "${HOME}/.claude" "${LOCAL_HOME}/.claude"

# REMARKS: difftastic を diff コマンドの代替として使用するためのエイリアスを設定する。
sudo git config --system alias.dft "-c diff.external=\"difft --color always\" -c pager.diff=false diff"

proto install

# REMARKS: Orca SSH relay 等はホーム起点で動くため、ワークスペースの .prototools だけでは proto::detect::failed になり Node/Python 未検出と判定される。
python "$(dirname "$0")/pin-proto-globals.py" .prototools

pnpm install
moon run :build

mkdir -p "${HOME}/.bash_completion.d"
moon completions > "${HOME}/.bash_completion.d/moon.sh"

cat >> "${HOME}/.bashrc" <<'EOF'

# moon
source ${HOME}/.bash_completion.d/moon.sh
EOF

pnpm exec lefthook install

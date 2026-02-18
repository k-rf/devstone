#! /usr/bin/env bash

LOCAL_HOME=$1

# REMARKS: ホームディレクトリにホストコンピューターと同等のパスで `.claude` を配置するためのシンボリックリンクを作成する。
sudo mkdir -p "${LOCAL_HOME}"
sudo ln -sf "${HOME}/.claude" "${LOCAL_HOME}/.claude"

proto install

mkdir -p "${HOME}/.bash_completion.d"
moon completions > "${HOME}/.bash_completion.d/moon.sh"
cat >> "${HOME}/.bashrc" <<'EOF'

# moon
source $HOME/.bash_completion.d/moon.sh
EOF

npm install --global zx @google/gemini-cli @github/copilot

pnpm exec lefthook install

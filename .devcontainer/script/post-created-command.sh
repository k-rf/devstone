#! /usr/bin/env bash

LOCAL_HOME=$1

# REMARKS: ホームディレクトリにホストコンピューターと同等のパスで `.claude` を配置するためのシンボリックリンクを作成する。
sudo mkdir -p "${LOCAL_HOME}"
sudo ln -sf "${HOME}/.claude" "${LOCAL_HOME}/.claude"

proto install
pnpm install

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

echo "${SSH_PUB_KEY}" >> "${HOME}/.ssh/authorized_keys"

const config = {
  "*.{ts,mts,cts,tsx}": [
    "oxfmt",
    "bash -c 'pnpm run typecheck'",
    "eslint --fix --max-warnings 0 --no-warn-ignored",
  ],
  "*.{js,mjs,cjs,jsx}": ["oxfmt", "eslint --fix --max-warnings 0 --no-warn-ignored"],
  "*.{json,jsonc}": ["oxfmt", "eslint --fix --max-warnings 0 --no-warn-ignored"],
  "*.css": ["oxfmt", "eslint --fix --max-warnings 0 --no-warn-ignored"],
  "*.md": ["oxfmt", "markdownlint-cli2 --fix"],
};

export default config;

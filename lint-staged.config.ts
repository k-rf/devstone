const config = {
  "*.{ts,mts,cts,tsx}": ["oxfmt", "bash -c 'pnpm run typecheck'", "eslint --fix --max-warnings 0"],
  "*.{js,mjs,cjs,jsx}": ["oxfmt", "eslint --fix --max-warnings 0"],
  "*.{json,jsonc}": ["oxfmt", "eslint --fix --max-warnings 0"],
  "*.css": ["oxfmt", "eslint --fix --max-warnings 0"],
  "*.md": ["oxfmt", "markdownlint-cli2 --fix"],
};

export default config;

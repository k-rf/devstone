const config = {
  "*.{ts,mts,cts,tsx}": ["oxfmt", "bash -c 'pnpm run typecheck'", "eslint --fix"],
  "*.{js,mjs,cjs,jsx}": ["oxfmt", "eslint --fix"],
  "*.{json,jsonc}": ["oxfmt", "eslint --fix"],
  "*.css": ["oxfmt", "eslint --fix"],
  "*.md": ["oxfmt", "markdownlint-cli2 --fix"],
};

export default config;

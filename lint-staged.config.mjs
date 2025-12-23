export default {
  '*.{js,ts,tsx,jsx,vue}': ['npx prettier --write', 'npx eslint --fix'],
  '*.{json,md,yml,yaml}': ['npx prettier --write'],
}

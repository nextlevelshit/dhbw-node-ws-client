/** @type { import("eslint").Linter.Config } */
export default {
	root: true,
	extends: ["eslint:recommended", "plugin:svelte/recommended", "prettier"],
	parserOptions: {
		sourceType: "module",
		ecmaVersion: 2020,
		extraFileExtensions: [".svelte"]
	},
	env: {
		browser: true,
		es2017: true,
		node: true
	}
};

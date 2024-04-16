import { sveltekit } from "@sveltejs/kit/vite";

import { defineConfig } from "vite";
import { port } from "./src/config/constants.js";

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ['./public'],
		},
		proxy: {
			'/ws': {
				target: `ws://localhost:${port}`,
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/ws/, ''),
			},
		},
	},
});
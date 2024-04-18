import { sveltekit } from "@sveltejs/kit/vite";

import { defineConfig } from "vite";
import { serverPort, appPort } from "./src/config/constants.js";

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ["./public"]
		},
		port: appPort,
		strictPort: true,
		proxy: {
			"/ws": {
				target: `ws://localhost:${serverPort}`,
				changeOrigin: true,
				ws: true,
				rewrite: (path) => path.replace(/^\/ws/, "")
			}
		}
	}
});

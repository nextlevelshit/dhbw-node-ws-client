import { defineConfig } from "cypress";
import { appPort } from "./src/config/constants.js";

export default defineConfig({
	e2e: {
		baseUrl: `http://localhost:${appPort}`,
		setupNodeEvents(on, config) {
			// implement node event listeners here
		}
	}
});

# DHBW Node WS Client

This project is a WebSocket client built with JavaScript, TypeScript, and npm. It uses Svelte for the frontend, Vite for the build tool, and Tailwind CSS for styling.

## Development

For development, we use a combination of JavaScript and TypeScript. The project is set up with Vite, which provides a development server with hot module replacement. To start the development server, run the following command:

```bash
npm run start
```

This project uses Tailwind CSS for styling. The configuration for Tailwind can be found in `tailwind.config.js`. You can learn more about Tailwind CSS [here](https://tailwindcss.com/docs).

The Svelte configuration is located in `svelte.config.js`. You can learn more about Svelte [here](https://svelte.dev/docs).

## Testing

Testing is done using the `svelte-check` command, which checks for errors in your Svelte components. To run the tests, use the following command:

```bash
npm run check
```

## Serving

To build the project for production, use the following command:

```bash
npm run build
```

This will create a `dist` directory with the built project. You can then serve the project using any static server.

## CI/CD

Continuous Integration and Continuous Deployment (CI/CD) is managed through GitHub Actions. The configuration for the CI/CD pipeline can be found in the `.github/workflows` directory.

## Configuration

This project uses Vite for the build tool. The configuration for Vite can be found in `vite.config.js`. You can learn more about Vite [here](https://vitejs.dev/guide/).

The project also uses Tailwind CSS for styling. The configuration for Tailwind can be found in `tailwind.config.js`. You can learn more about Tailwind CSS [here](https://tailwindcss.com/docs).

The Svelte configuration is located in `svelte.config.js`. You can learn more about Svelte [here](https://svelte.dev/docs).

## Documentation

For more detailed information, please refer to the official documentation of the respective tools:

- [Svelte](https://svelte.dev/docs)
- [Vite](https://vitejs.dev/guide/)
- [Tailwind CSS](https://tailwindcss.com/docs)
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import staticAdapter from "@sveltejs/adapter-static";
import { sveltekit } from "@sveltejs/kit/vite";
import bunAdapter from "svelte-adapter-bun";

const pages = process.env.GITHUB_PAGES === "true";
const base = (process.env.BASE_PATH ?? "") as "" | `/${string}`;

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit({
      adapter: pages ? staticAdapter() : bunAdapter(),
      paths: { base },
      prerender: {
        handleHttpError: ({ path, message }) => {
          // This missing file deliberately demonstrates Shot's failure state.
          if (path.endsWith("/not-written-yet.png")) return;
          throw new Error(message);
        },
      },
    }),
  ],
});

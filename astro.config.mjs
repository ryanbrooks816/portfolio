import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

export default defineConfig({
  output: "server",

  adapter: cloudflare({
    remoteBindings: true,
    imageService: "compile",
  }),

  integrations: [mdx(), icon()],

  vite: {
    plugins: [tailwindcss()],
  },
});

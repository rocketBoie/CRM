import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  alias: {
    // This aliases 'vue' to the version that includes the compiler
    'vue': 'vue/dist/vue.esm-bundler.js'
  }
});

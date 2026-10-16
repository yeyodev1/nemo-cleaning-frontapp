import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Id de cada build: va en el bundle y en /version.json para avisar cuando hay versión nueva. */
const BUILD_ID = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now())

function versionFile(): Plugin {
  return {
    name: 'nemo-version-file',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ id: BUILD_ID }) })
    },
  }
}

export default defineConfig({
  plugins: [vue(), versionFile()],
  define: {
    __BUILD_ID__: JSON.stringify(BUILD_ID),
  },
  server: {
    port: 5173,
    allowedHosts: ['.bakano.ec', '.trycloudflare.com'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Solo tokens, funciones y mixins: se antepone a CADA <style lang="scss">.
        // Lo que emite CSS vive en global.scss (importado una vez desde main.ts).
        additionalData: `@use "@/styles/index.scss" as *;`,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
  },
})

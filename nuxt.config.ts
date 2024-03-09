// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  transpile: [
    '@volar/monaco'
  ],
  devtools: { enabled: false },
  ssr: false
})

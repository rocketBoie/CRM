import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { router } from './routers/router'
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia()


createApp(App)
.use(pinia.use(piniaPluginPersistedstate))
.use(router)
.mount('#app')

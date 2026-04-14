import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './store/auth'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore()
authStore.init().then(() => {
  router.beforeEach((to, from, next) => {
    if (to.meta.requiresAuth && !authStore.user) {
      next('/login')
    } else if (to.path === '/login' && authStore.user) {
      next('/')
    } else {
      next()
    }
  })
  
  app.use(router)
  app.mount('#app')
})

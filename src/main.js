import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './store/auth'
import { useSettingsStore } from './store/settings'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)

const authStore = useAuthStore()
const settingsStore = useSettingsStore()

authStore.init().then(async () => {
  // 로그인 상태면 설정 로드
  if (authStore.user) {
    await settingsStore.loadSettings()
  }

  router.beforeEach((to, from, next) => {
    const isLoggedIn = !!authStore.user
    const isAdmin = authStore.profile?.role === 'admin'
    const isSetupDone = settingsStore.isInitialized

    // 1. 인증이 필요한 페이지인데 로그인 안 됨
    if (to.meta.requiresAuth && !isLoggedIn) {
      return next('/login')
    }

    // 2. 이미 로그인한 상태에서 로그인 페이지 접근
    if (to.path === '/login' && isLoggedIn) {
      return next('/')
    }

    // 3. 초기설정 미완료 + admin + setup 페이지가 아닌 곳 접근
    if (isLoggedIn && isAdmin && !isSetupDone && to.path !== '/setup' && to.path !== '/login') {
      return next('/setup')
    }

    // 4. 초기설정 미완료 + 일반 사용자 → 안내 (대시보드에서 표시)
    // 5. 이미 초기설정 완료된 상태에서 /setup 접근 → 대시보드로
    if (to.path === '/setup' && isSetupDone) {
      return next('/')
    }

    next()
  })
  
  app.use(router)
  app.mount('#app')
})

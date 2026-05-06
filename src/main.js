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
  // settings/orgInfo는 비로그인도 읽을 수 있으므로 항상 로드 (초기화 여부 판단)
  await settingsStore.loadSettings()

  router.beforeEach((to, from, next) => {
    const isLoggedIn = !!authStore.user
    const isSetupDone = settingsStore.isInitialized

    // 1. 초기설정 미완료 → 로그인 여부 무관하게 /setup으로
    if (!isSetupDone && to.path !== '/setup') {
      return next('/setup')
    }

    // 2. 초기설정 완료 후 /setup 재접근 → 대시보드로
    if (to.path === '/setup' && isSetupDone) {
      return next('/')
    }

    // 3. 인증 필요 페이지 + 미로그인
    if (to.meta.requiresAuth && !isLoggedIn) {
      return next('/login')
    }

    // 4. 이미 로그인 상태에서 로그인 페이지 접근
    if (to.path === '/login' && isLoggedIn) {
      return next('/')
    }

    next()
  })

  app.use(router)
  app.mount('#app')
})

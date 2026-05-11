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

    // 2. 초기설정 완료 후 /setup 재접근 → 관리자는 허용, 일반은 대시보드로
    if (to.path === '/setup' && isSetupDone) {
      const isAdmin = authStore.profile?.role === 'admin'
      if (!isAdmin) return next('/')
    }

    // 3. 인증 필요 페이지 + 미로그인
    if (to.meta.requiresAuth && !isLoggedIn) {
      return next('/login')
    }

    // 4. 이미 로그인 상태에서 로그인 페이지 접근
    if (to.path === '/login' && isLoggedIn) {
      return next('/')
    }

    // 5. 로그인했지만 미승인(pending) 사용자 → /pending 격리
    const isPending = isLoggedIn && authStore.profile?.role === 'pending'
    if (isPending && to.path !== '/pending') return next('/pending')
    if (!isPending && to.path === '/pending') return next('/')

    next()
  })

  app.use(router)
  app.mount('#app')
})

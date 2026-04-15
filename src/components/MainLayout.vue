<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 사이드바 -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-300">
      <div class="p-6 border-b border-gray-100">
        <h2 class="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span class="p-1.5 bg-blue-600 rounded-lg text-white">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </span>
          {{ displayOrgName }}
        </h2>
      </div>
      
      <div class="p-4 flex-1 overflow-y-auto">
        <p class="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">메뉴</p>
        <div class="space-y-1">
          <router-link v-for="menu in filteredMenus" :key="menu.path" :to="menu.path" class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2" :class="[ $route.path === menu.path ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50' ]">
            <span class="text-base">{{ menu.icon }}</span>
            {{ menu.name }}
          </router-link>
        </div>
      </div>
      
      <div class="p-4 border-t border-gray-100">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex justify-center items-center font-bold text-sm">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 truncate">{{ authStore.profile?.name || '로딩중...' }}</p>
            <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full border border-gray-200 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition shadow-sm">
          로그아웃
        </button>
      </div>
    </aside>

    <!-- 메인 컨텐츠 영역 -->
    <main class="flex-1 overflow-y-auto w-full h-screen">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const route = useRoute()

const displayOrgName = computed(() => {
  return settingsStore.orgName || '공문서 관리'
})

const menus = [
  { path: '/', name: '대시보드', icon: '📊', roles: ['admin', 'receiver', 'reviewer', 'user'] },
  { path: '/receive', name: '문서 접수', icon: '📥', roles: ['admin', 'receiver'] },
  { path: '/assign', name: '배정 관리', icon: '📋', roles: ['admin', 'receiver'] },
  { path: '/mydocs', name: '내 문서함', icon: '📄', roles: ['reviewer', 'user'] },
  { path: '/search', name: '문서 검색', icon: '🔍', roles: ['admin', 'receiver', 'reviewer', 'user'] },
  { path: '/users', name: '사용자 관리', icon: '👥', roles: ['admin'] },
  { path: '/settings', name: '설정', icon: '⚙️', roles: ['admin'] }
]

const filteredMenus = computed(() => {
  const role = authStore.profile?.role || 'user'
  return menus.filter(m => m.roles.includes(role))
})

const userInitial = computed(() => {
  return authStore.profile?.name ? authStore.profile.name.charAt(0) : 'U'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

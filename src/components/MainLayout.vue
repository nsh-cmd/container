<template>
  <div class="min-h-screen bg-slate-50/50 flex font-sans">
    <!-- 모바일 오버레이 -->
    <div v-if="sidebarOpen" class="fixed inset-0 bg-black/30 z-20 md:hidden" @click="sidebarOpen = false"></div>

    <!-- 사이드바 -->
    <aside
      class="w-[260px] bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]
             fixed inset-y-0 left-0 z-30 -translate-x-full md:translate-x-0 md:static md:z-10 print:hidden"
      :class="{ 'translate-x-0': sidebarOpen }"
    >
      <div class="p-7 border-b border-slate-100 flex items-center justify-between">
        <h2 class="font-bold text-[19px] text-slate-800 flex items-center gap-3 tracking-tight">
          <span class="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-sm">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </span>
          {{ displayOrgName }}
        </h2>
        <button @click="sidebarOpen = false" class="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>

      <div class="p-5 flex-1 overflow-y-auto">
        <p class="text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-widest pl-1">MENU</p>
        <div class="space-y-1.5">
          <router-link v-for="menu in filteredMenus" :key="menu.path" :to="menu.path"
            class="w-full text-left px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all flex items-center gap-3"
            :class="[ $route.path === menu.path ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800' ]"
            @click="sidebarOpen = false">
            <span class="text-lg opacity-90">{{ menu.icon }}</span>
            {{ menu.name }}
          </router-link>
        </div>
      </div>

      <div class="p-5 border-t border-slate-100 bg-slate-50/50">
        <div class="flex items-center gap-3.5 mb-5 pl-1">
          <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-600 flex justify-center items-center font-bold text-sm shadow-sm border border-white">
            {{ userInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-[14px] font-bold text-slate-800 truncate tracking-tight">{{ authStore.profile?.name || '로딩중...' }}</p>
            <p class="text-[12px] font-medium text-slate-400 truncate">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <button @click="handleLogout" class="w-full border border-slate-200 bg-white text-slate-600 rounded-xl py-2.5 text-[13px] font-semibold hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          로그아웃
        </button>
        <p class="text-center text-[11px] text-slate-300 mt-3 font-mono tracking-tight">
          v{{ APP_VERSION }} <span class="text-slate-200">({{ APP_VERSION_DATE }})</span>
        </p>
      </div>
    </aside>

    <!-- 메인 컨텐츠 영역 -->
    <main class="flex-1 overflow-y-auto w-full h-screen relative">
      <!-- 모바일 상단 바 -->
      <div class="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-4 py-3 flex items-center gap-3 md:hidden print:hidden">
        <button @click="sidebarOpen = true" class="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
        <span class="text-[15px] font-bold text-slate-800">{{ displayOrgName }}</span>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'
import { APP_VERSION, APP_VERSION_DATE } from '../changelog'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()
const route = useRoute()

const sidebarOpen = ref(false)

const displayOrgName = computed(() => {
  return settingsStore.orgName || '공문서 관리'
})

const menus = [
  { path: '/', name: '대시보드', icon: '📊', roles: ['admin', 'receiver', 'reviewer'] },
  { path: '/receive', name: '문서 접수', icon: '📥', roles: ['admin', 'receiver'] },
  { path: '/assign', name: '배정 관리', icon: '📋', roles: ['admin', 'receiver'] },
  { path: '/mydocs', name: '내 문서함', icon: '📄', roles: ['reviewer', 'user'] },
  { path: '/register', name: '문서접수대장', icon: '📒', roles: ['admin', 'receiver', 'reviewer', 'user'] },
  { path: '/search', name: '문서 검색', icon: '🔍', roles: ['admin', 'receiver', 'reviewer', 'user'] },
  { path: '/users', name: '사용자 관리', icon: '👥', roles: ['admin'] },
  { path: '/settings', name: '설정', icon: '⚙️', roles: ['admin'] },
  { path: '/patches', name: '패치 내역', icon: '📋', roles: ['admin', 'receiver', 'reviewer', 'user'] }
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

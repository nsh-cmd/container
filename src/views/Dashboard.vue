<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- 사이드바 임시 (나중에 레이아웃으로 분리 가능) -->
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-6 border-b border-gray-100">
        <h2 class="font-bold text-lg text-gray-800 flex items-center gap-2">
          <span class="p-1.5 bg-blue-600 rounded-lg text-white">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </span>
          동행빌리지
        </h2>
      </div>
      <div class="p-4 flex-1">
        <p class="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wider">메뉴</p>
        <div class="space-y-1">
          <button class="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium bg-blue-50 text-blue-700">📊 대시보드</button>
          <!-- 추가 메뉴 템플릿 -->
          <!-- <button class="w-full text-left px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50">📥 문서 접수</button> -->
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
        <button @click="handleLogout" class="w-full border border-gray-200 text-gray-600 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 transition">
          로그아웃
        </button>
      </div>
    </aside>

    <!-- 메인 컨텐츠 영역 -->
    <main class="flex-1 p-8">
      <header class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">대시보드</h1>
        <p class="text-sm text-gray-500 mt-1">오늘의 공문서 현황을 확인하세요.</p>
      </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Stat Cards -->
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-400 mb-1 font-medium">접수대기</p>
          <p class="text-3xl font-bold text-gray-800">{{ stats.wait }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-400 mb-1 font-medium">배정완료</p>
          <p class="text-3xl font-bold text-gray-800">{{ stats.assigned }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-400 mb-1 font-medium">처리중</p>
          <p class="text-3xl font-bold text-gray-800">{{ stats.processing }}</p>
        </div>
        <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p class="text-xs text-gray-400 mb-1 font-medium">완료</p>
          <p class="text-3xl font-bold text-gray-800">{{ stats.done }}</p>
        </div>
      </div>
      
      <div class="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 max-w-4xl">
        <h2 class="text-md font-bold text-gray-800 mb-4">최근 등록된 문서 내역</h2>
        
        <table class="w-full text-left">
          <thead>
            <tr class="bg-gray-50 text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wider">
              <th class="px-4 py-3 font-medium">접수번호</th>
              <th class="px-4 py-3 font-medium">제목</th>
              <th class="px-4 py-3 font-medium">상태</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="d in recentDocs" :key="d.id" class="hover:bg-blue-50/50 transition">
              <td class="px-4 py-3 text-xs font-mono font-bold text-blue-600">{{ d.receiptNo }}</td>
              <td class="px-4 py-3 text-sm font-semibold text-gray-800 line-clamp-1">{{ d.title }}</td>
              <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs font-semibold rounded-lg" :class="{
                  'bg-gray-100 text-gray-600': d.status === '접수대기',
                  'bg-amber-50 text-amber-600': d.status === '배정완료',
                  'bg-blue-50 text-blue-600': d.status === '처리중',
                  'bg-green-50 text-green-700': d.status === '완료'
                }">{{ d.status }}</span>
              </td>
            </tr>
            <tr v-if="recentDocs.length === 0">
              <td colspan="3" class="px-4 py-6 text-center text-gray-400 text-sm">최근 등록된 문서가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { db } from '../firebase/config'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'

const authStore = useAuthStore()
const router = useRouter()

const stats = ref({ wait: 0, assigned: 0, processing: 0, done: 0 })
const recentDocs = ref([])

const userInitial = computed(() => {
  return authStore.profile?.name ? authStore.profile.name.charAt(0) : 'U'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const loadData = async () => {
  try {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(50))
    const snap = await getDocs(q)
    
    let w = 0, a = 0, p = 0, d = 0
    const docs = []

    snap.forEach(docSnap => {
      const data = docSnap.data()
      if (data.status === '접수대기') w++
      else if (data.status === '배정완료') a++
      else if (data.status === '처리중') p++
      else if (data.status === '완료') d++

      if (docs.length < 5) docs.push({ id: docSnap.id, ...data })
    })

    stats.value = { wait: w, assigned: a, processing: p, done: d }
    recentDocs.value = docs
  } catch (error) {
    console.error("Dashboard dataload error", error)
  }
}

onMounted(() => {
  loadData()
})
</script>

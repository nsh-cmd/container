<template>
  <div class="p-8">
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
      
      <div class="mt-8 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full">
        <h2 class="text-md font-bold text-gray-800 mb-4">최근 등록된 문서 내역</h2>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="bg-gray-50 text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                <th class="px-4 py-3 font-medium">접수번호</th>
                <th class="px-4 py-3 font-medium">분류</th>
                <th class="px-4 py-3 font-medium min-w-[200px]">제목 및 개요</th>
                <th class="px-4 py-3 font-medium">담당자</th>
                <th class="px-4 py-3 font-medium">검토 상태</th>
                <th class="px-4 py-3 font-medium">상태</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="d in recentDocs" :key="d.id" @click="goToSearch(d)" class="hover:bg-blue-50/50 transition cursor-pointer">
                <td class="px-4 py-3 text-xs font-mono font-bold text-blue-600">{{ d.receiptNo }}</td>
                <td class="px-4 py-3 text-xs text-gray-500">{{ d.categoryName || '-' }}</td>
                <td class="px-4 py-3 whitespace-normal">
                  <p class="text-sm font-semibold text-gray-800 line-clamp-1">{{ d.title }}</p>
                  <p class="text-xs text-gray-500 mt-0.5 line-clamp-1">{{ d.note || '특이사항 없음' }}</p>
                </td>
                <td class="px-4 py-3 text-sm text-gray-700 font-medium">{{ d.assigneeName || '미배정' }}</td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 flex-wrap">
                    <span v-if="!d.reviewSteps || d.reviewSteps.length === 0" class="text-xs text-gray-400">-</span>
                    <span v-for="(step, idx) in d.reviewSteps" :key="idx" 
                          class="px-1.5 py-0.5 text-[10px] rounded border"
                          :class="step.isRead ? 'bg-green-50 text-green-600 border-green-200' : 'bg-gray-50 text-gray-400 border-gray-200'"
                          :title="step.label + ': ' + (step.isRead ? '확인완료' : '미확인')">
                      {{ step.level }}차
                    </span>
                  </div>
                </td>
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
                <td colspan="6" class="px-4 py-6 text-center text-gray-400 text-sm">최근 등록된 문서가 없습니다.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
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

const goToSearch = (doc) => {
  router.push({ path: '/search', query: { q: doc.receiptNo } })
}

const userInitial = computed(() => {
  return authStore.profile?.name ? authStore.profile.name.charAt(0) : 'U'
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

const loadData = async () => {
  if (authStore.profile?.role === 'user') {
    router.replace('/mydocs')
    return
  }

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

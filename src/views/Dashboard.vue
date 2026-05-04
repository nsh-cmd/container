<template>
  <div class="p-8">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">대시보드</h1>
      <p class="text-sm text-gray-500 mt-1">오늘의 공문서 현황을 확인하세요.</p>
    </header>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <!-- Stat Cards -->
        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-[13px] text-slate-500 mb-2 font-semibold relative z-10">접수대기</p>
          <p class="text-4xl font-extrabold text-slate-800 tracking-tight relative z-10">{{ stats.wait }}</p>
        </div>
        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-[13px] text-amber-600 mb-2 font-semibold relative z-10">배정완료</p>
          <p class="text-4xl font-extrabold text-slate-800 tracking-tight relative z-10">{{ stats.assigned }}</p>
        </div>
        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-[13px] text-indigo-600 mb-2 font-semibold relative z-10">처리중</p>
          <p class="text-4xl font-extrabold text-slate-800 tracking-tight relative z-10">{{ stats.processing }}</p>
        </div>
        <div class="bg-white p-7 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] relative overflow-hidden group">
          <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
          <p class="text-[13px] text-emerald-600 mb-2 font-semibold relative z-10">완료</p>
          <p class="text-4xl font-extrabold text-slate-800 tracking-tight relative z-10">{{ stats.done }}</p>
        </div>
      </div>
      
      <div class="mt-8 bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] p-7 w-full overflow-hidden">
        <h2 class="text-[16px] font-bold text-slate-800 mb-5 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-indigo-500 rounded-full"></span>최근 등록된 문서
        </h2>
        
        <div class="overflow-x-auto -mx-7 px-7">
          <table class="w-full text-left whitespace-nowrap">
            <thead>
              <tr class="text-[12px] text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                <th class="px-4 py-3 font-semibold">접수번호</th>
                <th class="px-4 py-3 font-semibold">분류</th>
                <th class="px-4 py-3 font-semibold min-w-[200px]">제목 및 개요</th>
                <th class="px-4 py-3 font-semibold">담당자</th>
                <th class="px-4 py-3 font-semibold">검토 상태</th>
                <th class="px-4 py-3 font-semibold">진행 상태</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr v-for="d in recentDocs" :key="d.id" @click="goToSearch(d)" class="hover:bg-slate-50/80 transition-colors cursor-pointer group">
                <td class="px-4 py-4 text-[13px] font-mono font-bold text-indigo-600">{{ d.receiptNo }}</td>
                <td class="px-4 py-4 text-[13px] text-slate-500">{{ d.categoryName || '-' }}</td>
                <td class="px-4 py-4 whitespace-normal">
                  <p class="text-[14px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{{ d.title }}</p>
                  <p class="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{{ d.note || '특이사항 없음' }}</p>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-2">
                    <span class="text-[13px] text-slate-700 font-semibold">{{ d.assigneeName || '미배정' }}</span>
                    <span v-if="d.assigneeName" class="text-[10px] px-1.5 py-0.5 rounded-md border font-medium" :class="d.assigneeReadAt ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'">
                      {{ d.assigneeReadAt ? '읽음' : '미확인' }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span v-if="!d.reviewSteps || d.reviewSteps.length === 0" class="text-[12px] text-slate-400">-</span>
                    <span v-for="(step, idx) in d.reviewSteps" :key="idx" 
                          class="px-1.5 py-0.5 text-[10px] rounded-md border font-medium"
                          :class="step.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (step.isRead ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200')"
                          :title="stepTitle(step) + '(' + (step.name || '미지정') + ') ' + (step.isApproved ? '승인완료' : (step.isRead ? '확인중' : '미확인'))">
                      {{ stepTitle(step) }}{{ step.name ? '(' + step.name.replace(/ *\(자동생략\)/, '') + ')' : '' }}{{ step.isApproved ? '✓' : '' }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-4">
                  <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg" :class="{
                    'bg-slate-100 text-slate-600': d.status === '접수대기',
                    'bg-amber-100 text-amber-700': d.status === '배정완료',
                    'bg-indigo-100 text-indigo-700': d.status === '처리중',
                    'bg-emerald-100 text-emerald-700': d.status === '완료',
                    'bg-indigo-100 text-indigo-700': d.status === '검토중'
                  }">{{ d.status }}</span>
                </td>
              </tr>
              <tr v-if="recentDocs.length === 0">
                <td colspan="6" class="px-4 py-10 text-center text-slate-400 text-[13px]">최근 등록된 문서가 없습니다.</td>
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

const stepTitle = (step) => {
  const titles = { 1: '실장', 2: '국장', 3: '원장' }
  return titles[step.level] || step.label
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

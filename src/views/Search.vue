<template>
  <div class="p-4 md:p-8 pb-20 max-w-6xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">문서 검색</h1>
      <p class="text-sm text-gray-500 mt-1">키워드, 날짜, 분류 등의 복합 조건을 통해 문서를 조회합니다.</p>
    </header>

    <div class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 p-7 mb-8">
      <form @submit.prevent="doSearch" class="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div class="md:col-span-2">
          <label class="text-[13px] font-bold text-slate-600 block mb-1.5">검색어 (제목, 발신기관, 번호)</label>
          <input v-model="filters.keyword" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="검색어를 입력하세요">
        </div>
        
        <!-- 날짜 필터 생략 (클라이언트 필터) -->
        <div>
          <label class="text-[13px] font-bold text-slate-600 block mb-1.5">상태</label>
          <select v-model="filters.status" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
            <option value="">전체 상태</option>
            <option value="접수대기">접수대기</option>
            <option value="배정완료">배정완료</option>
            <option value="처리중">처리중</option>
            <option value="완료">완료</option>
          </select>
        </div>

        <div>
           <label class="text-[13px] font-bold text-slate-600 block mb-1.5">&nbsp;</label>
           <button type="submit" class="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-[14px] font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20" :disabled="loading">
             {{ loading ? '검색 중...' : '조회하기' }}
           </button>
        </div>
      </form>
    </div>

    <!-- 검색 결과 -->
    <div class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100">
      <div v-if="loading" class="p-12 text-center text-slate-400 text-[14px]">데이터를 불러오는 중입니다...</div>
      <div v-else-if="!hasSearched" class="p-12 text-center text-slate-400 text-[14px]">검색 조건을 입력한 뒤 조회버튼을 눌러주세요.</div>
      <div v-else-if="results.length === 0" class="p-12 text-center text-slate-500 font-bold text-[14px]">일치하는 문서가 없습니다.</div>
      
      <template v-else>
        <!-- 모바일 카드뷰 -->
        <div class="md:hidden divide-y divide-slate-50">
          <div v-for="d in results" :key="d.id" @click="openDocDetail(d)" class="px-5 py-4 active:bg-slate-50 cursor-pointer">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{{ d.receiptNo }}</span>
              <span class="px-2 py-0.5 text-[11px] font-bold rounded-md" :class="{
                'bg-slate-100 text-slate-600': d.status === '접수대기',
                'bg-amber-100 text-amber-700': d.status === '배정완료',
                'bg-indigo-100 text-indigo-700': d.status === '처리중' || d.status === '검토중',
                'bg-emerald-100 text-emerald-700': d.status === '완료'
              }">{{ d.status }}</span>
            </div>
            <p class="text-[14px] font-bold text-slate-800 mb-1 leading-snug">{{ d.title }}</p>
            <div class="text-[12px] text-slate-500 mb-1">
              {{ d.senderOrg || '-' }}<span v-if="d.senderDocNo" class="font-mono text-slate-400 ml-1 text-[11px]"> · {{ d.senderDocNo }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-x-2 text-[12px] text-slate-500 mb-2">
              <span>{{ d.categoryName || '-' }}</span>
              <span class="text-slate-300">·</span>
              <span>담당: <span class="font-semibold text-slate-700">{{ d.assigneeName || '미배정' }}</span></span>
              <span v-if="d.assigneeName" class="text-slate-300">·</span>
              <span v-if="d.assigneeName" class="text-[11px]" :class="d.assigneeReadAt ? 'text-emerald-500' : 'text-slate-400'">{{ d.assigneeReadAt ? '읽음' : '미확인' }}</span>
            </div>
            <div v-if="d.reviewSteps && d.reviewSteps.length > 0" class="flex flex-wrap gap-1.5 mt-1">
              <span v-for="(step, idx) in d.reviewSteps" :key="idx"
                    class="px-1.5 py-0.5 text-[10px] rounded-md border font-medium"
                    :class="isAutoSkipped(step) ? 'bg-amber-50 text-amber-700 border-amber-200' : (step.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (step.isRead ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'))">
                {{ stepTitle(step) }}{{ step.name ? '(' + step.name.replace(/ *\(자동생략\)/, '') + ')' : '' }}{{ isAutoSkipped(step) ? ' 검토생략' : (step.isApproved ? '✓' : '') }}
              </span>
            </div>
          </div>
        </div>

        <!-- 데스크톱 테이블 -->
        <div class="overflow-x-auto">
        <table class="hidden md:table w-full text-left whitespace-nowrap">
          <thead>
            <tr class="text-[12px] text-slate-400 border-b border-slate-100 uppercase tracking-wider bg-slate-50/50">
              <th class="px-7 py-4 font-semibold min-w-[120px]">접수번호</th>
              <th class="px-7 py-4 font-semibold">분류</th>
              <th class="px-7 py-4 font-semibold min-w-[130px]">발신기관<span class="block text-[10px] font-normal text-slate-400 normal-case tracking-normal">발신문서번호</span></th>
              <th class="px-7 py-4 font-semibold min-w-[200px] w-full">제목 및 개요</th>
              <th class="px-7 py-4 font-semibold whitespace-nowrap">담당자</th>
              <th class="px-7 py-4 font-semibold whitespace-nowrap">검토 상태</th>
              <th class="px-7 py-4 font-semibold whitespace-nowrap">상태</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr v-for="d in results" :key="d.id" @click="openDocDetail(d)" class="hover:bg-slate-50/80 transition-colors cursor-pointer group">
              <td class="px-7 py-4">
                <div class="text-[10px] font-mono font-bold text-indigo-600">{{ d.receiptNo }}</div>
                <div class="text-[10px] text-slate-400 mt-0.5">{{ formatDate(d.receiptDate) }}</div>
              </td>
              <td class="px-7 py-4 text-[13px] text-slate-500">{{ d.categoryName || '-' }}</td>
              <td class="px-7 py-4 whitespace-normal">
                <p class="text-[13px] text-slate-600 line-clamp-1">{{ d.senderOrg || '-' }}</p>
                <p v-if="d.senderDocNo" class="text-[10px] font-mono text-slate-500 mt-0.5">{{ d.senderDocNo }}</p>
                <p v-if="d.senderDocDate" class="text-[10px] text-slate-400">{{ formatDateStr(d.senderDocDate) }}</p>
              </td>
              <td class="px-7 py-4 whitespace-normal">
                <p class="text-[14px] font-bold text-slate-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">{{ d.title }}</p>
                <p class="text-[12px] text-slate-500 mt-0.5 line-clamp-1">{{ d.note || '특이사항 없음' }}</p>
              </td>
              <td class="px-7 py-4">
                <div class="flex items-center gap-2">
                  <span class="text-[13px] text-slate-700 font-semibold">{{ d.assigneeName || '미배정' }}</span>
                  <span v-if="d.assigneeName" class="text-[10px] px-1.5 py-0.5 rounded-md border font-medium" :class="d.assigneeReadAt ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'">
                    {{ d.assigneeReadAt ? '읽음' : '미확인' }}
                  </span>
                </div>
              </td>
              <td class="px-7 py-4">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span v-if="!d.reviewSteps || d.reviewSteps.length === 0" class="text-[12px] text-slate-400">-</span>
                  <span v-for="(step, idx) in d.reviewSteps" :key="idx"
                        class="px-1.5 py-0.5 text-[10px] rounded-md border font-medium"
                        :class="isAutoSkipped(step) ? 'bg-amber-50 text-amber-700 border-amber-200' : (step.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (step.isRead ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200'))"
                        :title="stepTitle(step) + '(' + (step.name || '미지정').replace(/ *\(자동생략\)/, '') + ') ' + (isAutoSkipped(step) ? '검토생략' : (step.isApproved ? '승인완료' : (step.isRead ? '확인중' : '미확인')))">
                    {{ stepTitle(step) }}{{ step.name ? '(' + step.name.replace(/ *\(자동생략\)/, '') + ')' : '' }}{{ isAutoSkipped(step) ? ' 검토생략' : (step.isApproved ? '✓' : '') }}
                  </span>
                </div>
              </td>
              <td class="px-7 py-4">
                <span class="px-2.5 py-1 text-[11px] font-bold rounded-lg" :class="{
                  'bg-slate-100 text-slate-600': d.status === '접수대기',
                  'bg-amber-100 text-amber-700': d.status === '배정완료',
                  'bg-indigo-100 text-indigo-700': d.status === '처리중' || d.status === '검토중',
                  'bg-emerald-100 text-emerald-700': d.status === '완료'
                }">{{ d.status }}</span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </template>
    </div>

    <!-- 문서 상세 모달 -->
    <DocDetailModal :show="showModal" :docData="selectedDoc" @close="showModal = false" @updated="doSearch" @deleted="showModal = false; doSearch()" />

    <!-- 커스텀 다이얼로그 -->
    <div v-if="dialog.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                 :class="dialog.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
              <svg v-if="dialog.type === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ dialog.title }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-line">{{ dialog.message }}</p>
          <div class="flex justify-end">
            <button @click="dialog.onConfirm" class="px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                    :class="dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'">확인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import DocDetailModal from '../components/DocDetailModal.vue'
import { useAuthStore } from '../store/auth'
import { isAutoSkipped } from '../utils/docUtils'

const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const hasSearched = ref(false)
const results = ref([])

// ── 커스텀 다이얼로그 ──
const dialog = ref({ show: false, title: '', message: '', type: 'info', isConfirm: false, onConfirm: () => {}, onCancel: () => {} })
const showAlert = (title, message, type = 'info') => new Promise((resolve) => {
  dialog.value = { show: true, title, message, type, isConfirm: false,
    onConfirm: () => { dialog.value.show = false; resolve() },
    onCancel: () => { dialog.value.show = false; resolve() }
  }
})

const filters = ref({
  keyword: '',
  status: ''
})

// 모달 관련 상태
const showModal = ref(false)
const selectedDoc = ref({})

const openDocDetail = (doc) => {
  selectedDoc.value = doc
  showModal.value = true
}

const stepTitle = (step) => {
  const titles = { 1: '실장', 2: '국장', 3: '원장' }
  return titles[step.level] || step.label
}

const doSearch = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    const userRole = authStore.profile?.role
    const userEmail = authStore.user.email
    const isBasicUser = userRole === 'user'

    let snap;
    if (isBasicUser) {
      // 일반 담당자는 자신에게 배정된 문서만 가져와서 로컬에서 정렬 및 필터링 (권한 및 색인 오류 방지)
      const q = query(collection(db, 'documents'), where('assigneeEmail', '==', userEmail))
      snap = await getDocs(q)
    } else {
      // 관리자 등은 전체 문서 중 최근 100건 조회
      const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(100))
      snap = await getDocs(q)
    }

    let fetched = snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      receiptDate: d.data().receiptDate?.toDate?.() || d.data().receiptDate,
      createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt
    }))

    // 로컬 상태 필터링 (복합 색인 오류 방지)
    if (filters.value.status) {
      fetched = fetched.filter(d => d.status === filters.value.status)
    }

    // 로컬 키워드 필터링 (Firestore는 Full-text Search 미지원)
    const kw = filters.value.keyword.trim().toLowerCase()
    if (kw) {
      fetched = fetched.filter(d => 
        (d.title || '').toLowerCase().includes(kw) ||
        (d.senderOrg || '').toLowerCase().includes(kw) ||
        (d.receiptNo || '').toLowerCase().includes(kw) ||
        (d.senderDocNo || '').toLowerCase().includes(kw)
      )
    }

    // 일반 사용자는 쿼리 시 정렬을 생략했으므로 메모리상에서 정렬
    if (isBasicUser) {
      fetched.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    }

    results.value = fetched
  } catch (err) {
    console.error(err)
    await showAlert('검색 오류', '검색 중 오류가 발생했습니다.\n권한 또는 네트워크를 확인하세요.', 'error')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateObj) => {
  if (!dateObj) return '-'
  const d = dateObj?.toDate ? dateObj.toDate() : new Date(dateObj)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

const formatDateStr = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-').map(Number)
  return `${y}.${m}.${d}`
}

onMounted(() => {
  if (route.query.q) {
    filters.value.keyword = route.query.q
    doSearch()
  }
})
</script>

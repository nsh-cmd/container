<template>
  <div class="p-8 pb-20 max-w-7xl mx-auto">
    <header class="mb-8 print:mb-4">
      <h1 class="text-2xl font-bold text-gray-900 print:text-xl">📋 문서접수대장</h1>
      <p class="text-sm text-gray-500 mt-1 print:hidden">기간, 제목, 검토 단계 등으로 조회하고 대장을 출력할 수 있습니다.</p>
    </header>

    <!-- 검색 필터 영역 (인쇄 시 숨김) -->
    <div class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 p-7 mb-8 print:hidden">
      <form @submit.prevent="doSearch" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <!-- 시작일 -->
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">접수 시작일</label>
            <input v-model="filters.dateFrom" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
          </div>
          <!-- 종료일 -->
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">접수 종료일</label>
            <input v-model="filters.dateTo" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
          </div>
          <!-- 제목 검색 -->
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">제목 / 발신기관</label>
            <input v-model="filters.keyword" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="검색어 입력">
          </div>
          <!-- 진행상태 -->
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">진행 상태</label>
            <select v-model="filters.status" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
              <option value="">전체</option>
              <option value="접수대기">접수대기</option>
              <option value="배정완료">배정완료</option>
              <option value="처리중">처리중</option>
              <option value="검토중">검토중</option>
              <option value="완료">완료</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <!-- 검토 단계 필터 -->
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">검토 단계</label>
            <select v-model="filters.reviewStage" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
              <option value="">전체</option>
              <option value="none">검토 전 (미배정/접수대기)</option>
              <option value="review1">실장 검토 진행 중</option>
              <option value="review2">국장 검토 진행 중</option>
              <option value="review3">원장 검토 진행 중</option>
              <option value="done">전체 검토 완료</option>
            </select>
          </div>
          <!-- 분류 -->
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">문서 분류</label>
            <select v-model="filters.category" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
              <option value="">전체 분류</option>
              <option v-for="cat in categories" :key="cat.code" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>
          <div></div>
          <!-- 버튼 영역 -->
          <div class="flex gap-2">
            <button type="submit" class="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-[14px] font-bold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20" :disabled="loading">
              {{ loading ? '조회 중...' : '조회하기' }}
            </button>
            <button type="button" @click="resetFilters" class="px-4 bg-slate-100 text-slate-600 rounded-xl py-2.5 text-[14px] font-semibold hover:bg-slate-200 transition-all">
              초기화
            </button>
          </div>
        </div>
      </form>
    </div>

    <!-- 결과 영역 -->
    <div v-if="hasSearched" class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden print:shadow-none print:border-0 print:rounded-none">
      
      <!-- 인쇄 헤더 (화면에서는 숨김) -->
      <div class="hidden print:block text-center mb-4 pt-4">
        <h2 class="text-xl font-bold">문 서 접 수 대 장</h2>
        <p class="text-sm text-gray-600 mt-1">
          {{ printDateRange }}
        </p>
        <p class="text-xs text-gray-500 mt-0.5">{{ settingsStore.orgName || '공문서 관리 시스템' }} · 출력일: {{ today }}</p>
      </div>

      <!-- 결과 상단 바 (인쇄 시 숨김) -->
      <div class="px-7 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between print:hidden">
        <p class="text-[13px] font-semibold text-slate-600">
          조회 결과 <span class="text-indigo-600 font-bold">{{ results.length }}</span>건
        </p>
        <button @click="handlePrint" class="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
          인쇄 / PDF
        </button>
      </div>

      <div v-if="loading" class="p-12 text-center text-slate-400 text-[14px]">데이터를 불러오는 중입니다...</div>
      <div v-else-if="results.length === 0" class="p-12 text-center text-slate-500 font-bold text-[14px]">조건에 맞는 문서가 없습니다.</div>
      
      <!-- 대장 테이블 -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left whitespace-nowrap print:text-[11px]" id="register-table">
          <thead>
            <tr class="text-[12px] text-slate-400 border-b border-slate-200 uppercase tracking-wider bg-slate-50/50 print:text-[10px] print:text-black print:bg-gray-100">
              <th class="px-4 py-3 font-semibold text-center w-[50px] print:px-2 print:py-1.5">번호</th>
              <th class="px-4 py-3 font-semibold min-w-[110px] print:px-2 print:py-1.5">접수번호</th>
              <th class="px-4 py-3 font-semibold min-w-[90px] print:px-2 print:py-1.5">접수일</th>
              <th class="px-4 py-3 font-semibold min-w-[80px] print:px-2 print:py-1.5">분류</th>
              <th class="px-4 py-3 font-semibold min-w-[100px] print:px-2 print:py-1.5">발신기관</th>
              <th class="px-4 py-3 font-semibold min-w-[200px] w-full print:px-2 print:py-1.5">문서 제목</th>
              <th class="px-4 py-3 font-semibold min-w-[70px] print:px-2 print:py-1.5">담당자</th>
              <th class="px-4 py-3 font-semibold min-w-[70px] print:px-2 print:py-1.5">접수자</th>
              <th class="px-4 py-3 font-semibold min-w-[180px] print:px-2 print:py-1.5">검토 현황</th>
              <th class="px-4 py-3 font-semibold min-w-[70px] print:px-2 print:py-1.5">상태</th>
              <th class="px-4 py-3 font-semibold min-w-[50px] print:px-2 print:py-1.5">첨부</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 print:divide-slate-200">
            <tr v-for="(d, idx) in results" :key="d.id" class="hover:bg-slate-50/80 transition-colors print:hover:bg-transparent">
              <td class="px-4 py-3 text-[13px] text-center text-slate-500 print:px-2 print:py-1.5 print:text-[10px]">{{ idx + 1 }}</td>
              <td class="px-4 py-3 text-[13px] font-mono font-bold text-indigo-600 print:px-2 print:py-1.5 print:text-black print:font-normal print:text-[10px]">{{ d.receiptNo }}</td>
              <td class="px-4 py-3 text-[13px] text-slate-600 print:px-2 print:py-1.5 print:text-[10px]">{{ formatDate(d.receiptDate) }}</td>
              <td class="px-4 py-3 text-[13px] text-slate-600 print:px-2 print:py-1.5 print:text-[10px]">{{ d.categoryName || '-' }}</td>
              <td class="px-4 py-3 text-[13px] text-slate-600 print:px-2 print:py-1.5 print:text-[10px]">{{ d.senderOrg || '-' }}</td>
              <td class="px-4 py-3 text-[14px] font-semibold text-slate-800 whitespace-normal print:px-2 print:py-1.5 print:text-[10px] print:font-normal">{{ d.title }}</td>
              <td class="px-4 py-3 text-[13px] text-slate-700 font-medium print:px-2 print:py-1.5 print:text-[10px]">{{ d.assigneeName || '미배정' }}</td>
              <td class="px-4 py-3 text-[13px] text-slate-500 print:px-2 print:py-1.5 print:text-[10px]">{{ d.receiptUserName || '-' }}</td>
              <td class="px-4 py-3 print:px-2 print:py-1.5">
                <div class="flex items-center gap-1 flex-wrap">
                  <template v-if="d.reviewSteps && d.reviewSteps.length > 0">
                    <span v-for="(step, sIdx) in d.reviewSteps" :key="sIdx"
                      class="px-1.5 py-0.5 text-[10px] rounded-md border font-medium print:border-gray-400 print:rounded-none print:text-[9px]"
                      :class="step.isApproved 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100 print:bg-transparent print:text-black' 
                        : (step.isRead 
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100 print:bg-transparent print:text-black' 
                          : 'bg-slate-50 text-slate-400 border-slate-200 print:bg-transparent print:text-gray-500')"
                      :title="stepTitle(step) + '(' + (step.name || '미지정') + ') ' + (step.isApproved ? '승인완료' : (step.isRead ? '확인중' : '대기'))">
                      {{ stepTitle(step) }}{{ step.name ? '(' + step.name.replace(/ *\(자동생략\)/, '') + ')' : '' }}{{ step.isApproved ? '✓' : '' }}
                    </span>
                  </template>
                  <span v-else class="text-[11px] text-slate-400 print:text-[9px]">-</span>
                </div>
              </td>
              <td class="px-4 py-3 print:px-2 print:py-1.5">
                <span class="px-2 py-0.5 text-[11px] font-bold rounded-md print:font-normal print:text-[9px] print:px-0" :class="{
                  'bg-slate-100 text-slate-600 print:bg-transparent': d.status === '접수대기',
                  'bg-amber-100 text-amber-700 print:bg-transparent print:text-black': d.status === '배정완료',
                  'bg-indigo-100 text-indigo-700 print:bg-transparent print:text-black': d.status === '처리중' || d.status === '검토중',
                  'bg-emerald-100 text-emerald-700 print:bg-transparent print:text-black': d.status === '완료'
                }">{{ d.status }}</span>
              </td>
              <td class="px-4 py-3 text-[13px] text-center text-slate-500 print:px-2 print:py-1.5 print:text-[10px]">{{ d.attachmentCount || 0 }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 인쇄 푸터 (화면에서는 숨김) -->
      <div class="hidden print:block text-right mt-4 px-4 pb-4 text-[10px] text-gray-500 border-t border-gray-300 pt-2">
        총 {{ results.length }}건 · {{ settingsStore.orgName || '' }} 문서접수대장
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { db } from '../../firebase/config'
import { collection, query, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore'
import { useSettingsStore } from '../../store/settings'

const settingsStore = useSettingsStore()

const loading = ref(false)
const hasSearched = ref(false)
const results = ref([])
const categories = ref([])

const filters = ref({
  dateFrom: '',
  dateTo: '',
  keyword: '',
  status: '',
  reviewStage: '',
  category: ''
})

const today = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
})

const printDateRange = computed(() => {
  if (filters.value.dateFrom && filters.value.dateTo) {
    return `조회 기간: ${filters.value.dateFrom} ~ ${filters.value.dateTo}`
  } else if (filters.value.dateFrom) {
    return `조회 기간: ${filters.value.dateFrom} ~`
  } else if (filters.value.dateTo) {
    return `조회 기간: ~ ${filters.value.dateTo}`
  }
  return '조회 기간: 전체'
})

const loadCategories = async () => {
  try {
    const catSnap = await getDoc(doc(db, 'settings', 'categories'))
    if (catSnap.exists() && catSnap.data().items) {
      categories.value = catSnap.data().items.filter(c => c.active)
    }
  } catch (e) {
    console.error('분류 로드 실패:', e)
  }
}

const resetFilters = () => {
  filters.value = { dateFrom: '', dateTo: '', keyword: '', status: '', reviewStage: '', category: '' }
}

// 검토 단계 필터 로직
const matchReviewStage = (doc, stage) => {
  if (!stage) return true
  const steps = doc.reviewSteps || []
  
  if (stage === 'none') {
    return !doc.assigneeName || doc.status === '접수대기'
  }
  if (stage === 'done') {
    return steps.length > 0 && steps.every(s => s.isApproved)
  }
  // review1, review2, review3
  const levelNum = parseInt(stage.replace('review', ''))
  if (isNaN(levelNum)) return true
  
  // 해당 레벨의 검토가 '현재 진행 중'인 상태:
  // - 이전 단계는 모두 승인됨
  // - 해당 단계는 아직 승인 안 됨
  const stepIdx = steps.findIndex(s => s.level === levelNum)
  if (stepIdx === -1) return false
  
  const prevApproved = steps.slice(0, stepIdx).every(s => s.isApproved)
  const currentNotApproved = !steps[stepIdx].isApproved
  return prevApproved && currentNotApproved
}

const doSearch = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    const q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(500))
    const snap = await getDocs(q)

    let fetched = snap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      receiptDate: d.data().receiptDate?.toDate?.() || d.data().receiptDate,
      createdAt: d.data().createdAt?.toDate?.() || d.data().createdAt
    }))

    // 기간 필터
    if (filters.value.dateFrom) {
      const from = new Date(filters.value.dateFrom)
      from.setHours(0, 0, 0, 0)
      fetched = fetched.filter(d => d.receiptDate && new Date(d.receiptDate) >= from)
    }
    if (filters.value.dateTo) {
      const to = new Date(filters.value.dateTo)
      to.setHours(23, 59, 59, 999)
      fetched = fetched.filter(d => d.receiptDate && new Date(d.receiptDate) <= to)
    }

    // 키워드 필터
    const kw = filters.value.keyword.trim().toLowerCase()
    if (kw) {
      fetched = fetched.filter(d =>
        (d.title || '').toLowerCase().includes(kw) ||
        (d.senderOrg || '').toLowerCase().includes(kw) ||
        (d.receiptNo || '').toLowerCase().includes(kw) ||
        (d.senderDocNo || '').toLowerCase().includes(kw)
      )
    }

    // 상태 필터
    if (filters.value.status) {
      fetched = fetched.filter(d => d.status === filters.value.status)
    }

    // 분류 필터
    if (filters.value.category) {
      fetched = fetched.filter(d => d.categoryName === filters.value.category)
    }

    // 검토 단계 필터
    fetched = fetched.filter(d => matchReviewStage(d, filters.value.reviewStage))

    results.value = fetched
  } catch (err) {
    console.error(err)
    alert('조회 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

const stepTitle = (step) => {
  const titles = { 1: '실장', 2: '국장', 3: '원장' }
  return titles[step.level] || step.label
}

const handlePrint = () => {
  window.print()
}

const formatDate = (dateObj) => {
  if (!dateObj) return '-'
  const d = new Date(dateObj)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
@media print {
  /* 인쇄 시 전체 페이지 설정 */
  :deep(.min-h-screen) {
    min-height: auto !important;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
  }
  
  th, td {
    border: 1px solid #d1d5db !important;
    white-space: normal !important;
    word-break: break-all;
  }
}
</style>

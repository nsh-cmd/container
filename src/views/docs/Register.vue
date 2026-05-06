<template>
  <div class="p-4 md:p-8 pb-20 max-w-7xl mx-auto print:p-0 print:pb-0 print:max-w-none">
    <header class="mb-8 print:hidden">
      <h1 class="text-2xl font-bold text-gray-900">📋 문서접수대장</h1>
      <p class="text-sm text-gray-500 mt-1">기간, 제목, 검토 단계 등으로 조회하고 대장을 출력할 수 있습니다.</p>
    </header>

    <!-- 검색 필터 영역 (인쇄 시 숨김) -->
    <div class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 p-7 mb-8 print:hidden">
      <form @submit.prevent="doSearch" class="space-y-5">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">접수 시작일</label>
            <input v-model="filters.dateFrom" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
          </div>
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">접수 종료일</label>
            <input v-model="filters.dateTo" type="date" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
          </div>
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">제목 / 발신기관</label>
            <input v-model="filters.keyword" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm" placeholder="검색어 입력">
          </div>
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
          <div>
            <label class="text-[13px] font-bold text-slate-600 block mb-1.5">문서 분류</label>
            <select v-model="filters.category" class="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[14px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm">
              <option value="">전체 분류</option>
              <option v-for="cat in categories" :key="cat.code" :value="cat.name">{{ cat.name }}</option>
            </select>
          </div>
          <div></div>
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
    <div v-if="hasSearched" class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 print:shadow-none print:border-0 print:rounded-none">

      <!-- 인쇄 헤더 (화면에서는 숨김) -->
      <div class="hidden print:block text-center print:mb-1">
        <h2 class="text-[22px] font-bold tracking-widest print:text-[22px] print:tracking-[0.25em]">문 서 접 수 대 장</h2>
        <p class="text-[9px] text-gray-500 print:text-[5.5px] print:mt-0">{{ printDateRange }} · {{ settingsStore.orgName || '공문서 관리 시스템' }} · 출력일: {{ today }}</p>
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

      <template v-else>
        <!-- 모바일 카드뷰 (md 미만 화면, 인쇄 시 숨김) -->
        <div class="md:hidden print:hidden divide-y divide-slate-50">
          <div v-for="(d, idx) in results" :key="d.id" class="px-5 py-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-slate-400 font-medium">{{ idx + 1 }}</span>
                <span class="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{{ d.receiptNo }}</span>
              </div>
              <span class="px-2 py-0.5 text-[11px] font-bold rounded-md" :class="{
                'bg-slate-100 text-slate-600': d.status === '접수대기',
                'bg-amber-100 text-amber-700': d.status === '배정완료',
                'bg-indigo-100 text-indigo-700': d.status === '처리중' || d.status === '검토중',
                'bg-emerald-100 text-emerald-700': d.status === '완료'
              }">{{ d.status }}</span>
            </div>
            <p class="text-[14px] font-bold text-slate-800 mb-1.5 leading-snug">{{ d.title }}</p>
            <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[12px] text-slate-500 mb-2">
              <span>{{ d.senderOrg || '-' }}</span>
              <span class="text-slate-300">·</span>
              <span>{{ d.categoryName || '-' }}</span>
              <span class="text-slate-300">·</span>
              <span>{{ formatDate(d.receiptDate) }}</span>
            </div>
            <div v-if="d.senderDocNo" class="text-[12px] text-slate-400 mb-1">발신문서번호: <span class="text-slate-600 font-medium">{{ d.senderDocNo }}</span><span v-if="d.senderDocDate"> ({{ formatDateStr(d.senderDocDate) }})</span></div>
            <div class="flex items-center justify-between text-[12px] mb-2">
              <span class="text-slate-500">담당: <span class="font-semibold text-slate-700">{{ d.assigneeName || '미배정' }}</span></span>
              <span class="text-slate-400">📎 {{ d.attachmentCount || 0 }}</span>
            </div>
            <div v-if="d.reviewSteps && d.reviewSteps.length > 0" class="mt-2 pt-2.5 border-t border-slate-50 flex flex-wrap gap-2">
              <div v-for="(step, sIdx) in d.reviewSteps" :key="sIdx" class="flex flex-col items-center gap-0.5">
                <span class="px-1.5 py-0.5 text-[10px] rounded-md border font-medium"
                  :class="step.isApproved ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : (step.isRead ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-400 border-slate-200')">
                  {{ stepTitle(step) }}{{ step.name ? '(' + step.name.replace(/ *\(자동생략\)/, '') + ')' : '' }}{{ step.isApproved ? '✓' : '' }}
                </span>
                <span v-if="step.isApproved && step.approvedAt" class="text-[9px] font-medium text-emerald-500">{{ formatShortDate(step.approvedAt) }}</span>
                <span v-else-if="step.isRead && step.readAt" class="text-[9px] text-indigo-400">{{ formatShortDate(step.readAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 데스크톱 테이블 (md 이상) 및 인쇄 -->
        <div class="hidden md:block print:block overflow-x-auto">
          <table class="w-full text-left whitespace-nowrap" id="register-table">
            <thead>
              <tr class="text-[12px] text-slate-400 border-b border-slate-200 uppercase tracking-wider bg-slate-50/50
                         print:text-[8px] print:text-black print:bg-gray-100 print:tracking-normal print:text-center print:uppercase-none">
                <th class="px-4 py-3 font-semibold text-center w-[50px]  print:w-[3%]">번호</th>
                <th class="px-4 py-3 font-semibold min-w-[110px]         print:w-[11%]">접수번호<br class="hidden print:block"><span class="hidden print:inline text-[7px] font-normal">(접수일)</span></th>
                <th class="px-4 py-3 font-semibold min-w-[80px]          print:w-[5%]">분류</th>
                <th class="px-4 py-3 font-semibold min-w-[140px]         print:w-[14%]">발신기관<br class="hidden print:block"><span class="hidden print:inline text-[7px] font-normal">(발신문서번호/시행일자)</span><span class="md:block hidden text-[10px] font-normal text-slate-400 normal-case tracking-normal">발신문서번호</span></th>
                <th class="px-4 py-3 font-semibold min-w-[200px] w-full  print:w-[29%]">문서 제목</th>
                <th class="px-4 py-3 font-semibold min-w-[70px]          print:w-[7%]">담당자</th>
                <th class="px-4 py-3 font-semibold min-w-[70px]          print:w-[7%]">접수자</th>
                <th class="px-4 py-3 font-semibold min-w-[240px]         print:w-[17%]">검토 현황 (일자)</th>
                <th class="px-4 py-3 font-semibold min-w-[70px]          print:w-[7%]">상태</th>
                <th class="px-4 py-3 font-semibold min-w-[50px] print:hidden">첨부</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50 print:divide-slate-200">
              <tr v-for="(d, idx) in results" :key="d.id" class="hover:bg-slate-50/80 transition-colors print:hover:bg-transparent">
                <!-- 번호 -->
                <td class="px-4 py-3 text-[13px] text-center text-slate-500">{{ idx + 1 }}</td>
                <!-- 접수번호 + 접수일 -->
                <td class="px-4 py-3 print:text-center">
                  <div class="text-[10px] font-mono font-bold text-indigo-600 print:text-black print:font-normal">{{ d.receiptNo }}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5 print:text-[7px] print:text-gray-600">{{ formatDate(d.receiptDate) }}</div>
                </td>
                <!-- 분류 -->
                <td class="px-4 py-3 text-[13px] text-slate-600">{{ d.categoryName || '-' }}</td>
                <!-- 발신기관 + 발신문서번호 + 시행일자 -->
                <td class="px-4 py-3 print:text-center">
                  <div class="text-[13px] text-slate-600 print:line-clamp-2">{{ d.senderOrg || '-' }}</div>
                  <div v-if="d.senderDocNo" class="text-[10px] font-mono text-slate-500 mt-0.5 print:text-[7px] print:text-black">{{ d.senderDocNo }}</div>
                  <div v-if="d.senderDocDate" class="text-[10px] text-slate-400 print:text-[7px] print:text-gray-600">{{ formatDateStr(d.senderDocDate) }}</div>
                </td>
                <!-- 문서 제목: td는 그대로, 안에 div로 line-clamp -->
                <td class="px-4 py-3 text-[14px] font-semibold text-slate-800 whitespace-normal print:font-normal">
                  <div class="print:line-clamp-2 print:text-left">{{ d.title }}</div>
                </td>
                <!-- 담당자 -->
                <td class="px-4 py-3 text-[13px] text-slate-700 font-medium">{{ d.assigneeName || '미배정' }}</td>
                <!-- 접수자 -->
                <td class="px-4 py-3 text-[13px] text-slate-500">{{ d.receiptUserName || '-' }}</td>
                <!-- 검토 현황 -->
                <td class="px-4 py-3">
                  <div class="flex items-start gap-2 flex-wrap print:flex-nowrap print:gap-1 print:justify-center">
                    <template v-if="d.reviewSteps && d.reviewSteps.length > 0">
                      <div v-for="(step, sIdx) in d.reviewSteps" :key="sIdx" class="flex flex-col items-center gap-0.5">
                        <span class="px-1.5 py-0.5 text-[10px] rounded-md border font-medium whitespace-nowrap
                                     print:text-[7px] print:px-0.5 print:py-0 print:border-gray-400 print:rounded-none"
                              :class="step.isApproved
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 print:bg-transparent print:text-black'
                                : (step.isRead
                                  ? 'bg-indigo-50 text-indigo-600 border-indigo-100 print:bg-transparent print:text-black'
                                  : 'bg-slate-50 text-slate-400 border-slate-200 print:bg-transparent print:text-gray-500')">
                          {{ stepTitle(step) }}{{ step.name ? '(' + step.name.replace(/ *\(자동생략\)/, '') + ')' : '' }}{{ step.isApproved ? '✓' : '' }}
                        </span>
                        <span v-if="step.isApproved && step.approvedAt" class="text-[9px] font-medium text-emerald-500 print:text-[6px] print:text-black">{{ formatShortDate(step.approvedAt) }}</span>
                        <span v-else-if="step.isRead && step.readAt" class="text-[9px] text-indigo-400 print:text-[6px] print:text-gray-600">{{ formatShortDate(step.readAt) }}</span>
                        <span v-else class="text-[9px] text-slate-300 print:hidden">-</span>
                      </div>
                    </template>
                    <span v-else class="text-[11px] text-slate-400">-</span>
                  </div>
                </td>
                <!-- 상태 -->
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 text-[11px] font-bold rounded-md print:px-0 print:font-normal print:bg-transparent print:text-black print:rounded-none"
                        :class="{
                          'bg-slate-100 text-slate-600':   d.status === '접수대기',
                          'bg-amber-100 text-amber-700':   d.status === '배정완료',
                          'bg-indigo-100 text-indigo-700': d.status === '처리중' || d.status === '검토중',
                          'bg-emerald-100 text-emerald-700': d.status === '완료'
                        }">{{ d.status }}</span>
                </td>
                <!-- 첨부 (화면 전용) -->
                <td class="px-4 py-3 text-[13px] text-center text-slate-500 print:hidden">{{ d.attachmentCount || 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>

      <!-- 인쇄 푸터 (화면에서는 숨김) -->
      <div class="hidden print:block text-right print:mt-0.5 print:text-[6px] text-gray-500">
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
  if (filters.value.dateFrom && filters.value.dateTo) return `조회 기간: ${filters.value.dateFrom} ~ ${filters.value.dateTo}`
  if (filters.value.dateFrom) return `조회 기간: ${filters.value.dateFrom} ~`
  if (filters.value.dateTo) return `조회 기간: ~ ${filters.value.dateTo}`
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

const matchReviewStage = (doc, stage) => {
  if (!stage) return true
  const steps = doc.reviewSteps || []
  if (stage === 'none') return !doc.assigneeName || doc.status === '접수대기'
  if (stage === 'done') return steps.length > 0 && steps.every(s => s.isApproved)
  const levelNum = parseInt(stage.replace('review', ''))
  if (isNaN(levelNum)) return true
  const stepIdx = steps.findIndex(s => s.level === levelNum)
  if (stepIdx === -1) return false
  return steps.slice(0, stepIdx).every(s => s.isApproved) && !steps[stepIdx].isApproved
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

    const kw = filters.value.keyword.trim().toLowerCase()
    if (kw) {
      fetched = fetched.filter(d =>
        (d.title || '').toLowerCase().includes(kw) ||
        (d.senderOrg || '').toLowerCase().includes(kw) ||
        (d.receiptNo || '').toLowerCase().includes(kw) ||
        (d.senderDocNo || '').toLowerCase().includes(kw)
      )
    }

    if (filters.value.status) fetched = fetched.filter(d => d.status === filters.value.status)
    if (filters.value.category) fetched = fetched.filter(d => d.categoryName === filters.value.category)
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

const handlePrint = () => window.print()

const formatDate = (dateObj) => {
  if (!dateObj) return '-'
  const d = new Date(dateObj)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

const formatDateStr = (str) => {
  if (!str) return ''
  const [y, m, d] = str.split('-').map(Number)
  return `${y}.${m}.${d}`
}

const formatShortDate = (timestamp) => {
  if (!timestamp) return ''
  const d = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
@media print {
  /* 레이아웃 초기화 */
  :deep(.min-h-screen) {
    min-height: auto !important;
    display: block !important;
    background: white !important;
  }
  :deep(.min-h-screen > aside) { display: none !important; }
  :deep(.min-h-screen > main) {
    height: auto !important;
    overflow: visible !important;
    width: 100% !important;
    padding: 0 !important;
  }

  /* 컨테이너 여백·너비 제거 */
  :deep(.overflow-x-auto) { overflow: visible !important; }
  :deep(.max-w-7xl) { max-width: none !important; padding: 0 !important; margin: 0 !important; }
  :deep(.pb-20) { padding-bottom: 0 !important; }

  /* 테이블 기본 (세로 A4 기준) */
  table {
    border-collapse: collapse;
    width: 100%;
    font-size: 5.5px;
    table-layout: fixed;
  }

  th, td {
    border: 1px solid #aaa !important;
    padding: 1px 2px !important;
    vertical-align: middle;
    text-align: center;
    overflow: hidden;
    white-space: normal;
    overflow-wrap: break-word;
    line-height: 1.25;
  }

  /* 한글 셀: 단어 단위 줄바꿈 */
  td:nth-child(4),
  td:nth-child(5) {
    word-break: keep-all;
  }

  /* 접수번호: 영숫자 줄바꿈 허용 */
  td:nth-child(2) { word-break: break-all; }

  /* 문서 제목은 좌측 정렬 */
  td:nth-child(5) { text-align: left; }

  th {
    background: #f3f4f6 !important;
    font-weight: 700;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* 검토현황·상태 배지 크기를 테이블 기본 폰트에 맞춤 */
  td span { font-size: inherit !important; line-height: inherit !important; padding: 0 1px !important; }

  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
}

/* 세로 A4 기본 */
@page {
  size: A4;
  margin: 6mm 5mm;
}

/* 가로 출력 선택 시 */
@media print and (orientation: landscape) {
  table { font-size: 8px !important; }
  th, td {
    padding: 3px 4px !important;
    line-height: 1.3 !important;
  }
  td span { font-size: inherit !important; padding: 0 2px !important; }
}
</style>

<template>
  <div class="p-8 pb-20 max-w-6xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">문서 검색</h1>
      <p class="text-sm text-gray-500 mt-1">키워드, 날짜, 분류 등의 복합 조건을 통해 문서를 조회합니다.</p>
    </header>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <form @submit.prevent="doSearch" class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="md:col-span-2">
          <label class="text-xs font-semibold text-gray-600 block mb-1">검색어 (제목, 발신기관, 번호)</label>
          <input v-model="filters.keyword" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="검색어를 입력하세요">
        </div>
        
        <!-- 날짜 필터 생략 (클라이언트 필터) -->
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">상태</label>
          <select v-model="filters.status" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            <option value="">전체 상태</option>
            <option value="접수대기">접수대기</option>
            <option value="배정완료">배정완료</option>
            <option value="처리중">처리중</option>
            <option value="완료">완료</option>
          </select>
        </div>

        <div>
           <label class="text-xs font-semibold text-gray-600 block mb-1">&nbsp;</label>
           <button type="submit" class="w-full bg-blue-600 text-white rounded-xl py-2.5 font-bold hover:bg-blue-700 transition" :disabled="loading">
             {{ loading ? '검색 중...' : '조회하기' }}
           </button>
        </div>
      </form>
    </div>

    <!-- 검색 결과 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-12 text-center text-gray-400">데이터를 불러오는 중입니다...</div>
      <div v-else-if="!hasSearched" class="p-12 text-center text-gray-400">검색 조건을 입력한 뒤 조회버튼을 눌러주세요.</div>
      <div v-else-if="results.length === 0" class="p-12 text-center text-gray-500 font-medium">일치하는 문서가 없습니다.</div>
      
      <table v-else class="w-full text-left">
        <thead>
          <tr class="bg-gray-50 text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wider">
            <th class="px-6 py-4 font-medium min-w-[120px]">접수번호</th>
            <th class="px-6 py-4 font-medium w-full">제목</th>
            <th class="px-6 py-4 font-medium whitespace-nowrap">발신기관</th>
            <th class="px-6 py-4 font-medium whitespace-nowrap">상태</th>
            <th class="px-6 py-4 font-medium whitespace-nowrap">일시</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="d in results" :key="d.id" class="hover:bg-blue-50/50 transition cursor-pointer">
            <td class="px-6 py-4 text-xs font-mono font-bold text-blue-600">{{ d.receiptNo }}</td>
            <td class="px-6 py-4 text-sm font-semibold text-gray-800">{{ d.title }}</td>
            <td class="px-6 py-4 text-sm text-gray-500">{{ d.senderOrg }}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 text-xs font-semibold rounded-lg" :class="{
                'bg-gray-100 text-gray-600': d.status === '접수대기',
                'bg-amber-50 text-amber-600': d.status === '배정완료',
                'bg-blue-50 text-blue-600': d.status === '처리중',
                'bg-green-50 text-green-700': d.status === '완료'
              }">{{ d.status }}</span>
            </td>
            <td class="px-6 py-4 text-xs text-gray-400">{{ formatDate(d.receiptDate) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'

const loading = ref(false)
const hasSearched = ref(false)
const results = ref([])

const filters = ref({
  keyword: '',
  status: ''
})

const doSearch = async () => {
  loading.value = true
  hasSearched.value = true
  try {
    let q = query(collection(db, 'documents'), orderBy('createdAt', 'desc'), limit(100))
    if (filters.value.status) {
      q = query(collection(db, 'documents'), where('status', '==', filters.value.status), orderBy('createdAt', 'desc'), limit(100))
    }

    const snap = await getDocs(q)
    let fetched = snap.docs.map(d => ({ 
      id: d.id, 
      ...d.data(),
      receiptDate: d.data().receiptDate?.toDate?.() || d.data().receiptDate
    }))

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

    results.value = fetched
  } catch (err) {
    console.error(err)
    alert('검색 중 오류가 발생했습니다. (Firestore 색인이 필요할 수 있습니다.)')
  } finally {
    loading.value = false
  }
}

const formatDate = (dateObj) => {
  if (!dateObj) return '-'
  const d = new Date(dateObj)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`
}
</script>

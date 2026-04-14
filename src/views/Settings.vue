<template>
  <div class="p-8 pb-20 max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">환경 설정</h1>
      <p class="text-sm text-gray-500 mt-1">시스템 기본 정보와 문서 결재 흐름을 관리하세요.</p>
    </header>

    <div class="space-y-6">
      
      <!-- 기관 정보 설정 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
          <h2 class="font-bold text-gray-800">🏢 기관 정보</h2>
        </div>
        <div class="p-6 flex gap-4">
          <div class="flex-1">
            <label class="text-xs font-semibold text-gray-600 block mb-1">초기 기관명</label>
            <input v-model="orgName" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="동행빌리지">
          </div>
          <div class="flex items-end">
            <button @click="saveOrgName" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">저장</button>
          </div>
        </div>
      </section>

      <!-- 카테고리 관리 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-gray-800">📂 문서 분류 시스템</h2>
          <button @click="addCategory" class="text-blue-600 text-sm font-semibold hover:text-blue-800">+ 새 분류 추가</button>
        </div>
        <div class="p-6">
          <div class="space-y-2">
            <div v-for="(cat, idx) in categories" :key="cat.code" class="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-800">{{ cat.name }}</span>
                <span class="text-xs text-gray-400 font-mono">{{ cat.code }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold" :class="cat.active ? 'text-green-600' : 'text-gray-400'">{{ cat.active ? '활성' : '비활성' }}</span>
                <button @click="cat.active = !cat.active" class="text-xs font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2">전환</button>
              </div>
            </div>
          </div>
          <button @click="saveCategories" class="mt-4 w-full bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 transition">분류 저장 업데이트</button>
        </div>
      </section>

      <!-- 결재 검토자 흐름 관리 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-gray-800">🔄 결재 검토 흐름</h2>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-xs text-gray-500 font-medium">문서는 등록 후 배정자를 거쳐 아래의 기본 3차례 검토자를 순차 또는 병렬로 거치게 됩니다.</p>
          <div v-for="(step, idx) in reviewSteps" :key="idx" class="flex items-center gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{{ step.level }}</div>
            <div class="flex-1 space-y-2">
              <input v-model="step.label" class="w-full bg-transparent font-medium text-sm text-gray-800 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1 placeholder-gray-400" placeholder="직책 예: 1차 검토자">
              <input v-model="step.email" class="w-full bg-transparent text-sm text-gray-600 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1 placeholder-gray-400" placeholder="사용자 이메일">
              <input v-model="step.name" class="w-full bg-transparent text-sm text-gray-600 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1" placeholder="직원명">
            </div>
          </div>
          <button @click="saveReviewSteps" class="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm mt-2">흐름 설정 저장</button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const orgName = ref('동행빌리지')
const categories = ref([
  { code: 'CAT1', name: '사무', active: true },
  { code: 'CAT2', name: '간호/의료', active: true }
])
const reviewSteps = ref([
  { level: 1, label: '1차 검토자', email: '', name: '' },
  { level: 2, label: '2차 검토자', email: '', name: '' },
  { level: 3, label: '최종 검토자', email: '', name: '' }
])

const loadSettings = async () => {
  try {
    const orgSnap = await getDoc(doc(db, 'settings', 'orgInfo'))
    if (orgSnap.exists()) orgName.value = orgSnap.data().name

    const catSnap = await getDoc(doc(db, 'settings', 'categories'))
    if (catSnap.exists() && catSnap.data().items) {
      categories.value = catSnap.data().items
    }

    const flowSnap = await getDoc(doc(db, 'settings', 'reviewFlow'))
    if (flowSnap.exists() && flowSnap.data().steps) {
      reviewSteps.value = flowSnap.data().steps
    }
  } catch(e) {
    console.error(e)
  }
}

const saveOrgName = async () => {
  await setDoc(doc(db, 'settings', 'orgInfo'), { name: orgName.value })
  alert('기관명 저장 완료')
}

const addCategory = () => {
  const name = prompt('새로운 문서 분류명을 입력하세요:')
  if(name) {
    categories.value.push({
      code: 'CAT' + Date.now().toString().slice(-4),
      name,
      active: true
    })
  }
}

const saveCategories = async () => {
  await setDoc(doc(db, 'settings', 'categories'), { items: categories.value })
  alert('분류 저장 완료')
}

const saveReviewSteps = async () => {
  await setDoc(doc(db, 'settings', 'reviewFlow'), { steps: reviewSteps.value })
  alert('흐름 저장 완료')
}

onMounted(() => {
  loadSettings()
})
</script>

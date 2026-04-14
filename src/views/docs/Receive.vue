<template>
  <div class="p-8 pb-20 max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">새 공문 접수</h1>
      <p class="text-sm text-gray-500 mt-1">외부에서 발송된 형태의 공문을 수신하고 분배 대기열로 등록합니다.</p>
    </header>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <form @submit.prevent="submitDoc" class="space-y-6">
        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">발신 기관명 <span class="text-red-500">*</span></label>
            <input v-model="form.senderOrg" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="예: 여수시청">
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">발신 문서번호</label>
            <input v-model="form.senderDocNo" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="예: 노인장애인과-620">
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">문서 제목 <span class="text-red-500">*</span></label>
          <input v-model="form.title" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="공문 제목을 정확히 입력하세요">
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">문서 분류 <span class="text-red-500">*</span></label>
            <select v-model="form.category" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="" disabled>분류를 선택하세요</option>
              <option v-for="cat in categories" :key="cat.code" :value="cat">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">원문 접수 일시 <span class="text-red-500">*</span></label>
            <input v-model="form.receiptDate" type="datetime-local" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">특이사항 (비고)</label>
          <textarea v-model="form.note" rows="3" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="추가 메모를 입력하세요..."></textarea>
        </div>

        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p class="text-xs text-blue-700 leading-relaxed font-medium">📋 접수가 완료되면 시스템에 의해 자동으로 접수번호가 부여되며, 상태가 [접수대기]로 설정됩니다.</p>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold hover:bg-blue-700 transition shadow-md focus:bg-blue-800" :disabled="loading">
          {{ loading ? '등록 중...' : '문서 접수하기' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../firebase/config'
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(false)
const categories = ref([])
const reviewSteps = ref([])

const form = ref({
  senderOrg: '',
  senderDocNo: '',
  title: '',
  category: '', // object { code, name }
  receiptDate: new Date().toISOString().slice(0, 16),
  note: ''
})

const loadSettings = async () => {
  const catSnap = await getDoc(doc(db, 'settings', 'categories'))
  if (catSnap.exists() && catSnap.data().items) {
    categories.value = catSnap.data().items.filter(c => c.active)
  }
  const flowSnap = await getDoc(doc(db, 'settings', 'reviewFlow'))
  if (flowSnap.exists() && flowSnap.data().steps) {
    reviewSteps.value = flowSnap.data().steps.map(s => ({ ...s, readAt: null, isRead: false }))
  }
}

const generateReceiptNo = async () => {
  const dateStr = form.value.receiptDate.split('T')[0].replace(/-/g, '') // YYYYMMDD
  
  const q = query(
    collection(db, 'documents'),
    where('receiptNo', '>=', dateStr),
    where('receiptNo', '<', dateStr + 'z')
  )
  const snap = await getDocs(q)
  const seq = String(snap.size + 1).padStart(3, '0')
  return `${dateStr}-${seq}`
}

const submitDoc = async () => {
  loading.value = true
  try {
    const receiptNo = await generateReceiptNo()
    
    const docData = {
      receiptNo,
      receiptDate: new Date(form.value.receiptDate),
      receiptUserEmail: authStore.user.email,
      receiptUserName: authStore.profile.name,
      senderOrg: form.value.senderOrg,
      senderDocNo: form.value.senderDocNo,
      title: form.value.title,
      category: form.value.category.code,
      categoryName: form.value.category.name,
      note: form.value.note,
      status: '접수대기',
      assigneeEmail: null,
      assigneeName: null,
      assignedAt: null,
      assigneeReadAt: null,
      reviewSteps: reviewSteps.value,
      driveFileUrl: null,
      driveFolderId: null,
      createdAt: new Date()
    }

    await setDoc(doc(db, 'documents', receiptNo), docData)
    alert(`정상 접수되었습니다. [${receiptNo}]`)
    router.push('/assign')
  } catch (err) {
    console.error(err)
    alert('접수 중 오류가 발생했습니다.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSettings()
})
</script>

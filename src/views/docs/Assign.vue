<template>
  <div class="p-8 pb-20 max-w-5xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">문서 배정</h1>
      <p class="text-sm text-gray-500 mt-1">접수된 문서를 검토할 담당자를 지정하세요.</p>
    </header>

    <div v-if="loading" class="text-center py-10 text-gray-400">불러오는 중...</div>
    
    <div v-else-if="docs.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div class="text-4xl mb-4">📭</div>
      <p class="text-gray-500 font-medium">현재 배정 가능한 '접수대기' 상태의 문서가 없습니다.</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="d in docs" :key="d.id" @click="openDocDetail(d)" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md hover:border-blue-200 cursor-pointer transition">
        <div class="flex-1 space-y-2">
          <div class="flex items-center gap-3">
            <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{{ d.receiptNo }}</span>
            <span class="text-xs font-semibold px-2 py-1 rounded bg-amber-50 text-amber-700">{{ d.status }}</span>
            <span class="text-xs text-gray-400">{{ formatDate(d.receiptDate) }} 접수됨</span>
          </div>
          <h3 class="font-bold text-gray-900 text-lg">{{ d.title }}</h3>
          <p class="text-sm text-gray-500">발신: {{ d.senderOrg }} {{ d.senderDocNo ? `(${d.senderDocNo})` : '' }} | 분류: {{ d.categoryName }}</p>
        </div>
        
        <div class="md:w-72" @click.stop>
          <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label class="text-xs font-semibold text-gray-600 block mb-2">당당자 배정</label>
            <div class="flex gap-2">
              <select v-model="d.selectedAssignee" class="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="" disabled>선택하세요</option>
                <option v-for="u in users" :key="u.email" :value="u">{{ u.name }} ({{ u.email }})</option>
              </select>
              <button @click="assignDoc(d)" :disabled="!d.selectedAssignee" class="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition">
                확인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 문서 상세 모달 -->
    <DocDetailModal :show="showModal" :docData="selectedDoc" @close="showModal = false" @updated="loadData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase/config'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import DocDetailModal from '../../components/DocDetailModal.vue'
import { useSettingsStore } from '../../store/settings'
import { applyAutoSkip, extractReviewerEmails } from '../../utils/docUtils'

const loading = ref(true)
const docs = ref([])
const users = ref([])

const settingsStore = useSettingsStore()

const showModal = ref(false)
const selectedDoc = ref({})

const openDocDetail = (doc) => {
  selectedDoc.value = doc
  showModal.value = true
}

const loadData = async () => {
  loading.value = true
  try {
    const userSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['user', 'reviewer', 'admin']), where('active', '==', true)))
    users.value = userSnap.docs.map(d => d.data())

    const q = query(collection(db, 'documents'), where('status', '==', '접수대기'))
    const snap = await getDocs(q)
    docs.value = snap.docs.map(d => {
      const data = d.data()
      data.receiptDate = data.receiptDate?.toDate?.() || data.receiptDate
      return { id: d.id, ...data, selectedAssignee: '' }
    })
    docs.value.sort((a, b) => b.receiptDate - a.receiptDate)
  } catch (e) {
    console.error('배정 목록 로드 실패:', e)
  } finally {
    loading.value = false
  }
}

const assignDoc = async (docItem) => {
  if (!docItem.selectedAssignee) return
  if (!confirm(`${docItem.selectedAssignee.name} 님을 담당자로 배정하시겠습니까?`)) return

  try {
    const docRef = doc(db, 'documents', docItem.id)
    const updatedReviewSteps = applyAutoSkip(
      docItem.reviewSteps,
      docItem.selectedAssignee.email,
      docItem.selectedAssignee.name
    )

    await updateDoc(docRef, {
      status: '배정완료',
      assigneeEmail: docItem.selectedAssignee.email,
      assigneeName: docItem.selectedAssignee.name,
      assignedAt: new Date(),
      reviewSteps: updatedReviewSteps,
      reviewerEmails: extractReviewerEmails(updatedReviewSteps)
    })

    docs.value = docs.value.filter(d => d.id !== docItem.id)
    alert('배정이 완료되었습니다.')

    // 슬랙 알림
    if (settingsStore.slackWebhookUrl) {
      try {
        let text = settingsStore.slackTemplate || '🔔 새로운 문서가 배정되었습니다!\n- 문서제목: {title}\n- 접수번호: {receiptNo}\n- 담당자: {assigneeName}'
        text = text.replace(/{title}/g, docItem.title || '')
        text = text.replace(/{receiptNo}/g, docItem.receiptNo || '')
        text = text.replace(/{assigneeName}/g, docItem.selectedAssignee.name || '')
        text = text.replace(/{senderOrg}/g, docItem.senderOrg || '')
        const attachmentText = (docItem.attachments && docItem.attachments.length > 0)
          ? docItem.attachments.map(f => f.name).join(', ')
          : '첨부파일 없음'
        text = text.replace(/{attachments}/g, attachmentText)
        await fetch(settingsStore.slackWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), mode: 'no-cors' })
      } catch (e) { /* Slack 오류는 무시 */ }
    }
  } catch (e) {
    console.error('배정 처리 실패:', e)
    alert('배정 중 오류가 발생했습니다.')
  }
}

const formatDate = (dateObj) => {
  if (!dateObj) return ''
  const d = new Date(dateObj)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(() => {
  loadData()
})
</script>

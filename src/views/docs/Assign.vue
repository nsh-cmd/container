<template>
  <div class="p-4 md:p-8 pb-20 max-w-5xl mx-auto">
    <header class="mb-6 md:mb-8">
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
    <DocDetailModal :show="showModal" :docData="selectedDoc" @close="showModal = false" @updated="loadData" @deleted="showModal = false; loadData()" />

    <!-- 커스텀 다이얼로그 -->
    <div v-if="dialog.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                 :class="dialog.type === 'error' ? 'bg-red-100 text-red-600' : (dialog.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600')">
              <svg v-if="dialog.type === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <svg v-else-if="dialog.type === 'success'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ dialog.title }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-line">{{ dialog.message }}</p>
          <div class="flex justify-end gap-2">
            <button v-if="dialog.isConfirm" @click="dialog.onCancel" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">취소</button>
            <button @click="dialog.onConfirm" class="px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                    :class="dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : (dialog.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')">확인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase/config'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import DocDetailModal from '../../components/DocDetailModal.vue'
import { useSettingsStore } from '../../store/settings'
import { applyAutoSkip, extractReviewerEmails } from '../../utils/docUtils'
import { getAppLink, getSlackMention } from '../../utils/slack'

const loading = ref(true)
const docs = ref([])
const users = ref([])

const settingsStore = useSettingsStore()

// ── 커스텀 다이얼로그 ──
const dialog = ref({ show: false, title: '', message: '', type: 'info', isConfirm: false, onConfirm: () => {}, onCancel: () => {} })
const showAlert = (title, message, type = 'info') => new Promise((resolve) => {
  dialog.value = { show: true, title, message, type, isConfirm: false,
    onConfirm: () => { dialog.value.show = false; resolve() },
    onCancel: () => { dialog.value.show = false; resolve() }
  }
})
const showConfirm = (title, message) => new Promise((resolve) => {
  dialog.value = { show: true, title, message, type: 'info', isConfirm: true,
    onConfirm: () => { dialog.value.show = false; resolve(true) },
    onCancel: () => { dialog.value.show = false; resolve(false) }
  }
})

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
  const confirmed = await showConfirm('담당자 배정', `${docItem.selectedAssignee.name} 님을 담당자로 배정하시겠습니까?`)
  if (!confirmed) return

  try {
    const docRef = doc(db, 'documents', docItem.id)
    const updatedReviewSteps = applyAutoSkip(
      docItem.reviewSteps,
      docItem.selectedAssignee.email,
      docItem.selectedAssignee.name,
      docItem.selectedAssignee.department
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
    await showAlert('배정 완료', '담당자 배정이 완료되었습니다.', 'success')

    // 슬랙 알림
    if (settingsStore.slackWebhookUrl) {
      try {
        const assignee = docItem.selectedAssignee
        const mention = getSlackMention(assignee.email, assignee.name, settingsStore.slackMemberMap)
        let text = settingsStore.slackTemplate || '🔔 새로운 문서가 배정되었습니다!\n- 문서제목: {title}\n- 접수번호: {receiptNo}\n- 담당자: {mention}'
        text = text.replace(/{title}/g, docItem.title || '')
        text = text.replace(/{receiptNo}/g, docItem.receiptNo || '')
        text = text.replace(/{assigneeName}/g, assignee.name || '')
        text = text.replace(/{mention}/g, mention)
        text = text.replace(/{senderOrg}/g, docItem.senderOrg || '')
        const attachmentText = (docItem.attachments && docItem.attachments.length > 0)
          ? docItem.attachments.map((f, i) => `  ${i + 1}. ${f.name}`).join('\n')
          : '첨부파일 없음'
        text = text.replace(/{attachments}/g, attachmentText)
        text += getAppLink()
        await fetch(settingsStore.slackWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), mode: 'no-cors' })
      } catch (e) { /* Slack 오류는 무시 */ }
    }
  } catch (e) {
    console.error('배정 처리 실패:', e)
    await showAlert('배정 오류', '배정 중 오류가 발생했습니다.', 'error')
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

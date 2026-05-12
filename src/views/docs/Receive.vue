<template>
  <div class="p-4 md:p-8 pb-20 max-w-4xl mx-auto">
    <header class="mb-6 md:mb-8">
      <h1 class="text-2xl font-bold text-gray-900">새 공문 접수</h1>
      <p class="text-sm text-gray-500 mt-1">외부에서 발송된 형태의 공문을 수신하고 분배 대기열로 등록합니다.</p>
    </header>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
      <form @submit.prevent="submitDoc" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">발신 기관명 <span class="text-red-500">*</span></label>
            <input v-model="form.senderOrg" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="예: 여수시청">
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">발신 문서번호 <span class="text-gray-400 font-normal text-[10px]">(시행부서 - 번호)</span></label>
            <div class="flex items-center gap-2">
              <input v-model="form.senderDept" class="flex-1 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="노인장애인과">
              <span class="text-gray-400 font-bold text-lg shrink-0">-</span>
              <input v-model="form.senderDocNum" class="w-28 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="1234">
            </div>
          </div>
        </div>

        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1">문서 제목 <span class="text-red-500">*</span></label>
          <input v-model="form.title" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="공문 제목을 정확히 입력하세요">
        </div>

        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">문서 분류 <span class="text-red-500">*</span></label>
            <select v-model="form.category" required class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="" disabled>분류를 선택하세요</option>
              <option v-for="cat in categories" :key="cat.code" :value="cat">{{ cat.name }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">담당자 배정 <span class="text-gray-400 font-normal text-[10px]">(선택)</span></label>
            <select v-model="form.assignee" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="">미배정 (접수대기)</option>
              <option v-for="u in users" :key="u.email" :value="u">{{ u.name }} ({{ u.email }})</option>
            </select>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">시행일자 <span class="text-gray-400 font-normal text-[10px]">(선택)</span></label>
            <input v-model="form.senderDocDate" type="date" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
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

        <!-- 첨부파일 영역 -->
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-2">📎 첨부파일</label>
          
          <!-- 드래그 앤 드롭 영역 -->
          <div
            @click="$refs.fileInput.click()"
            @dragover.prevent="isDragOver = true"
            @dragleave.prevent="isDragOver = false"
            @drop.prevent="handleDrop"
            class="border-2 border-dashed rounded-xl px-6 py-8 text-center cursor-pointer transition-all"
            :class="isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'"
          >
            <div class="flex flex-col items-center gap-2">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
              </svg>
              <p class="text-sm text-gray-500">파일을 드래그하거나 <span class="text-blue-600 font-semibold">클릭하여 선택</span></p>
              <p class="text-[11px] text-gray-400">PDF, 이미지, 문서 등 (파일당 최대 10MB)</p>
            </div>
          </div>
          <input ref="fileInput" type="file" multiple class="hidden" @change="handleFileSelect">

          <!-- 첨부된 파일 목록 -->
          <div v-if="attachedFiles.length > 0" class="mt-3 space-y-2">
            <div v-for="(file, idx) in attachedFiles" :key="idx" class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-100">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-lg shrink-0">{{ getFileIcon(file.name) }}</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</p>
                  <p class="text-[11px] text-gray-400">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button type="button" @click="removeFile(idx)" class="text-red-400 hover:text-red-600 text-xs font-semibold shrink-0 ml-3 transition">삭제</button>
            </div>
            <p class="text-[11px] text-gray-400 text-right">총 {{ attachedFiles.length }}개 · {{ formatFileSize(totalFileSize) }}</p>
          </div>
        </div>

        <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p class="text-xs text-blue-700 leading-relaxed font-medium">📋 접수가 완료되면 시스템에 의해 자동으로 접수번호가 부여됩니다. 담당자를 지정하면 즉시 [배정완료] 처리되며, 지정하지 않으면 [접수대기] 상태로 등록됩니다.</p>
        </div>

        <!-- 업로드 진행 상태 -->
        <div v-if="uploadProgress" class="bg-orange-50 rounded-xl p-4 border border-orange-200">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-orange-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
            </svg>
            <div class="flex-1">
              <p class="text-xs text-orange-800 font-semibold">{{ uploadProgress }}</p>
              <div class="w-full bg-orange-200 rounded-full h-1.5 mt-1.5">
                <div class="bg-orange-500 h-1.5 rounded-full transition-all" :style="{ width: uploadPercent + '%' }"></div>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" class="w-full bg-blue-600 text-white rounded-xl py-3.5 font-bold hover:bg-blue-700 transition shadow-md focus:bg-blue-800" :disabled="loading">
          {{ loading ? '등록 중...' : '문서 접수하기' }}
        </button>
      </form>
    </div>

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
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../firebase/config'
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore'
import { useAuthStore } from '../../store/auth'
import { useSettingsStore } from '../../store/settings'
import { applyAutoSkip, generateReceiptNo, extractReviewerEmails } from '../../utils/docUtils'
import { getAppLink } from '../../utils/slack'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const loading = ref(false)
const categories = ref([])
const reviewSteps = ref([])
const users = ref([])

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

// 첨부파일 관련
const attachedFiles = ref([])
const isDragOver = ref(false)
const uploadProgress = ref('')
const uploadPercent = ref(0)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const totalFileSize = computed(() => attachedFiles.value.reduce((sum, f) => sum + f.size, 0))

const form = ref({
  senderOrg: '',
  senderDept: '',
  senderDocNum: '',
  senderDocDate: '',
  title: '',
  category: '', // object { code, name }
  assignee: '', // 담당자 배정
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

  const userSnap = await getDocs(query(collection(db, 'users'), where('role', 'in', ['user', 'reviewer', 'admin']), where('active', '==', true)))
  users.value = userSnap.docs.map(d => d.data())
}

// --- 파일 처리 ---
const handleFileSelect = (e) => {
  addFiles(Array.from(e.target.files))
  e.target.value = ''
}

const handleDrop = (e) => {
  isDragOver.value = false
  addFiles(Array.from(e.dataTransfer.files))
}

const addFiles = async (files) => {
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      await showAlert('파일 크기 초과', `"${file.name}" 파일이 10MB를 초과합니다.\n(${formatFileSize(file.size)})`, 'error')
      continue
    }
    if (attachedFiles.value.some(f => f.name === file.name && f.size === file.size)) {
      continue
    }
    attachedFiles.value.push(file)
  }
}

const removeFile = (idx) => {
  attachedFiles.value.splice(idx, 1)
}

const getFileIcon = (name) => {
  const ext = name.split('.').pop().toLowerCase()
  const icons = {
    pdf: '📄', doc: '📝', docx: '📝', hwp: '📝', hwpx: '📝',
    xls: '📊', xlsx: '📊', csv: '📊',
    ppt: '📑', pptx: '📑',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
    zip: '📦', rar: '📦', '7z': '📦',
    txt: '📃'
  }
  return icons[ext] || '📎'
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// --- 파일을 Base64로 변환 ---
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// --- Apps Script로 파일 업로드 ---
const uploadFilesToDrive = async (receiptNo) => {
  const appsScriptUrl = settingsStore.appsScriptUrl
  if (!appsScriptUrl || attachedFiles.value.length === 0) return []

  const uploadedFiles = []
  const total = attachedFiles.value.length

  for (let i = 0; i < total; i++) {
    const file = attachedFiles.value[i]
    uploadProgress.value = `첨부파일 업로드 중... (${i + 1}/${total}) ${file.name}`
    uploadPercent.value = Math.round((i / total) * 100)

    try {
      const base64 = await fileToBase64(file)
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'upload', receiptNo, fileName: file.name, fileBase64: base64, mimeType: file.type })
      })
      const responseData = await res.json()
      if (!responseData.success) throw new Error(responseData.message || '서버 오류')
      uploadedFiles.push({
        name: responseData.fileName || file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded',
        fileId: responseData.fileId,
        fileUrl: responseData.fileUrl,
        folderId: responseData.folderId
      })
    } catch (err) {
      uploadedFiles.push({
        name: file.name, size: file.size, mimeType: file.type,
        uploadedAt: new Date().toISOString(), status: 'failed', error: err.message
      })
    }
  }

  uploadPercent.value = 100
  uploadProgress.value = '업로드 완료!'
  return uploadedFiles
}

const submitDoc = async () => {
  loading.value = true
  uploadProgress.value = ''
  uploadPercent.value = 0
  try {
    const receiptNo = await generateReceiptNo(form.value.receiptDate)

    // 1. 첨부파일 업로드
    let uploadedFiles = []
    if (attachedFiles.value.length > 0) {
      if (settingsStore.appsScriptUrl) {
        uploadedFiles = await uploadFilesToDrive(receiptNo)
      } else {
        uploadedFiles = attachedFiles.value.map(f => ({
          name: f.name, size: f.size, mimeType: f.type,
          uploadedAt: new Date().toISOString(), status: 'pending'
        }))
      }
    }

    // 2. 자동생략 적용
    const isAssigned = !!form.value.assignee
    const finalReviewSteps = isAssigned
      ? applyAutoSkip(reviewSteps.value, form.value.assignee.email, form.value.assignee.name, form.value.assignee.department)
      : JSON.parse(JSON.stringify(reviewSteps.value))

    const senderDocNo = [form.value.senderDept, form.value.senderDocNum].filter(Boolean).join('-')

    const docData = {
      receiptNo,
      receiptDate: new Date(form.value.receiptDate),
      receiptUserEmail: authStore.user.email,
      receiptUserName: authStore.profile.name,
      senderOrg: form.value.senderOrg,
      senderDocNo,
      senderDept: form.value.senderDept,
      senderDocNum: form.value.senderDocNum,
      senderDocDate: form.value.senderDocDate || null,
      title: form.value.title,
      category: form.value.category.code,
      categoryName: form.value.category.name,
      note: form.value.note,
      status: isAssigned ? '배정완료' : '접수대기',
      assigneeEmail: isAssigned ? form.value.assignee.email : null,
      assigneeName: isAssigned ? form.value.assignee.name : null,
      assignedAt: isAssigned ? new Date() : null,
      assigneeReadAt: null,
      reviewSteps: finalReviewSteps,
      reviewerEmails: extractReviewerEmails(finalReviewSteps),
      attachments: uploadedFiles,
      attachmentCount: attachedFiles.value.length,
      driveFileUrl: null,
      driveFolderId: settingsStore.driveFolderId || null,
      driveSubFolderId: uploadedFiles.length > 0 && uploadedFiles[0].folderId ? uploadedFiles[0].folderId : null,
      createdAt: new Date()
    }

    await setDoc(doc(db, 'documents', receiptNo), docData)

    // 슬랙 알림
    if (settingsStore.slackWebhookUrl) {
      try {
        let text = settingsStore.slackTemplate || '🔔 새로운 문서가 접수되었습니다!\n- 문서제목: {title}\n- 접수번호: {receiptNo}\n- 발신기관: {senderOrg}\n- 첨부파일: {attachments}'
        text = text.replace(/{title}/g, docData.title || '')
        text = text.replace(/{receiptNo}/g, docData.receiptNo || '')
        text = text.replace(/{assigneeName}/g, isAssigned ? docData.assigneeName : '미배정')
        text = text.replace(/{senderOrg}/g, docData.senderOrg || '')
        const attachmentText = attachedFiles.value.length > 0
          ? attachedFiles.value.map((f, i) => `  ${i + 1}. ${f.name}`).join('\n')
          : '첨부파일 없음'
        text = text.replace(/{attachments}/g, attachmentText)
        text += getAppLink()
        await fetch(settingsStore.slackWebhookUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }), mode: 'no-cors' })
      } catch (e) { /* Slack 오류는 무시 */ }
    }

    const fileMsg = attachedFiles.value.length > 0
      ? `\n첨부파일 ${attachedFiles.value.length}개 ${settingsStore.appsScriptUrl ? '업로드됨' : '(Drive 미연동 — 메타만 기록)'}`
      : ''
    await showAlert('접수 완료', `정상 접수되었습니다. [${receiptNo}]${fileMsg}`, 'success')
    router.push('/assign')
  } catch (err) {
    await showAlert('접수 오류', `접수 중 오류가 발생했습니다.\n${err.message || ''}`, 'error')
  } finally {
    loading.value = false
    uploadProgress.value = ''
    uploadPercent.value = 0
  }
}

onMounted(() => {
  loadSettings()
})
</script>

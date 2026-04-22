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
          <p class="text-xs text-blue-700 leading-relaxed font-medium">📋 접수가 완료되면 시스템에 의해 자동으로 접수번호가 부여되며, 상태가 [접수대기]로 설정됩니다.</p>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../../firebase/config'
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore'
import { useAuthStore } from '../../store/auth'
import { useSettingsStore } from '../../store/settings'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const loading = ref(false)
const categories = ref([])
const reviewSteps = ref([])

// 첨부파일 관련
const attachedFiles = ref([])
const isDragOver = ref(false)
const uploadProgress = ref('')
const uploadPercent = ref(0)
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const totalFileSize = computed(() => attachedFiles.value.reduce((sum, f) => sum + f.size, 0))

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

// --- 파일 처리 ---
const handleFileSelect = (e) => {
  addFiles(Array.from(e.target.files))
  e.target.value = '' // 같은 파일 재선택 가능하도록 초기화
}

const handleDrop = (e) => {
  isDragOver.value = false
  addFiles(Array.from(e.dataTransfer.files))
}

const addFiles = (files) => {
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      alert(`"${file.name}" 파일이 10MB를 초과합니다. (${formatFileSize(file.size)})`)
      continue
    }
    // 중복 파일명 체크
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
    reader.onload = () => {
      const base64 = reader.result.split(',')[1] // data:... 부분 제거
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// --- Apps Script로 파일 업로드 ---
const uploadFilesToDrive = async (receiptNo) => {
  const appsScriptUrl = settingsStore.appsScriptUrl
  if (!appsScriptUrl || attachedFiles.value.length === 0) {
    return [] // URL 미설정이거나 파일 없으면 빈 배열
  }

  const uploadedFiles = []
  const total = attachedFiles.value.length

  for (let i = 0; i < total; i++) {
    const file = attachedFiles.value[i]
    uploadProgress.value = `첨부파일 업로드 중... (${i + 1}/${total}) ${file.name}`
    uploadPercent.value = Math.round(((i) / total) * 100)

    try {
      const base64 = await fileToBase64(file)
      const res = await fetch(appsScriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'upload',
          receiptNo,
          fileName: file.name,
          fileBase64: base64,
          mimeType: file.type
        }),
        mode: 'no-cors'
      })

      // no-cors 모드에서는 응답 body를 읽을 수 없으므로 성공으로 간주
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      })
    } catch (err) {
      console.error(`파일 업로드 실패: ${file.name}`, err)
      uploadedFiles.push({
        name: file.name,
        size: file.size,
        mimeType: file.type,
        uploadedAt: new Date().toISOString(),
        status: 'failed',
        error: err.message
      })
    }
  }

  uploadPercent.value = 100
  uploadProgress.value = '업로드 완료!'
  return uploadedFiles
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
  uploadProgress.value = ''
  uploadPercent.value = 0
  try {
    const receiptNo = await generateReceiptNo()

    // 1. 첨부파일 업로드 (Apps Script URL이 있으면)
    let uploadedFiles = []
    if (attachedFiles.value.length > 0) {
      if (settingsStore.appsScriptUrl) {
        uploadedFiles = await uploadFilesToDrive(receiptNo)
      } else {
        // Apps Script 미설정 — 파일 메타만 기록
        uploadedFiles = attachedFiles.value.map(f => ({
          name: f.name,
          size: f.size,
          mimeType: f.type,
          uploadedAt: new Date().toISOString(),
          status: 'pending' // Drive 미연동
        }))
      }
    }

    // 2. Firestore 문서 저장
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
      attachments: uploadedFiles,
      attachmentCount: attachedFiles.value.length,
      driveFileUrl: null,
      driveFolderId: settingsStore.driveFolderId || null,
      createdAt: new Date()
    }

    await setDoc(doc(db, 'documents', receiptNo), docData)

    const fileMsg = attachedFiles.value.length > 0
      ? `\n첨부파일 ${attachedFiles.value.length}개 ${settingsStore.appsScriptUrl ? '업로드됨' : '(Drive 미연동 — 메타만 기록)'}`
      : ''
    alert(`정상 접수되었습니다. [${receiptNo}]${fileMsg}`)
    router.push('/assign')
  } catch (err) {
    console.error(err)
    alert('접수 중 오류가 발생했습니다.')
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

<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- 헤더 -->
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">문서 상세 정보</h3>
          <p class="text-xs text-slate-500 font-mono mt-0.5">{{ docData.receiptNo }}</p>
        </div>
        <button @click="close" class="text-slate-400 hover:text-slate-600 transition p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 본문 -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1">
        
        <!-- 상태 및 배정 정보 -->
        <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
          <div>
            <p class="text-xs text-blue-600 font-semibold mb-1">현재 상태</p>
            <span class="px-3 py-1 rounded-lg text-sm font-bold shadow-sm" :class="{
              'bg-slate-100 text-slate-600': docData.status === '접수대기',
              'bg-amber-100 text-amber-700': docData.status === '배정완료',
              'bg-blue-100 text-blue-700': docData.status === '처리중',
              'bg-green-100 text-green-700': docData.status === '완료'
            }">{{ docData.status }}</span>
          </div>
          <div class="text-right">
            <p class="text-xs text-blue-600 font-semibold mb-1">담당자</p>
            <div class="flex items-center justify-end gap-2">
              <p class="text-sm font-medium text-slate-800">{{ docData.assigneeName || '미배정' }}</p>
              <span v-if="docData.assigneeName" class="text-[10px] px-1.5 py-0.5 rounded border" :class="docData.assigneeReadAt ? 'bg-green-50 text-green-600 border-green-200' : 'bg-slate-50 text-slate-400 border-slate-200'">
                {{ docData.assigneeReadAt ? '읽음' : '미확인' }}
              </span>
            </div>
            <p v-if="docData.assigneeReadAt" class="text-[10px] text-slate-400 mt-0.5">{{ formatDate(docData.assigneeReadAt) }}</p>
          </div>
        </div>

        <!-- 기본 정보 -->
        <div>
          <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>기본 정보
          </h4>
          <div class="grid grid-cols-2 gap-y-4 gap-x-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <div>
              <p class="text-xs text-slate-500 mb-1">문서 제목</p>
              <p class="text-sm font-medium text-slate-800">{{ docData.title }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">문서 분류</p>
              <p class="text-sm font-medium text-slate-800">{{ docData.categoryName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">발신 기관명</p>
              <p class="text-sm font-medium text-slate-800">{{ docData.senderOrg || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">발신 문서번호</p>
              <p class="text-sm font-medium text-slate-800">{{ docData.senderDocNo || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">접수자</p>
              <p class="text-sm font-medium text-slate-800">{{ docData.receiptUserName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 mb-1">원문 접수 일시</p>
              <p class="text-sm font-medium text-slate-800">{{ formatDate(docData.receiptDate) }}</p>
            </div>
          </div>
        </div>

        <!-- 특이사항 (비고) -->
        <div v-if="docData.note">
          <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>특이사항 (비고)
          </h4>
          <div class="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
            <p class="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{{ docData.note }}</p>
          </div>
        </div>

        <!-- 첨부파일 -->
        <div v-if="docData.attachments && docData.attachments.length > 0">
          <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>첨부파일
          </h4>
          <div class="space-y-2">
            <div v-for="(file, idx) in docData.attachments" :key="idx" class="flex items-center justify-between bg-slate-50 rounded-lg px-4 py-3 border border-slate-100 hover:bg-slate-100 transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-lg shrink-0">📎</span>
                <div class="min-w-0 flex-1">
                  <p class="text-sm font-medium text-slate-800 truncate">
                    <a href="#" @click.prevent="openFolder(file)" class="hover:text-blue-600 hover:underline transition" title="해당 폴더 열기">
                      {{ file.name }}
                    </a>
                  </p>
                  <p class="text-[11px] text-slate-500">{{ formatFileSize(file.size) }} <span v-if="file.status === 'pending'" class="text-amber-500 ml-1">(Drive 연동 안됨)</span></p>
                </div>
                <!-- 폴더 열기 버튼 -->
                <a href="#" @click.prevent="openFolder(file)" class="ml-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="해당 폴더 열기">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- 결재 흐름 -->
        <div v-if="docData.reviewSteps && docData.reviewSteps.length > 0">
          <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>결재 검토 흐름
          </h4>
          <div class="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
            <div v-for="step in docData.reviewSteps" :key="step.level" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{{ step.level }}</div>
                <div>
                  <p class="text-sm font-semibold text-slate-800">{{ stepTitle(step) }} <span class="text-xs font-normal text-slate-500 ml-1">({{ (step.name || '미지정').replace(/ *\(자동생략\)/, '') }})</span></p>
                </div>
              </div>
              <div class="text-right">
                <div class="text-xs font-medium px-2.5 py-1 rounded-md inline-block mb-1" :class="isAutoSkipped(step) ? 'bg-amber-100 text-amber-700' : (step.isApproved ? 'bg-green-100 text-green-700' : (step.isRead ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'))">
                  {{ isAutoSkipped(step) ? '검토생략' : (step.isApproved ? '승인 완료' : (step.isRead ? '확인 중' : '대기중')) }}
                </div>
                <p v-if="isAutoSkipped(step)" class="text-[10px] text-amber-600">검토 단계 자동 생략됨</p>
                <p v-else-if="step.isApproved && step.approvedAt" class="text-[10px] text-slate-400">승인: {{ formatDate(step.approvedAt) }}</p>
                <p v-else-if="step.isRead && step.readAt" class="text-[10px] text-slate-400">읽음: {{ formatDate(step.readAt) }}</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 푸터 -->
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-between items-center">
        <div class="flex gap-2">
          <!-- 처리 도구 버튼들 -->
          <button v-if="canRequestReview" @click="requestReview" :disabled="isProcessing" class="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50">
            {{ isProcessing ? '처리중...' : '검토 요청' }}
          </button>
          <button v-if="canComplete" @click="completeDoc" :disabled="isProcessing" class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50">
            {{ isProcessing ? '처리중...' : '처리 완료' }}
          </button>
          <button v-if="canApproveReview" @click="approveReview(myReviewStepIndex)" :disabled="isProcessing" class="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50">
            {{ isProcessing ? '처리중...' : '검토 승인' }}
          </button>
        </div>
        <button @click="close" class="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm">
          닫기
        </button>
      </div>
    </div>

    <!-- 커스텀 다이얼로그 -->
    <div v-if="dialog.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0" 
                 :class="dialog.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
              <svg v-if="dialog.type === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ dialog.title }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-6 leading-relaxed">{{ dialog.message }}</p>
          
          <div class="flex justify-end gap-2">
            <button v-if="dialog.isConfirm" @click="dialog.onCancel" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">
              취소
            </button>
            <button @click="dialog.onConfirm" class="px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                    :class="dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'">
              확인
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { db } from '../firebase/config'
import { doc, updateDoc } from 'firebase/firestore'
import { isAutoSkipped } from '../utils/docUtils'

const authStore = useAuthStore()
const currentUserEmail = computed(() => authStore.user?.email)

const stepTitle = (step) => {
  const titles = { 1: '실장', 2: '국장', 3: '원장' }
  return titles[step.level] || step.label
}

const props = defineProps({
  show: Boolean,
  docData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'updated'])

// 액션 권한 검사 로직
const isAssignee = computed(() => currentUserEmail.value === props.docData.assigneeEmail)

const canRequestReview = computed(() => {
  if (!isAssignee.value) return false
  if (props.docData.status !== '처리중') return false
  if (props.docData.reviewRequestedAt) return false
  
  // 만약 현재 담당자가 본인의 검토 차례라서 '검토 승인' 버튼이 활성화된 경우, 불필요한 '검토 요청' 버튼은 숨김
  if (canApproveReview.value) return false
  
  return props.docData.reviewSteps && props.docData.reviewSteps.length > 0
})

const canComplete = computed(() => {
  if (!isAssignee.value) return false
  if (props.docData.status !== '처리중') return false
  if (props.docData.reviewRequestedAt) return false
  return !props.docData.reviewSteps || props.docData.reviewSteps.length === 0
})

const myReviewStepIndex = computed(() => {
  if (!props.docData.reviewSteps) return -1
  return props.docData.reviewSteps.findIndex(s => s.email === currentUserEmail.value)
})

const canApproveReview = computed(() => {
  const idx = myReviewStepIndex.value
  if (idx === -1) return false
  const step = props.docData.reviewSteps[idx]
  if (step.isApproved) return false
  
  // 담당자(기안자) 본인이 검토자인 경우, 검토요청 단계를 생략하고 바로 승인할 수 있도록 허용!
  if (!props.docData.reviewRequestedAt && !isAssignee.value) {
    return false
  }
  
  // 이전 단계들이 모두 승인되어야 내 차례
  const prevSteps = props.docData.reviewSteps.slice(0, idx)
  return prevSteps.every(s => s.isApproved)
})

// 커스텀 다이얼로그 상태 관리
const dialog = ref({
  show: false,
  title: '',
  message: '',
  type: 'info', // 'info' | 'error'
  isConfirm: false,
  onConfirm: () => {},
  onCancel: () => {}
})

const showConfirm = (title, message) => {
  return new Promise((resolve) => {
    dialog.value = {
      show: true,
      title,
      message,
      type: 'info',
      isConfirm: true,
      onConfirm: () => { dialog.value.show = false; resolve(true) },
      onCancel: () => { dialog.value.show = false; resolve(false) }
    }
  })
}

const showAlert = (title, message, type = 'info') => {
  return new Promise((resolve) => {
    dialog.value = {
      show: true,
      title,
      message,
      type,
      isConfirm: false,
      onConfirm: () => { dialog.value.show = false; resolve() },
      onCancel: () => { dialog.value.show = false; resolve() }
    }
  })
}

const isProcessing = ref(false)

const requestReview = async () => {
  const confirmed = await showConfirm('검토 요청', '지정된 검토자에게 검토를 요청하시겠습니까?')
  if (!confirmed) return
  
  isProcessing.value = true
  try {
    const dRef = doc(db, 'documents', props.docData.id)
    const updates = {
      status: '처리중',
      reviewRequestedAt: new Date()
    }
    await updateDoc(dRef, updates)
    Object.assign(props.docData, updates)
    emit('updated')
    await showAlert('요청 완료', '성공적으로 검토 요청이 전송되었습니다.')
  } catch (e) {
    console.error(e)
    await showAlert('권한 또는 네트워크 오류', '처리에 실패했습니다. 읽기/쓰기 권한이 없거나 네트워크 연결이 불안정합니다.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const completeDoc = async () => {
  const confirmed = await showConfirm('처리 완료', '이 문서의 처리를 최종 완료하시겠습니까?')
  if (!confirmed) return
  
  isProcessing.value = true
  try {
    const dRef = doc(db, 'documents', props.docData.id)
    const updates = {
      status: '완료',
      completedAt: new Date()
    }
    await updateDoc(dRef, updates)
    Object.assign(props.docData, updates)
    emit('updated')
    await showAlert('처리 완료', '문서 처리가 최종 완료되었습니다.')
  } catch (e) {
    console.error(e)
    await showAlert('오류 발생', '문서 상태를 업데이트하는 데 실패했습니다. 관리자에게 문의하세요.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const approveReview = async (idx) => {
  const confirmed = await showConfirm('검토 승인', '내용을 모두 확인하였으며, 승인하시겠습니까?')
  if (!confirmed) return
  
  isProcessing.value = true
  try {
    const reviewSteps = [...props.docData.reviewSteps]
    reviewSteps[idx].isApproved = true
    reviewSteps[idx].approvedAt = new Date()
    
    const updates = { reviewSteps }
    if (!props.docData.reviewRequestedAt) {
      updates.reviewRequestedAt = new Date() // 담당자가 검토요청 없이 바로 승인한 경우 기록
    }
    
    if (idx === reviewSteps.length - 1) {
      updates.status = '완료'
      updates.completedAt = new Date()
    } else {
      updates.status = '검토중' // 아직 다음 결재자가 남은 경우 상태 변경
    }
    
    const dRef = doc(db, 'documents', props.docData.id)
    await updateDoc(dRef, updates)
    Object.assign(props.docData, updates)
    emit('updated')
    await showAlert('승인 완료', '정상적으로 검토 및 승인 처리되었습니다.')
  } catch (e) {
    console.error(e)
    await showAlert('승인 처리 실패', '데이터베이스 권한이 없거나 저장 중 문제가 발생했습니다.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const close = () => {
  emit('close')
}

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const extractFileId = (url) => {
  if (!url) return null
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}

const openFolder = (file) => {
  if (file.status === 'pending') {
    alert('구글 드라이브와 연동되지 않은 파일입니다.')
    return
  }

  if (props.docData.driveSubFolderId) {
    // 1. 하위 폴더 ID가 저장된 최신 문서의 경우 (정확히 해당 폴더 열기)
    window.open(`https://drive.google.com/drive/folders/${props.docData.driveSubFolderId}`, '_blank')
  } else if (props.docData.driveFolderId) {
    // 2. 과거 문서 (루트 폴더 ID만 있음) -> 구글 드라이브 검색으로 문서번호 이름의 폴더를 찾음
    const query = encodeURIComponent(`"${props.docData.receiptNo}"`)
    window.open(`https://drive.google.com/drive/search?q=${query}`, '_blank')
  } else {
    alert('연결된 구글 드라이브 폴더 정보가 없습니다.')
  }
}
</script>

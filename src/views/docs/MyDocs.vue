<template>
  <div class="p-8 pb-20 max-w-6xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">내 문서함</h1>
      <p class="text-sm text-gray-500 mt-1">배정받았거나 검토해야 할 문서 목록입니다.</p>
    </header>

    <div v-if="loading" class="text-center py-10 text-gray-400">데이터를 불러오는 중입니다...</div>
    
    <div v-else-if="docs.length === 0" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
      <div class="text-4xl mb-4 text-gray-300">📄</div>
      <p class="text-gray-500 font-medium">현재 배정된 문서가 없습니다.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="d in docs" :key="d.id" @click="openDoc(d)" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md hover:border-blue-200 cursor-pointer transition transform hover:-translate-y-1">
        <div class="space-y-3 relative">
          <!-- Unread Indicator -->
          <div v-if="isUnread(d)" class="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>

          <div class="flex items-center gap-2">
            <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{{ d.receiptNo }}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded" :class="getStatusClass(d.status)">{{ d.status }}</span>
          </div>
          <h3 class="font-bold text-gray-900 text-base leading-snug line-clamp-2 h-11">{{ d.title }}</h3>
          <p class="text-xs text-gray-500 line-clamp-1">발신: {{ d.senderOrg }}</p>
        </div>
        
        <div class="pt-4 mt-4 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
          <span>배정일시: {{ formatDate(d.assignedAt) }}</span>
          <span v-if="!isUnread(d)" class="text-green-600 font-medium flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            읽음
          </span>
        </div>
      </div>
    </div>
    
    <!-- 문서 상세 모달 -->
    <DocDetailModal :show="showModal" :docData="selectedDoc" @close="showModal = false" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../../firebase/config'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { useAuthStore } from '../../store/auth'
import DocDetailModal from '../../components/DocDetailModal.vue'

const loading = ref(true)
const docs = ref([])
const authStore = useAuthStore()

// 모달 관련 상태
const showModal = ref(false)
const selectedDoc = ref({})

const loadData = async () => {
  loading.value = true
  try {
    const userEmail = authStore.user.email
    const userRole = authStore.profile?.role
    const isBasicUser = userRole === 'user'
    
    const merged = new Map()

    // Assignee Query: 본인이 담당자로 지정된 문서
    const qAssignee = query(collection(db, 'documents'), where('assigneeEmail', '==', userEmail))
    const snapAssignee = await getDocs(qAssignee)
    snapAssignee.docs.forEach(d => {
      const data = d.data()
      data.assignedAt = data.assignedAt?.toDate?.() || data.assignedAt
      data.receiptDate = data.receiptDate?.toDate?.() || data.receiptDate
      merged.set(d.id, { id: d.id, ...data })
    })
    
    // 관리자, 검토자, 접수자인 경우 모든 문서를 가져와 검토자/담당자 여부 확인
    if (!isBasicUser) {
      const snapAll = await getDocs(collection(db, 'documents'))
      snapAll.docs.forEach(d => {
        const data = d.data()
        const isAssignee = data.assigneeEmail === userEmail
        const isReviewer = (data.reviewSteps || []).some(s => s.email === userEmail)
        
        if (isAssignee || isReviewer) {
          data.assignedAt = data.assignedAt?.toDate?.() || data.assignedAt
          data.receiptDate = data.receiptDate?.toDate?.() || data.receiptDate
          merged.set(d.id, { id: d.id, ...data })
        }
      })
    }
    
    docs.value = Array.from(merged.values()).sort((a,b) => (b.assignedAt || 0) - (a.assignedAt || 0))
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const isUnread = (d) => {
  const email = authStore.user.email
  if (d.assigneeEmail === email) {
    return !d.assigneeReadAt
  }
  const myReviewStep = (d.reviewSteps || []).find(s => s.email === email)
  if (myReviewStep) {
    return !myReviewStep.isRead
  }
  return false
}

const openDoc = async (d) => {
  const email = authStore.user.email
  let needsUpdate = false
  let updates = {}

  // 현재 문서 데이터 딥카피 (UI 즉각 반영 위함)
  const docDataForModal = { ...d }

  if (d.assigneeEmail === email && !d.assigneeReadAt) {
    updates.assigneeReadAt = new Date()
    updates.status = d.status === '배정완료' ? '처리중' : d.status
    needsUpdate = true
    
    docDataForModal.assigneeReadAt = updates.assigneeReadAt
    docDataForModal.status = updates.status
  }

  const reviewSteps = [...(d.reviewSteps || [])]
  const stepIndex = reviewSteps.findIndex(s => s.email === email)
  
  if (stepIndex !== -1 && !reviewSteps[stepIndex].isRead) {
    reviewSteps[stepIndex].isRead = true
    reviewSteps[stepIndex].readAt = new Date()
    updates.reviewSteps = reviewSteps
    
    // 최종 검토자면 자동 완료 처리
    const isFinalReviewer = stepIndex === reviewSteps.length - 1
    if (isFinalReviewer) {
      updates.status = '완료'
    } else {
      if (updates.status !== '완료') updates.status = '처리중'
    }
    needsUpdate = true

    docDataForModal.reviewSteps = reviewSteps
    docDataForModal.status = updates.status || d.status
  }

  // 모달 먼저 띄우기
  selectedDoc.value = docDataForModal
  showModal.value = true

  // 백그라운드 업데이트
  if (needsUpdate) {
    try {
      const refDoc = doc(db, 'documents', d.id)
      await updateDoc(refDoc, updates)
      await loadData() // refresh local silently
    } catch(e) {
      console.error('상태 업데이트 실패', e)
    }
  }
}

const getStatusClass = (s) => {
  return {
    '접수대기': 'bg-gray-100 text-gray-600',
    '배정완료': 'bg-amber-50 text-amber-600',
    '처리중': 'bg-blue-50 text-blue-600',
    '완료': 'bg-green-50 text-green-700'
  }[s] || 'bg-gray-100'
}

const formatDate = (dateObj) => {
  if (!dateObj) return '-'
  const d = new Date(dateObj)
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

onMounted(() => {
  loadData()
})
</script>

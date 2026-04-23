<template>
  <div class="p-8 pb-20 max-w-6xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">내 문서함</h1>
      <p class="text-sm text-gray-500 mt-1">배정받았거나 검토해야 할 문서 목록입니다.</p>
    </header>

    <div v-if="loading" class="text-center py-10 text-slate-400 text-[14px]">데이터를 불러오는 중입니다...</div>
    
    <div v-else-if="docs.length === 0" class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 p-20 text-center">
      <div class="text-5xl mb-5 text-slate-200">📄</div>
      <p class="text-slate-400 font-bold text-[15px]">현재 배정된 문서가 없습니다.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="d in docs" :key="d.id" @click="openDoc(d)" class="bg-white rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-slate-100 p-7 flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200 cursor-pointer transition-all duration-300">
        <div class="space-y-3.5 relative">
          <!-- Unread Indicator -->
          <div v-if="isUnread(d)" class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.6)] animate-pulse"></div>

          <div class="flex items-center gap-2">
            <span class="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{{ d.receiptNo }}</span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded-md" :class="getStatusClass(d.status)">{{ d.status }}</span>
          </div>
          <h3 class="font-bold text-slate-800 text-[16px] leading-snug line-clamp-2">{{ d.title }}</h3>
          <p class="text-[13px] text-slate-500 line-clamp-1">발신: {{ d.senderOrg }}</p>
        </div>
        
        <div class="pt-5 mt-5 border-t border-slate-50 text-[12px] text-slate-400 flex justify-between items-center">
          <span>배정일시: {{ formatDate(d.assignedAt) }}</span>
          <span v-if="!isUnread(d)" class="text-emerald-500 font-bold flex items-center gap-1">
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            읽음
          </span>
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
  const email = authStore.user?.email
  if (!email) return false
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
    needsUpdate = true

    docDataForModal.reviewSteps = reviewSteps
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
    '접수대기': 'bg-slate-100 text-slate-600',
    '배정완료': 'bg-amber-100 text-amber-700',
    '처리중': 'bg-indigo-100 text-indigo-700',
    '검토중': 'bg-indigo-100 text-indigo-700',
    '완료': 'bg-emerald-100 text-emerald-700'
  }[s] || 'bg-slate-100'
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

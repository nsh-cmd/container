<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- 헤더 -->
      <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 rounded-t-2xl">
        <div>
          <h3 class="font-bold text-gray-800 text-lg">문서 상세 정보</h3>
          <p class="text-xs text-gray-500 font-mono mt-0.5">{{ docData.receiptNo }}</p>
        </div>
        <button @click="close" class="text-gray-400 hover:text-gray-600 transition p-1">
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
              'bg-gray-100 text-gray-600': docData.status === '접수대기',
              'bg-amber-100 text-amber-700': docData.status === '배정완료',
              'bg-blue-100 text-blue-700': docData.status === '처리중',
              'bg-green-100 text-green-700': docData.status === '완료'
            }">{{ docData.status }}</span>
          </div>
          <div class="text-right">
            <p class="text-xs text-blue-600 font-semibold mb-1">담당자</p>
            <p class="text-sm font-medium text-gray-800">{{ docData.assigneeName || '미배정' }}</p>
          </div>
        </div>

        <!-- 기본 정보 -->
        <div>
          <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>기본 정보
          </h4>
          <div class="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <div>
              <p class="text-xs text-gray-500 mb-1">문서 제목</p>
              <p class="text-sm font-medium text-gray-800">{{ docData.title }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">문서 분류</p>
              <p class="text-sm font-medium text-gray-800">{{ docData.categoryName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">발신 기관명</p>
              <p class="text-sm font-medium text-gray-800">{{ docData.senderOrg || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">발신 문서번호</p>
              <p class="text-sm font-medium text-gray-800">{{ docData.senderDocNo || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">접수자</p>
              <p class="text-sm font-medium text-gray-800">{{ docData.receiptUserName || '-' }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500 mb-1">원문 접수 일시</p>
              <p class="text-sm font-medium text-gray-800">{{ formatDate(docData.receiptDate) }}</p>
            </div>
          </div>
        </div>

        <!-- 특이사항 (비고) -->
        <div v-if="docData.note">
          <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>특이사항 (비고)
          </h4>
          <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <p class="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{{ docData.note }}</p>
          </div>
        </div>

        <!-- 첨부파일 -->
        <div v-if="docData.attachments && docData.attachments.length > 0">
          <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>첨부파일
          </h4>
          <div class="space-y-2">
            <div v-for="(file, idx) in docData.attachments" :key="idx" class="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-100 hover:bg-gray-100 transition">
              <div class="flex items-center gap-3 min-w-0">
                <span class="text-lg shrink-0">📎</span>
                <div class="min-w-0">
                  <p class="text-sm font-medium text-gray-800 truncate">{{ file.name }}</p>
                  <p class="text-[11px] text-gray-500">{{ formatFileSize(file.size) }} <span v-if="file.status === 'pending'" class="text-amber-500 ml-1">(Drive 연동 안됨)</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 결재 흐름 -->
        <div v-if="docData.reviewSteps && docData.reviewSteps.length > 0">
          <h4 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>결재 검토 흐름
          </h4>
          <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
            <div v-for="step in docData.reviewSteps" :key="step.level" class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{{ step.level }}</div>
                <div>
                  <p class="text-sm font-semibold text-gray-800">{{ step.label }} <span class="text-xs font-normal text-gray-500 ml-1">{{ step.name || '미지정' }}</span></p>
                </div>
              </div>
              <div class="text-xs font-medium px-2.5 py-1 rounded-md" :class="step.isRead ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">
                {{ step.isRead ? '확인 완료' : '대기중' }}
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- 푸터 -->
      <div class="px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl text-right">
        <button @click="close" class="bg-white border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm">
          닫기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: Boolean,
  docData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

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
</script>

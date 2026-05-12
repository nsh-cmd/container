<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
      <!-- 헤더 -->
      <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-2xl">
        <div>
          <h3 class="font-bold text-slate-800 text-lg">{{ isEditing ? '문서 수정' : '문서 상세 정보' }}</h3>
          <p class="text-xs text-slate-500 font-mono mt-0.5">{{ docData.receiptNo }}</p>
        </div>
        <button @click="handleClose" class="text-slate-400 hover:text-slate-600 transition p-1">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <!-- 본문 -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1">

        <!-- ───────── 조회 모드 ───────── -->
        <template v-if="!isEditing">
          <!-- 상태 및 배정 정보 -->
          <div class="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
            <div>
              <p class="text-xs text-blue-600 font-semibold mb-1">현재 상태</p>
              <span class="px-3 py-1 rounded-lg text-sm font-bold shadow-sm" :class="{
                'bg-slate-100 text-slate-600': docData.status === '접수대기',
                'bg-amber-100 text-amber-700': docData.status === '배정완료',
                'bg-blue-100 text-blue-700': docData.status === '처리중' || docData.status === '검토중',
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
              <div v-if="docData.updatedAt">
                <p class="text-xs text-slate-500 mb-1">최종 수정</p>
                <p class="text-sm font-medium text-slate-800">{{ formatDate(docData.updatedAt) }} <span class="text-xs text-slate-400">({{ docData.updatedBy || '' }})</span></p>
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
                      <a href="#" @click.prevent="openFolder(file)" class="hover:text-blue-600 hover:underline transition">{{ file.name }}</a>
                    </p>
                    <p class="text-[11px] text-slate-500">{{ formatFileSize(file.size) }} <span v-if="file.status === 'pending'" class="text-amber-500 ml-1">(Drive 연동 안됨)</span></p>
                  </div>
                  <a href="#" @click.prevent="openFolder(file)" class="ml-2 p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="폴더 열기">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- 결재 검토 흐름 -->
          <div v-if="docData.reviewSteps && docData.reviewSteps.length > 0">
            <h4 class="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>결재 검토 흐름
            </h4>
            <div class="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
              <!-- 담당자 전달 의견 표시 -->
              <div v-if="docData.assigneeComment" class="flex items-start gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                <span class="text-indigo-400 text-xs mt-0.5">📝</span>
                <div>
                  <p class="text-[10px] text-indigo-400 font-semibold mb-0.5">담당자 전달 의견</p>
                  <p class="text-xs text-indigo-700 leading-relaxed">{{ docData.assigneeComment }}</p>
                </div>
              </div>
              <!-- 담당자 코멘트 입력창 (검토 요청 전) -->
              <div v-if="canRequestReview">
                <p class="text-[10px] text-slate-500 font-semibold mb-1">검토자에게 전달할 의견 (선택)</p>
                <textarea v-model="reviewComment" rows="2"
                  class="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none bg-white"
                  placeholder="1차 검토자에게 전달할 내용을 입력하세요"></textarea>
              </div>
              <div v-for="step in docData.reviewSteps" :key="step.level" class="space-y-2">
                <div class="flex items-center justify-between">
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
                <!-- 승인 완료된 코멘트 표시 -->
                <div v-if="step.isApproved && step.comment" class="ml-9 flex items-start gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-2">
                  <span class="text-slate-400 text-xs mt-0.5">💬</span>
                  <p class="text-xs text-slate-600 leading-relaxed">{{ step.comment }}</p>
                </div>
                <!-- 현재 검토자 코멘트 입력창 -->
                <div v-if="step.email === currentUserEmail && canApproveReview && !step.isApproved && !isAutoSkipped(step)" class="ml-9">
                  <textarea v-model="reviewComment" rows="2"
                    class="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none bg-white"
                    placeholder="검토 의견을 남겨주세요 (선택 · 다음 검토자에게 전달됩니다)"></textarea>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- ───────── 편집 모드 ───────── -->
        <template v-else>
          <!-- 진행 상태 -->
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">진행 상태</label>
            <select v-model="editForm.status" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
              <option value="접수대기">접수대기</option>
              <option value="배정완료">배정완료</option>
              <option value="처리중">처리중</option>
              <option value="검토중">검토중</option>
              <option value="완료">완료</option>
            </select>
          </div>

          <!-- 문서 제목 -->
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">문서 제목 <span class="text-red-500">*</span></label>
            <input v-model="editForm.title" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="문서 제목">
          </div>

          <!-- 발신기관 / 발신문서번호 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">발신기관</label>
              <input v-model="editForm.senderOrg" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="발신 기관명">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">발신문서번호</label>
              <div class="flex items-center gap-1.5">
                <input v-model="editForm.senderDept" class="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="시행부서">
                <span class="text-gray-400 font-bold shrink-0">-</span>
                <input v-model="editForm.senderDocNum" class="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="번호">
              </div>
            </div>
          </div>

          <!-- 시행일자 / 분류 -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">시행일자</label>
              <input v-model="editForm.senderDocDate" type="date" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">문서 분류</label>
              <select v-model="editForm.category" @change="onCategoryChange" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="">분류 선택</option>
                <option v-for="cat in categories" :key="cat.code" :value="cat.code">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <!-- 특이사항 -->
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">특이사항 (비고)</label>
            <textarea v-model="editForm.note" rows="3" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="추가 메모..."></textarea>
          </div>

          <!-- 첨부파일 관리 -->
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-2">첨부파일 관리</label>

            <!-- 기존 파일 목록 -->
            <div v-if="docData.attachments && docData.attachments.length > 0" class="mb-3 space-y-1.5">
              <p class="text-[11px] text-slate-400 mb-1">기존 파일 (삭제 표시된 파일은 저장 시 제거됩니다)</p>
              <div v-for="(file, idx) in docData.attachments" :key="idx"
                   class="flex items-center justify-between px-3 py-2 rounded-lg border transition"
                   :class="isAttachmentRemoved(idx) ? 'bg-red-50 border-red-200 opacity-60' : 'bg-gray-50 border-gray-100'">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-base shrink-0">📎</span>
                  <span class="text-xs text-slate-700 truncate" :class="isAttachmentRemoved(idx) ? 'line-through text-red-400' : ''">{{ file.name }}</span>
                  <span class="text-[10px] text-slate-400 shrink-0">{{ formatFileSize(file.size) }}</span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 ml-2">
                  <span v-if="isAttachmentRemoved(idx)" class="text-[10px] text-red-500 font-semibold">삭제 예정</span>
                  <button v-if="!isAttachmentRemoved(idx)" @click="markAttachmentRemoved(idx)"
                          class="text-[11px] font-semibold text-red-500 hover:text-red-700 transition underline underline-offset-1">삭제</button>
                  <button v-else @click="unmarkAttachmentRemoved(idx)"
                          class="text-[11px] font-semibold text-slate-500 hover:text-slate-700 transition underline underline-offset-1">복구</button>
                </div>
              </div>
            </div>

            <!-- 새 파일 추가 드롭존 -->
            <div
              @click="$refs.editFileInput.click()"
              @dragover.prevent="isDragOver = true"
              @dragleave.prevent="isDragOver = false"
              @drop.prevent="handleEditDrop"
              class="border-2 border-dashed rounded-xl px-4 py-5 text-center cursor-pointer transition-all"
              :class="isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'">
              <p class="text-sm text-gray-500">파일을 드래그하거나 <span class="text-blue-600 font-semibold">클릭하여 추가</span></p>
            </div>
            <input ref="editFileInput" type="file" multiple class="hidden" @change="handleEditFileSelect">

            <!-- 추가된 신규 파일 -->
            <div v-if="newFiles.length > 0" class="mt-2 space-y-1.5">
              <p class="text-[11px] text-slate-400">추가할 파일</p>
              <div v-for="(file, idx) in newFiles" :key="idx" class="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="text-base shrink-0">📄</span>
                  <span class="text-xs text-slate-700 truncate">{{ file.name }}</span>
                  <span class="text-[10px] text-slate-400 shrink-0">{{ formatFileSize(file.size) }}</span>
                </div>
                <button @click="removeNewFile(idx)" class="text-[11px] font-semibold text-red-400 hover:text-red-600 transition shrink-0 ml-2">제거</button>
              </div>
            </div>

            <p v-if="!settingsStore.appsScriptUrl && newFiles.length > 0" class="text-[11px] text-amber-600 mt-2">
              ⚠️ Apps Script 미연동 — 파일 정보만 기록되며 Drive 업로드는 되지 않습니다.
            </p>
          </div>

          <!-- 결재 검토 흐름 (편집 불가) -->
          <div v-if="docData.reviewSteps && docData.reviewSteps.length > 0">
            <h4 class="text-xs font-semibold text-slate-400 mb-2">결재 검토 흐름 (수정 불가)</h4>
            <div class="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2">
              <div v-for="step in docData.reviewSteps" :key="step.level" class="flex items-center justify-between">
                <p class="text-xs text-slate-600">{{ stepTitle(step) }} <span class="text-slate-400">({{ (step.name || '미지정').replace(/ *\(자동생략\)/, '') }})</span></p>
                <span class="text-[10px] px-2 py-0.5 rounded font-medium" :class="isAutoSkipped(step) ? 'bg-amber-100 text-amber-700' : (step.isApproved ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500')">
                  {{ isAutoSkipped(step) ? '검토생략' : (step.isApproved ? '승인' : '대기') }}
                </span>
              </div>
            </div>
          </div>
        </template>

      </div>

      <!-- 푸터 -->
      <div class="px-6 py-4 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl flex justify-between items-center gap-2">
        <div class="flex gap-2 flex-wrap">
          <!-- 조회 모드 액션 -->
          <template v-if="!isEditing">
            <button v-if="canRequestReview" @click="requestReview" :disabled="isProcessing" class="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm disabled:opacity-50">
              {{ isProcessing ? '처리중...' : '검토 요청' }}
            </button>
            <button v-if="canComplete" @click="completeDoc" :disabled="isProcessing" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50">
              {{ isProcessing ? '처리중...' : '처리 완료' }}
            </button>
            <button v-if="canApproveReview" @click="approveReview(myReviewStepIndex)" :disabled="isProcessing" class="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm disabled:opacity-50">
              {{ isProcessing ? '처리중...' : '검토 승인' }}
            </button>
            <!-- 관리자/접수자 전용 -->
            <template v-if="isAdminOrReceiver">
              <button @click="startEditing" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                수정
              </button>
              <button @click="handleDeleteDoc" :disabled="isDeleting" class="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-red-700 transition shadow-sm disabled:opacity-50">
                {{ isDeleting ? '삭제 중...' : '삭제' }}
              </button>
            </template>
          </template>

          <!-- 편집 모드 액션 -->
          <template v-else>
            <button @click="saveEdit" :disabled="isSaving" class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50">
              {{ isSaving ? '저장 중...' : '저장하기' }}
            </button>
            <button @click="cancelEditing" class="bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
              취소
            </button>
          </template>
        </div>

        <button v-if="!isEditing" @click="handleClose" class="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm shrink-0">
          닫기
        </button>
      </div>
    </div>

    <!-- 커스텀 다이얼로그 -->
    <div v-if="dialog.show" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                 :class="dialog.type === 'error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'">
              <svg v-if="dialog.type === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ dialog.title }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-line">{{ dialog.message }}</p>
          <div class="flex justify-end gap-2">
            <button v-if="dialog.isConfirm" @click="dialog.onCancel" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition">취소</button>
            <button @click="dialog.onConfirm" class="px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                    :class="dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'">확인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'
import { sendSlackMessage, getSlackMention, getAppLink } from '../utils/slack'
import { db } from '../firebase/config'
import { doc, updateDoc, deleteDoc as firestoreDeleteDoc, getDoc } from 'firebase/firestore'
import { isAutoSkipped } from '../utils/docUtils'

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const currentUserEmail = computed(() => authStore.user?.email)

const isAdminOrReceiver = computed(() => ['admin', 'receiver'].includes(authStore.profile?.role))

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

const emit = defineEmits(['close', 'updated', 'deleted'])

// ── 검토 코멘트 ──
const reviewComment = ref('')

// ── 편집 상태 ──
const isEditing = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)
const isDragOver = ref(false)
const editForm = ref({})
const categories = ref([])
const newFiles = ref([])
const removedAttachmentIndices = ref([])
const editFileInput = ref(null)

const MAX_FILE_SIZE = 10 * 1024 * 1024

watch(() => props.show, async (val) => {
  if (!val) {
    isEditing.value = false
    newFiles.value = []
    removedAttachmentIndices.value = []
    reviewComment.value = ''
    return
  }
  // 모달 열릴 때: 담당자=검토자인 경우 기존 문서 assigneeReadAt 소급 처리
  const userEmail = authStore.user?.email
  if (
    userEmail &&
    userEmail === props.docData.assigneeEmail &&
    !props.docData.assigneeReadAt &&
    Array.isArray(props.docData.reviewSteps) &&
    props.docData.reviewSteps.some(s => s.email === userEmail && s.isApproved)
  ) {
    try {
      const now = new Date()
      await updateDoc(doc(db, 'documents', props.docData.id), { assigneeReadAt: now })
      Object.assign(props.docData, { assigneeReadAt: now })
      emit('updated')
    } catch (e) {}
  }
})

const loadCategories = async () => {
  if (categories.value.length > 0) return
  try {
    const snap = await getDoc(doc(db, 'settings', 'categories'))
    if (snap.exists() && snap.data().items) {
      categories.value = snap.data().items.filter(c => c.active)
    }
  } catch (e) {}
}

const startEditing = async () => {
  await loadCategories()
  const d = props.docData
  editForm.value = {
    title: d.title || '',
    senderOrg: d.senderOrg || '',
    senderDept: d.senderDept || (d.senderDocNo ? d.senderDocNo.split('-')[0] : ''),
    senderDocNum: d.senderDocNum || (d.senderDocNo ? d.senderDocNo.split('-').slice(1).join('-') : ''),
    senderDocDate: d.senderDocDate || '',
    note: d.note || '',
    category: d.category || '',
    categoryName: d.categoryName || '',
    status: d.status || ''
  }
  newFiles.value = []
  removedAttachmentIndices.value = []
  isEditing.value = true
}

const cancelEditing = () => {
  isEditing.value = false
  newFiles.value = []
  removedAttachmentIndices.value = []
}

const handleClose = () => {
  if (isEditing.value) {
    cancelEditing()
  } else {
    emit('close')
  }
}

const onCategoryChange = () => {
  const cat = categories.value.find(c => c.code === editForm.value.category)
  if (cat) editForm.value.categoryName = cat.name
}

// ── 파일 관리 ──
const handleEditFileSelect = (e) => {
  addNewFiles(Array.from(e.target.files))
  e.target.value = ''
}
const handleEditDrop = (e) => {
  isDragOver.value = false
  addNewFiles(Array.from(e.dataTransfer.files))
}
const addNewFiles = (files) => {
  for (const file of files) {
    if (file.size > MAX_FILE_SIZE) {
      alert(`"${file.name}" 파일이 10MB를 초과합니다.`)
      continue
    }
    newFiles.value.push(file)
  }
}
const removeNewFile = (idx) => newFiles.value.splice(idx, 1)
const markAttachmentRemoved = (idx) => {
  if (!removedAttachmentIndices.value.includes(idx)) removedAttachmentIndices.value.push(idx)
}
const unmarkAttachmentRemoved = (idx) => {
  removedAttachmentIndices.value = removedAttachmentIndices.value.filter(i => i !== idx)
}
const isAttachmentRemoved = (idx) => removedAttachmentIndices.value.includes(idx)

const fileToBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result.split(',')[1])
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// ── 저장 ──
const saveEdit = async () => {
  if (!editForm.value.title?.trim()) {
    await showAlert('입력 오류', '문서 제목을 입력해주세요.', 'error')
    return
  }
  const confirmed = await showConfirm('수정 저장', '변경 사항을 저장하시겠습니까?')
  if (!confirmed) return

  isSaving.value = true
  try {
    const appsUrl = settingsStore.appsScriptUrl
    const currentAttachments = [...(props.docData.attachments || [])]

    // 1. 드라이브 파일 삭제 (삭제 표시된 파일)
    if (appsUrl) {
      for (const idx of removedAttachmentIndices.value) {
        const att = currentAttachments[idx]
        if (att?.fileId) {
          try {
            await fetch(appsUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'text/plain' },
              body: JSON.stringify({ action: 'deleteFile', fileId: att.fileId })
            })
          } catch (e) {}
        }
      }
    }

    // 2. 남은 파일 목록
    const remaining = currentAttachments.filter((_, i) => !removedAttachmentIndices.value.includes(i))

    // 3. 새 파일 업로드
    const uploaded = []
    for (const file of newFiles.value) {
      if (appsUrl) {
        try {
          const base64 = await fileToBase64(file)
          const res = await fetch(appsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'upload', receiptNo: props.docData.receiptNo, fileName: file.name, fileBase64: base64, mimeType: file.type })
          })
          const data = await res.json()
          uploaded.push(data.success
            ? { name: data.fileName || file.name, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString(), status: 'uploaded', fileId: data.fileId, fileUrl: data.fileUrl, folderId: data.folderId }
            : { name: file.name, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString(), status: 'failed' }
          )
        } catch (e) {
          uploaded.push({ name: file.name, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString(), status: 'failed' })
        }
      } else {
        uploaded.push({ name: file.name, size: file.size, mimeType: file.type, uploadedAt: new Date().toISOString(), status: 'pending' })
      }
    }

    const finalAttachments = [...remaining, ...uploaded]
    const senderDocNo = [editForm.value.senderDept, editForm.value.senderDocNum].filter(Boolean).join('-')

    // 4. Firestore 업데이트
    const updates = {
      title: editForm.value.title.trim(),
      senderOrg: editForm.value.senderOrg,
      senderDept: editForm.value.senderDept,
      senderDocNum: editForm.value.senderDocNum,
      senderDocDate: editForm.value.senderDocDate || null,
      senderDocNo,
      note: editForm.value.note,
      category: editForm.value.category,
      categoryName: editForm.value.categoryName,
      status: editForm.value.status,
      attachments: finalAttachments,
      attachmentCount: finalAttachments.length,
      updatedAt: new Date(),
      updatedBy: authStore.user.email
    }

    await updateDoc(doc(db, 'documents', props.docData.id), updates)
    Object.assign(props.docData, updates)
    isEditing.value = false
    newFiles.value = []
    removedAttachmentIndices.value = []
    emit('updated')
    await showAlert('저장 완료', '문서가 정상적으로 수정되었습니다.')
  } catch (e) {
    console.error(e)
    await showAlert('저장 실패', '문서 수정에 실패했습니다. 권한이나 네트워크를 확인하세요.', 'error')
  } finally {
    isSaving.value = false
  }
}

// ── 삭제 ──
const handleDeleteDoc = async () => {
  const confirmed = await showConfirm('문서 삭제', `[${props.docData.receiptNo}] 문서를 영구 삭제하시겠습니까?\n\n첨부파일(Google Drive)도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.`)
  if (!confirmed) return

  isDeleting.value = true
  try {
    const appsUrl = settingsStore.appsScriptUrl

    // 드라이브 폴더 삭제
    if (appsUrl) {
      if (props.docData.driveSubFolderId) {
        try {
          await fetch(appsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: 'deleteFolder', folderId: props.docData.driveSubFolderId })
          })
        } catch (e) {}
      } else if (props.docData.attachments?.length > 0) {
        for (const att of props.docData.attachments) {
          if (att.fileId) {
            try {
              await fetch(appsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify({ action: 'deleteFile', fileId: att.fileId })
              })
            } catch (e) {}
          }
        }
      }
    }

    // Firestore 문서 삭제
    await firestoreDeleteDoc(doc(db, 'documents', props.docData.id))
    emit('deleted')
    emit('close')
  } catch (e) {
    console.error(e)
    await showAlert('삭제 실패', '문서 삭제에 실패했습니다. 권한이나 네트워크를 확인하세요.', 'error')
  } finally {
    isDeleting.value = false
  }
}

// ── 기존 액션 권한 ──
const isAssignee = computed(() => currentUserEmail.value === props.docData.assigneeEmail)

const canRequestReview = computed(() => {
  if (!isAssignee.value) return false
  if (props.docData.status !== '처리중') return false
  if (props.docData.reviewRequestedAt) return false
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
  if (!props.docData.reviewRequestedAt && !isAssignee.value) return false
  return props.docData.reviewSteps.slice(0, idx).every(s => s.isApproved)
})

// ── 커스텀 다이얼로그 ──
const dialog = ref({ show: false, title: '', message: '', type: 'info', isConfirm: false, onConfirm: () => {}, onCancel: () => {} })

const showConfirm = (title, message) => new Promise((resolve) => {
  dialog.value = { show: true, title, message, type: 'info', isConfirm: true,
    onConfirm: () => { dialog.value.show = false; resolve(true) },
    onCancel: () => { dialog.value.show = false; resolve(false) }
  }
})

const showAlert = (title, message, type = 'info') => new Promise((resolve) => {
  dialog.value = { show: true, title, message, type, isConfirm: false,
    onConfirm: () => { dialog.value.show = false; resolve() },
    onCancel: () => { dialog.value.show = false; resolve() }
  }
})

const isProcessing = ref(false)

const requestReview = async () => {
  const confirmed = await showConfirm('검토 요청', '지정된 검토자에게 검토를 요청하시겠습니까?')
  if (!confirmed) return
  isProcessing.value = true
  try {
    const updates = { status: '처리중', reviewRequestedAt: new Date() }
    if (reviewComment.value.trim()) updates.assigneeComment = reviewComment.value.trim()
    await updateDoc(doc(db, 'documents', props.docData.id), updates)
    Object.assign(props.docData, updates)
    reviewComment.value = ''
    emit('updated')
    // Slack 알림 → 1차 검토자에게 검토 요청
    if (settingsStore.slackWebhookUrl) {
      const firstStep = (props.docData.reviewSteps || []).find(s => !isAutoSkipped(s))
      if (firstStep?.email) {
        const mention = getSlackMention(firstStep.email, firstStep.name, settingsStore.slackMemberMap)
        sendSlackMessage(settingsStore.slackWebhookUrl,
          `${mention} 📋 *[${props.docData.receiptNo}] ${props.docData.title}* 문서 검토를 요청드립니다.${getAppLink()}`)
      }
    }
    await showAlert('요청 완료', '성공적으로 검토 요청이 전송되었습니다.')
  } catch (e) {
    await showAlert('오류', '처리에 실패했습니다.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const completeDoc = async () => {
  const confirmed = await showConfirm('처리 완료', '이 문서의 처리를 최종 완료하시겠습니까?')
  if (!confirmed) return
  isProcessing.value = true
  try {
    const updates = { status: '완료', completedAt: new Date() }
    await updateDoc(doc(db, 'documents', props.docData.id), updates)
    Object.assign(props.docData, updates)
    emit('updated')
    await showAlert('처리 완료', '문서 처리가 최종 완료되었습니다.')
  } catch (e) {
    await showAlert('오류', '업데이트에 실패했습니다.', 'error')
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
    if (reviewComment.value.trim()) reviewSteps[idx].comment = reviewComment.value.trim()
    const updates = { reviewSteps }
    if (!props.docData.reviewRequestedAt) updates.reviewRequestedAt = new Date()
    updates.status = idx === reviewSteps.length - 1 ? '완료' : '검토중'
    if (idx === reviewSteps.length - 1) updates.completedAt = new Date()
    // 검토자가 담당자이기도 한 경우 assigneeReadAt 동시 업데이트
    const userEmail = authStore.user?.email
    if (userEmail && userEmail === props.docData.assigneeEmail && !props.docData.assigneeReadAt) {
      updates.assigneeReadAt = new Date()
    }
    await updateDoc(doc(db, 'documents', props.docData.id), updates)
    Object.assign(props.docData, updates)
    reviewComment.value = ''
    emit('updated')
    // Slack 알림
    if (settingsStore.slackWebhookUrl) {
      const docTitle = props.docData.title
      const receiptNo = props.docData.receiptNo
      const isFinal = idx === reviewSteps.length - 1
      if (isFinal) {
        // 최종 승인 → 담당자에게 완료 알림
        const mention = getSlackMention(props.docData.assigneeEmail, props.docData.assigneeName, settingsStore.slackMemberMap)
        sendSlackMessage(settingsStore.slackWebhookUrl,
          `${mention} ✅ *[${receiptNo}] ${docTitle}* 문서의 모든 검토가 완료되었습니다.${getAppLink()}`)
      } else {
        // 다음 비생략 검토자에게 요청 알림
        const nextStep = reviewSteps.slice(idx + 1).find(s => !isAutoSkipped(s))
        if (nextStep?.email) {
          const mention = getSlackMention(nextStep.email, nextStep.name, settingsStore.slackMemberMap)
          sendSlackMessage(settingsStore.slackWebhookUrl,
            `${mention} 📋 *[${receiptNo}] ${docTitle}* 문서 검토를 요청드립니다.${getAppLink()}`)
        }
      }
    }
    await showAlert('승인 완료', '정상적으로 검토 및 승인 처리되었습니다.')
  } catch (e) {
    await showAlert('승인 실패', '권한이 없거나 저장 중 문제가 발생했습니다.', 'error')
  } finally {
    isProcessing.value = false
  }
}

const close = () => emit('close')

const formatDate = (timestamp) => {
  if (!timestamp) return '-'
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const openFolder = (file) => {
  if (file.status === 'pending') { alert('구글 드라이브와 연동되지 않은 파일입니다.'); return }
  if (props.docData.driveSubFolderId) {
    window.open(`https://drive.google.com/drive/folders/${props.docData.driveSubFolderId}`, '_blank')
  } else if (props.docData.driveFolderId) {
    window.open(`https://drive.google.com/drive/search?q=${encodeURIComponent('"' + props.docData.receiptNo + '"')}`, '_blank')
  } else {
    alert('연결된 구글 드라이브 폴더 정보가 없습니다.')
  }
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-10 px-4">
    <div class="max-w-3xl mx-auto">
      <!-- 헤더 -->
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">초기 환경 설정</h1>
        <p class="text-sm text-gray-500 mt-2">시스템을 사용하기 전에 아래 항목들을 설정해 주세요.</p>
      </div>

      <div class="space-y-6">

        <!-- 1. 시설 기본 정보 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">🏢 시설 기본 정보</h2>
            <button @click="toggleGuide('org')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.org ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>
          <div v-if="guideOpen.org" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 설정 안내</p>
            <ul class="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>시설명</strong>: 앱 전체에 표시되는 기관 이름입니다. (예: 동행빌리지, 해맑은빌라)</li>
              <li><strong>시설 유형</strong>: 해당 시설의 유형을 선택하세요.</li>
              <li>이 정보는 나중에 <strong>설정 > 기관 정보</strong> 메뉴에서 언제든 수정 가능합니다.</li>
            </ul>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">시설명 <span class="text-red-500">*</span></label>
              <input v-model="form.orgName" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="예: 동행빌리지">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">시설 유형</label>
              <select v-model="form.facilityType" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="">선택하세요</option>
                <option value="장애인거주시설">장애인거주시설</option>
                <option value="노인요양시설">노인요양시설</option>
                <option value="아동복지시설">아동복지시설</option>
                <option value="사회복지관">사회복지관</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
        </section>

        <!-- 2. Slack 알림 연동 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">💬 Slack 알림 연동</h2>
            <button @click="toggleGuide('slack')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.slack ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>
          <div v-if="guideOpen.slack" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 Slack Webhook 설정 방법</p>
            <ol class="list-decimal list-inside space-y-1 text-blue-700">
              <li><a href="https://api.slack.com/apps" target="_blank" class="underline font-semibold">Slack API 사이트</a>에 접속 → <strong>Create New App</strong> 클릭</li>
              <li><strong>From scratch</strong> 선택 → 앱 이름 입력 (예: 공문서알림) → 워크스페이스 선택</li>
              <li>왼쪽 메뉴에서 <strong>Incoming Webhooks</strong> → <strong>Activate</strong> 토글 ON</li>
              <li>하단의 <strong>Add New Webhook to Workspace</strong> → 알림 받을 채널 선택</li>
              <li>생성된 <strong>Webhook URL</strong>을 복사하여 아래에 붙여넣기</li>
            </ol>
            <p class="text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">⚠️ 이 설정은 선택사항입니다. 건너뛰어도 시스템 사용에 영향 없습니다.</p>
          </div>
          <div class="p-6">
            <label class="text-xs font-semibold text-gray-600 block mb-1">Slack Webhook URL</label>
            <div class="flex gap-2">
              <input v-model="form.slackWebhookUrl" class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono" placeholder="https://hooks.slack.com/services/...">
              <button @click="testSlack" :disabled="!form.slackWebhookUrl || testingSlack" class="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition whitespace-nowrap">
                {{ testingSlack ? '전송 중...' : '테스트' }}
              </button>
            </div>
            <p v-if="slackTestResult" class="text-xs mt-2" :class="slackTestResult.ok ? 'text-green-600' : 'text-red-500'">
              {{ slackTestResult.message }}
            </p>
          </div>
        </section>

        <!-- 3. Apps Script 연동 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">📜 Google Apps Script 연동</h2>
            <button @click="toggleGuide('gas')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.gas ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>
          <div v-if="guideOpen.gas" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 Apps Script 웹앱 URL 설정 방법</p>
            <ol class="list-decimal list-inside space-y-1 text-blue-700">
              <li><a href="https://script.google.com" target="_blank" class="underline font-semibold">Google Apps Script</a>에 접속 → <strong>새 프로젝트</strong> 생성</li>
              <li>공문서 관리에 필요한 스크립트를 작성 (Google Drive 연동, 스프레드시트 기록 등)</li>
              <li>상단 메뉴 <strong>배포 > 새 배포</strong> 클릭</li>
              <li>유형: <strong>웹 앱</strong> → 실행 권한: <strong>나</strong>, 액세스: <strong>모든 사용자</strong></li>
              <li>생성된 <strong>웹앱 URL</strong>을 복사하여 아래에 붙여넣기</li>
            </ol>
            <p class="text-amber-700 bg-amber-50 px-3 py-2 rounded-lg mt-2">⚠️ 이 설정은 선택사항입니다. Google Drive 연동이 필요한 경우에만 설정하세요.</p>
          </div>
          <div class="p-6">
            <label class="text-xs font-semibold text-gray-600 block mb-1">Apps Script 웹앱 URL</label>
            <input v-model="form.appsScriptUrl" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono" placeholder="https://script.google.com/macros/s/.../exec">
          </div>
        </section>

        <!-- 4. 문서 분류 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">📂 문서 분류 시스템</h2>
            <button @click="toggleGuide('cat')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.cat ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>
          <div v-if="guideOpen.cat" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 문서 분류 설정 안내</p>
            <ul class="list-disc list-inside space-y-1 text-blue-700">
              <li>수신 공문을 분류하기 위한 <strong>카테고리 목록</strong>을 설정합니다.</li>
              <li>문서 접수 시 해당 분류를 선택하게 됩니다.</li>
              <li>기본 분류가 제공되며, 시설 특성에 맞게 추가/수정할 수 있습니다.</li>
              <li>나중에 <strong>설정 메뉴</strong>에서 언제든 변경 가능합니다.</li>
            </ul>
          </div>
          <div class="p-6">
            <div class="space-y-2 mb-4">
              <div v-for="(cat, idx) in form.categories" :key="idx" class="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                <input v-model="cat.name" class="flex-1 bg-transparent text-sm font-medium text-gray-800 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1" placeholder="분류명">
                <button @click="form.categories.splice(idx, 1)" class="text-red-400 hover:text-red-600 text-xs font-semibold transition">삭제</button>
              </div>
            </div>
            <button @click="addCategory" class="text-blue-600 text-sm font-semibold hover:text-blue-800 transition">+ 새 분류 추가</button>
          </div>
        </section>

        <!-- 5. 결재 검토 흐름 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">🔄 결재 검토 흐름</h2>
            <button @click="toggleGuide('review')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.review ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>
          <div v-if="guideOpen.review" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 결재 검토 흐름 안내</p>
            <ul class="list-disc list-inside space-y-1 text-blue-700">
              <li>문서가 접수되면 <strong>담당자 배정 → 1차 검토 → 2차 검토 → 최종 검토</strong> 순서로 진행됩니다.</li>
              <li>각 단계의 <strong>직책명, 이메일, 이름</strong>을 입력합니다.</li>
              <li>검토자의 이메일은 <strong>사용자 관리에서 등록한 계정 이메일</strong>과 동일해야 합니다.</li>
              <li>검토 단계는 나중에 설정에서 수정할 수 있으며, 사용자 등록 후 설정하셔도 됩니다.</li>
            </ul>
          </div>
          <div class="p-6 space-y-4">
            <div v-for="(step, idx) in form.reviewSteps" :key="idx" class="flex items-center gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
              <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">{{ step.level }}</div>
              <div class="flex-1 space-y-2">
                <input v-model="step.label" class="w-full bg-transparent font-medium text-sm text-gray-800 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1" placeholder="직책 예: 1차 검토자">
                <input v-model="step.email" class="w-full bg-transparent text-sm text-gray-600 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1" placeholder="이메일 (사용자 등록 후 입력 가능)">
                <input v-model="step.name" class="w-full bg-transparent text-sm text-gray-600 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1" placeholder="직원명">
              </div>
            </div>
          </div>
        </section>

        <!-- 완료 버튼 -->
        <div class="pt-4">
          <button @click="completeSetup" :disabled="!form.orgName || saving" class="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/20 active:scale-[0.98]">
            {{ saving ? '설정 저장 중...' : '✅ 초기설정 완료' }}
          </button>
          <p class="text-xs text-center text-gray-400 mt-3">Slack, Apps Script 설정은 선택사항이며 나중에 설정 메뉴에서 변경할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, setDoc } from 'firebase/firestore'
import { useSettingsStore } from '../store/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const saving = ref(false)
const testingSlack = ref(false)
const slackTestResult = ref(null)

const guideOpen = reactive({
  org: true,   // 첫 설정이므로 기본 열림
  slack: false,
  gas: false,
  cat: false,
  review: false
})

const form = reactive({
  orgName: '',
  facilityType: '',
  slackWebhookUrl: '',
  appsScriptUrl: '',
  categories: [
    { code: 'CAT1', name: '사무', active: true },
    { code: 'CAT2', name: '간호/의료', active: true },
    { code: 'CAT3', name: '생활지원', active: true }
  ],
  reviewSteps: [
    { level: 1, label: '1차 검토자', email: '', name: '' },
    { level: 2, label: '2차 검토자', email: '', name: '' },
    { level: 3, label: '최종 검토자', email: '', name: '' }
  ]
})

const toggleGuide = (key) => {
  guideOpen[key] = !guideOpen[key]
}

const addCategory = () => {
  form.categories.push({
    code: 'CAT' + Date.now().toString().slice(-4),
    name: '',
    active: true
  })
}

const testSlack = async () => {
  testingSlack.value = true
  slackTestResult.value = null
  try {
    const res = await fetch(form.slackWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '🔔 공문서 관리 시스템 Slack 연동 테스트 메시지입니다.' }),
      mode: 'no-cors'
    })
    slackTestResult.value = { ok: true, message: '✅ 테스트 메시지가 전송되었습니다. Slack 채널을 확인하세요.' }
  } catch (e) {
    slackTestResult.value = { ok: false, message: '❌ 전송 실패. Webhook URL을 확인하세요.' }
  } finally {
    testingSlack.value = false
  }
}

const completeSetup = async () => {
  if (!form.orgName.trim()) {
    alert('시설명은 필수 입력 항목입니다.')
    return
  }

  saving.value = true
  try {
    // 1. 기관 정보 저장
    await setDoc(doc(db, 'settings', 'orgInfo'), {
      name: form.orgName.trim(),
      facilityType: form.facilityType,
      slackWebhookUrl: form.slackWebhookUrl.trim(),
      appsScriptUrl: form.appsScriptUrl.trim(),
      isInitialized: true,
      initializedAt: new Date()
    })

    // 2. 문서 분류 저장
    const validCategories = form.categories.filter(c => c.name.trim())
    if (validCategories.length > 0) {
      await setDoc(doc(db, 'settings', 'categories'), { items: validCategories })
    }

    // 3. 결재 흐름 저장
    await setDoc(doc(db, 'settings', 'reviewFlow'), { steps: form.reviewSteps })

    // 4. 스토어 갱신
    await settingsStore.loadSettings()

    alert('✅ 초기설정이 완료되었습니다!\n이제 시스템을 사용할 수 있습니다.')
    router.push('/')
  } catch (e) {
    console.error(e)
    alert('설정 저장 중 오류가 발생했습니다.')
  } finally {
    saving.value = false
  }
}
</script>

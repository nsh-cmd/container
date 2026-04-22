<template>
  <div class="p-8 pb-20 max-w-4xl mx-auto">
    <header class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">환경 설정</h1>
      <p class="text-sm text-gray-500 mt-1">시스템 기본 정보와 문서 결재 흐름을 관리하세요.</p>
    </header>

    <div class="space-y-6">
      
      <!-- 기관 정보 설정 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 class="font-bold text-gray-800">🏢 기관 정보</h2>
          <button @click="guideOpen.org = !guideOpen.org" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
            📖 <span>{{ guideOpen.org ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
          </button>
        </div>
        <div v-if="guideOpen.org" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-1">
          <p class="font-semibold">📋 설정 안내</p>
          <ul class="list-disc list-inside space-y-1 text-blue-700">
            <li><strong>시설명</strong>은 사이드바, 로그인 화면 등 앱 전체에 표시됩니다.</li>
            <li><strong>시설 유형</strong>은 분류 참고용이며 향후 통계에 활용될 수 있습니다.</li>
          </ul>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex gap-4">
            <div class="flex-1">
              <label class="text-xs font-semibold text-gray-600 block mb-1">시설명</label>
              <input v-model="orgName" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="시설명을 입력하세요">
            </div>
            <div class="flex-1">
              <label class="text-xs font-semibold text-gray-600 block mb-1">시설 유형</label>
              <select v-model="facilityType" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">선택하세요</option>
                <option value="장애인거주시설">장애인거주시설</option>
                <option value="노인요양시설">노인요양시설</option>
                <option value="아동복지시설">아동복지시설</option>
                <option value="사회복지관">사회복지관</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
          <button @click="saveOrgInfo" class="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">저장</button>
        </div>
      </section>

      <!-- Slack 연동 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 class="font-bold text-gray-800">💬 Slack 알림 연동</h2>
          <button @click="guideOpen.slack = !guideOpen.slack" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
            📖 <span>{{ guideOpen.slack ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
          </button>
        </div>
        <div v-if="guideOpen.slack" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
          <p class="font-semibold">📋 Slack Webhook 설정 방법</p>
          <ol class="list-decimal list-inside space-y-1 text-blue-700">
            <li><a href="https://api.slack.com/apps" target="_blank" class="underline font-semibold">Slack API 사이트</a>에 접속 → <strong>Create New App</strong></li>
            <li><strong>From scratch</strong> → 앱 이름 입력 → 워크스페이스 선택</li>
            <li>좌측 <strong>Incoming Webhooks</strong> → <strong>Activate</strong> 토글 ON</li>
            <li><strong>Add New Webhook to Workspace</strong> → 채널 선택</li>
            <li>생성된 <strong>Webhook URL</strong>을 복사하여 아래에 붙여넣기</li>
          </ol>
        </div>
        <div class="p-6">
          <label class="text-xs font-semibold text-gray-600 block mb-1">Slack Webhook URL</label>
          <div class="flex gap-2">
            <input v-model="slackWebhookUrl" class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="https://hooks.slack.com/services/...">
            <button @click="testSlack" :disabled="!slackWebhookUrl || testingSlack" class="bg-purple-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition whitespace-nowrap">
              {{ testingSlack ? '전송 중...' : '테스트' }}
            </button>
            <button @click="saveSlack" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">저장</button>
          </div>
          <p v-if="slackTestResult" class="text-xs mt-2" :class="slackTestResult.ok ? 'text-green-600' : 'text-red-500'">{{ slackTestResult.message }}</p>
        </div>
      </section>

      <!-- Apps Script 연동 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <h2 class="font-bold text-gray-800">📜 Google Apps Script 연동</h2>
          <button @click="guideOpen.gas = !guideOpen.gas" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
            📖 <span>{{ guideOpen.gas ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
          </button>
        </div>
        <div v-if="guideOpen.gas" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
          <p class="font-semibold">📋 Apps Script 웹앱 URL 설정 방법</p>
          <ol class="list-decimal list-inside space-y-1 text-blue-700">
            <li><a href="https://script.google.com" target="_blank" class="underline font-semibold">Google Apps Script</a> → <strong>새 프로젝트</strong></li>
            <li>공문서 관리 스크립트 작성 (Drive 연동 등)</li>
            <li><strong>배포 > 새 배포</strong> → 유형: <strong>웹 앱</strong></li>
            <li>실행 권한: <strong>나</strong>, 액세스: <strong>모든 사용자</strong></li>
            <li>생성된 웹앱 URL을 아래에 입력</li>
          </ol>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Google Drive 첨부파일 폴더 ID</label>
            <div class="flex gap-2">
              <input v-model="driveFolderId" class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="예: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ">
              <button @click="saveDriveFolderId" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">저장</button>
            </div>
            <p class="text-[11px] text-gray-400 mt-1">Google Drive 폴더 URL에서 folders/ 뒤의 문자열을 입력하세요.</p>
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">Apps Script 웹앱 URL</label>
            <div class="flex gap-2">
              <input v-model="appsScriptUrl" class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="https://script.google.com/macros/s/.../exec">
              <button @click="saveAppsScript" class="bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">저장</button>
            </div>
          </div>
        </div>
      </section>

      <!-- 카테고리 관리 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <div class="flex items-center gap-4">
            <h2 class="font-bold text-gray-800">📂 문서 분류 시스템</h2>
            <button @click="guideOpen.cat = !guideOpen.cat" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.cat ? '닫기' : '매뉴얼' }}</span>
            </button>
          </div>
          <button @click="addCategory" class="text-blue-600 text-sm font-semibold hover:text-blue-800">+ 새 분류 추가</button>
        </div>
        <div v-if="guideOpen.cat" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-1">
          <p class="font-semibold">📋 문서 분류 안내</p>
          <ul class="list-disc list-inside space-y-1 text-blue-700">
            <li>수신 공문을 분류하기 위한 카테고리 목록입니다.</li>
            <li>비활성화된 분류는 접수 시 선택지에서 제외됩니다.</li>
          </ul>
        </div>
        <div class="p-6">
          <div class="space-y-2">
            <div v-for="(cat, idx) in categories" :key="cat.code" class="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium text-gray-800">{{ cat.name }}</span>
                <span class="text-xs text-gray-400 font-mono">{{ cat.code }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold" :class="cat.active ? 'text-green-600' : 'text-gray-400'">{{ cat.active ? '활성' : '비활성' }}</span>
                <button @click="cat.active = !cat.active" class="text-xs font-medium text-gray-500 hover:text-gray-900 underline underline-offset-2">전환</button>
              </div>
            </div>
          </div>
          <button @click="saveCategories" class="mt-4 w-full bg-blue-50 text-blue-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-100 transition">분류 저장 업데이트</button>
        </div>
      </section>

      <!-- 결재 검토자 흐름 관리 -->
      <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
          <div class="flex items-center gap-4">
            <h2 class="font-bold text-gray-800">🔄 결재 검토 흐름</h2>
            <button @click="guideOpen.review = !guideOpen.review" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.review ? '닫기' : '매뉴얼' }}</span>
            </button>
          </div>
        </div>
        <div v-if="guideOpen.review" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-1">
          <p class="font-semibold">📋 검토 흐름 안내</p>
          <ul class="list-disc list-inside space-y-1 text-blue-700">
            <li>문서 접수 후 <strong>담당자 배정 → 1차 → 2차 → 최종 검토</strong> 순서입니다.</li>
            <li>각 검토자의 이메일은 <strong>사용자 관리에서 등록한 계정</strong>과 동일해야 합니다.</li>
          </ul>
        </div>
        <div class="p-6 space-y-4">
          <p class="text-xs text-gray-500 font-medium">문서는 등록 후 배정자를 거쳐 아래의 기본 3차례 검토자를 순차 또는 병렬로 거치게 됩니다.</p>
          <div v-for="(step, idx) in reviewSteps" :key="idx" class="flex items-center gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">{{ step.level }}</div>
            <div class="flex-1 space-y-2">
              <input v-model="step.label" class="w-full bg-transparent font-medium text-sm text-gray-800 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1 placeholder-gray-400" placeholder="직책 예: 1차 검토자">
              <input v-model="step.email" class="w-full bg-transparent text-sm text-gray-600 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1 placeholder-gray-400" placeholder="사용자 이메일">
              <input v-model="step.name" class="w-full bg-transparent text-sm text-gray-600 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1" placeholder="직원명">
            </div>
          </div>
          <button @click="saveReviewSteps" class="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm mt-2">흐름 설정 저장</button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { db } from '../firebase/config'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useSettingsStore } from '../store/settings'

const settingsStore = useSettingsStore()

const orgName = ref('')
const facilityType = ref('')
const slackWebhookUrl = ref('')
const appsScriptUrl = ref('')
const driveFolderId = ref('')
const testingSlack = ref(false)
const slackTestResult = ref(null)

const guideOpen = reactive({
  org: false,
  slack: false,
  gas: false,
  cat: false,
  review: false
})

const categories = ref([
  { code: 'CAT1', name: '사무', active: true },
  { code: 'CAT2', name: '간호/의료', active: true }
])
const reviewSteps = ref([
  { level: 1, label: '1차 검토자', email: '', name: '' },
  { level: 2, label: '2차 검토자', email: '', name: '' },
  { level: 3, label: '최종 검토자', email: '', name: '' }
])

const loadSettings = async () => {
  try {
    const orgSnap = await getDoc(doc(db, 'settings', 'orgInfo'))
    if (orgSnap.exists()) {
      const data = orgSnap.data()
      orgName.value = data.name || ''
      facilityType.value = data.facilityType || ''
      slackWebhookUrl.value = data.slackWebhookUrl || ''
      appsScriptUrl.value = data.appsScriptUrl || ''
      driveFolderId.value = data.driveFolderId || ''
    }

    const catSnap = await getDoc(doc(db, 'settings', 'categories'))
    if (catSnap.exists() && catSnap.data().items) {
      categories.value = catSnap.data().items
    }

    const flowSnap = await getDoc(doc(db, 'settings', 'reviewFlow'))
    if (flowSnap.exists() && flowSnap.data().steps) {
      reviewSteps.value = flowSnap.data().steps
    }
  } catch(e) {
    console.error(e)
  }
}

const saveOrgInfo = async () => {
  const orgRef = doc(db, 'settings', 'orgInfo')
  const snap = await getDoc(orgRef)
  const existing = snap.exists() ? snap.data() : {}
  await setDoc(orgRef, {
    ...existing,
    name: orgName.value,
    facilityType: facilityType.value
  })
  // 전역 스토어 갱신
  await settingsStore.loadSettings()
  alert('기관 정보 저장 완료')
}

const saveSlack = async () => {
  const orgRef = doc(db, 'settings', 'orgInfo')
  const snap = await getDoc(orgRef)
  const existing = snap.exists() ? snap.data() : {}
  await setDoc(orgRef, {
    ...existing,
    slackWebhookUrl: slackWebhookUrl.value.trim()
  })
  await settingsStore.loadSettings()
  alert('Slack 설정 저장 완료')
}

const testSlack = async () => {
  testingSlack.value = true
  slackTestResult.value = null
  try {
    await fetch(slackWebhookUrl.value, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '🔔 공문서 관리 시스템 Slack 연동 테스트 메시지입니다.' }),
      mode: 'no-cors'
    })
    slackTestResult.value = { ok: true, message: '✅ 테스트 메시지 전송됨. Slack 채널을 확인하세요.' }
  } catch (e) {
    slackTestResult.value = { ok: false, message: '❌ 전송 실패. URL을 확인하세요.' }
  } finally {
    testingSlack.value = false
  }
}

const saveAppsScript = async () => {
  const orgRef = doc(db, 'settings', 'orgInfo')
  const snap = await getDoc(orgRef)
  const existing = snap.exists() ? snap.data() : {}
  await setDoc(orgRef, {
    ...existing,
    appsScriptUrl: appsScriptUrl.value.trim()
  })
  await settingsStore.loadSettings()
  alert('Apps Script URL 저장 완료')
}

const saveDriveFolderId = async () => {
  const orgRef = doc(db, 'settings', 'orgInfo')
  const snap = await getDoc(orgRef)
  const existing = snap.exists() ? snap.data() : {}
  await setDoc(orgRef, {
    ...existing,
    driveFolderId: driveFolderId.value.trim()
  })
  await settingsStore.loadSettings()
  alert('Drive 폴더 ID 저장 완료')
}

const addCategory = () => {
  const name = prompt('새로운 문서 분류명을 입력하세요:')
  if(name) {
    categories.value.push({
      code: 'CAT' + Date.now().toString().slice(-4),
      name,
      active: true
    })
  }
}

const saveCategories = async () => {
  await setDoc(doc(db, 'settings', 'categories'), { items: categories.value })
  alert('분류 저장 완료')
}

const saveReviewSteps = async () => {
  await setDoc(doc(db, 'settings', 'reviewFlow'), { steps: reviewSteps.value })
  alert('흐름 저장 완료')
}

onMounted(() => {
  loadSettings()
})
</script>

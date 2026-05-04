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

        <!-- 0. Firebase 연결 확인 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">🔥 Firebase 연결 설정</h2>
            <button @click="toggleGuide('firebase')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.firebase ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>
          <div v-if="guideOpen.firebase" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 Firebase 설정 안내</p>
            <ol class="list-decimal list-inside space-y-1 text-blue-700">
              <li><a href="https://console.firebase.google.com" target="_blank" class="underline font-semibold">Firebase Console</a>에 접속 → 프로젝트 선택 또는 새 프로젝트 생성</li>
              <li>좌측 메뉴 <strong>프로젝트 설정</strong>(⚙️) → <strong>일반</strong> 탭 → 하단 <strong>내 앱</strong> 영역</li>
              <li>웹 앱이 없으면 <strong>&lt;/&gt;</strong> 아이콘으로 웹 앱 추가</li>
              <li><strong>firebaseConfig</strong> 객체의 각 값을 프로젝트 루트의 <code class="bg-blue-100 px-1 rounded">.env.local</code> 파일에 입력</li>
              <li>좌측 <strong>빌드 → Authentication</strong>에서 <strong>이메일/비밀번호</strong> 로그인 활성화</li>
              <li>좌측 <strong>빌드 → Firestore Database</strong>에서 데이터베이스 생성</li>
            </ol>
            <div class="bg-amber-50 text-amber-800 px-3 py-2 rounded-lg mt-2 space-y-1">
              <p class="font-semibold">📄 .env.local 파일 형식:</p>
              <pre class="bg-amber-100/50 px-3 py-2 rounded text-[11px] font-mono leading-relaxed overflow-x-auto">VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef</pre>
              <p>⚠️ <code class="bg-amber-100 px-1 rounded">.env.local</code> 수정 후에는 <strong>서버를 재시작</strong>해야 반영됩니다.</p>
            </div>
          </div>
          <div class="p-6 space-y-4">
            <!-- 현재 연결된 Firebase 프로젝트 정보 -->
            <div class="space-y-3">
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-gray-500 w-36 shrink-0">Project ID</span>
                <span class="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 truncate">{{ firebaseInfo.projectId || '미설정' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-gray-500 w-36 shrink-0">Auth Domain</span>
                <span class="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 truncate">{{ firebaseInfo.authDomain || '미설정' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-gray-500 w-36 shrink-0">API Key</span>
                <span class="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 truncate">{{ firebaseInfo.apiKeyMasked || '미설정' }}</span>
              </div>
              <div class="flex items-center gap-3">
                <span class="text-xs font-semibold text-gray-500 w-36 shrink-0">Storage Bucket</span>
                <span class="text-sm font-mono text-gray-800 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 truncate">{{ firebaseInfo.storageBucket || '미설정' }}</span>
              </div>
            </div>

            <!-- 연결 상태 -->
            <div class="flex items-center gap-3 pt-2">
              <button @click="testFirebase" :disabled="testingFirebase" class="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition whitespace-nowrap">
                {{ testingFirebase ? '연결 확인 중...' : '🔌 연결 테스트' }}
              </button>
              <div v-if="firebaseTestResult" class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="firebaseTestResult.ok ? 'bg-green-500' : 'bg-red-500'"></span>
                <span class="text-xs font-semibold" :class="firebaseTestResult.ok ? 'text-green-600' : 'text-red-500'">{{ firebaseTestResult.message }}</span>
              </div>
            </div>

            <!-- 미설정 경고 -->
            <div v-if="!firebaseInfo.projectId" class="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
              ⚠️ Firebase 설정이 감지되지 않았습니다. 프로젝트 루트에 <strong>.env.local</strong> 파일을 생성하고 Firebase 설정값을 입력한 후 서버를 재시작해 주세요.
            </div>
          </div>
        </section>

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

        <!-- 3. Apps Script 연동 (Google Drive 첨부파일 관리) -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <h2 class="font-bold text-gray-800">📜 Google Apps Script 연동</h2>
            <button @click="toggleGuide('gas')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition">
              📖 <span>{{ guideOpen.gas ? '매뉴얼 닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>

          <!-- 매뉴얼 (접이식) -->
          <div v-if="guideOpen.gas" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-4">

            <!-- STEP 1: Google Drive 폴더 준비 -->
            <div>
              <p class="font-semibold text-sm mb-2">📁 STEP 1. Google Drive 폴더 준비</p>
              <ol class="list-decimal list-inside space-y-1 text-blue-700">
                <li><a href="https://drive.google.com" target="_blank" class="underline font-semibold">Google Drive</a>에서 첨부파일 저장용 폴더를 생성합니다.</li>
                <li>생성된 폴더를 열고 URL에서 <strong>폴더 ID</strong>를 복사합니다.</li>
                <li>URL 형식: <code class="bg-blue-100 px-1 rounded">https://drive.google.com/drive/folders/<strong>여기가_폴더ID</strong></code></li>
              </ol>
            </div>

            <!-- STEP 2: Apps Script 프로젝트 생성 -->
            <div>
              <p class="font-semibold text-sm mb-2">⚙️ STEP 2. Apps Script 프로젝트 생성 및 코드 입력</p>
              <ol class="list-decimal list-inside space-y-1 text-blue-700">
                <li><a href="https://script.google.com" target="_blank" class="underline font-semibold">Google Apps Script</a>에 접속 → <strong>새 프로젝트</strong> 생성</li>
                <li>프로젝트 이름을 <strong>공문서관리-드라이브연동</strong> 등으로 변경</li>
                <li>기본 <code class="bg-blue-100 px-1 rounded">Code.gs</code>의 내용을 모두 삭제하고 아래의 코드를 붙여넣기</li>
              </ol>
              <div class="mt-3 relative">
                <div class="flex items-center justify-between bg-gray-800 text-gray-300 px-4 py-2 rounded-t-lg">
                  <span class="text-[11px] font-mono">Code.gs</span>
                  <button @click="copyScriptCode" class="text-[11px] bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition font-semibold">
                    {{ scriptCopied ? '✅ 복사됨!' : '📋 코드 복사' }}
                  </button>
                </div>
                <pre class="bg-gray-900 text-green-400 px-4 py-3 rounded-b-lg text-[11px] font-mono leading-relaxed overflow-x-auto max-h-80 overflow-y-auto whitespace-pre">{{ gasScriptCode }}</pre>
              </div>
            </div>

            <!-- STEP 3: 스크립트 속성 설정 -->
            <div>
              <p class="font-semibold text-sm mb-2">🔧 STEP 3. 스크립트 속성 설정 (중요!)</p>
              <p class="text-blue-700 mb-2">코드에는 폴더 ID, Slack URL 등이 하드코딩되어 있지 않습니다.<br><strong>스크립트 속성</strong>에 아래 값들을 설정해야 합니다.</p>
              <ol class="list-decimal list-inside space-y-1 text-blue-700">
                <li>Apps Script 편집기 좌측 메뉴에서 <strong>⚙️ 프로젝트 설정</strong> 클릭</li>
                <li>하단 <strong>스크립트 속성</strong> 영역에서 <strong>스크립트 속성 추가</strong> 클릭</li>
                <li>아래 표의 속성을 하나씩 추가합니다:</li>
              </ol>
              <div class="mt-3 bg-white rounded-lg border border-blue-200 overflow-hidden">
                <table class="w-full text-[11px]">
                  <thead>
                    <tr class="bg-blue-100 text-blue-900">
                      <th class="px-3 py-2 text-left font-bold">속성 이름</th>
                      <th class="px-3 py-2 text-left font-bold">값 (예시)</th>
                      <th class="px-3 py-2 text-left font-bold">설명</th>
                    </tr>
                  </thead>
                  <tbody class="text-blue-800">
                    <tr class="border-t border-blue-100">
                      <td class="px-3 py-2 font-mono font-semibold">DRIVE_FOLDER_ID</td>
                      <td class="px-3 py-2 font-mono">1aBcDeFgHiJ...</td>
                      <td class="px-3 py-2">첨부파일 저장 Google Drive 폴더 ID</td>
                    </tr>
                    <tr class="border-t border-blue-100 bg-blue-50/30">
                      <td class="px-3 py-2 font-mono font-semibold">SLACK_WEBHOOK_URL</td>
                      <td class="px-3 py-2 font-mono">https://hooks.slack.com/...</td>
                      <td class="px-3 py-2">Slack 알림 Webhook URL (선택)</td>
                    </tr>
                    <tr class="border-t border-blue-100">
                      <td class="px-3 py-2 font-mono font-semibold">ORG_NAME</td>
                      <td class="px-3 py-2 font-mono">동행빌리지</td>
                      <td class="px-3 py-2">Slack 알림에 표시할 기관명 (선택)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- STEP 4: 배포 -->
            <div>
              <p class="font-semibold text-sm mb-2">🚀 STEP 4. 웹앱으로 배포</p>
              <ol class="list-decimal list-inside space-y-1 text-blue-700">
                <li>상단 메뉴 <strong>배포 → 새 배포</strong> 클릭</li>
                <li>좌측 ⚙️ 아이콘 → 유형 선택: <strong>웹 앱</strong></li>
                <li>설명: <code class="bg-blue-100 px-1 rounded">v1 - 초기 배포</code> 등 입력</li>
                <li><strong>실행 주체</strong>: <code class="bg-blue-100 px-1 rounded">나</code> (본인의 Google 계정)</li>
                <li><strong>액세스 권한</strong>: <code class="bg-blue-100 px-1 rounded">모든 사용자</code></li>
                <li><strong>배포</strong> 버튼 클릭 → 권한 승인</li>
                <li>생성된 <strong>웹앱 URL</strong>을 복사하여 아래 입력란에 붙여넣기</li>
              </ol>
              <div class="bg-amber-50 text-amber-800 px-3 py-2 rounded-lg mt-2 space-y-1">
                <p>⚠️ 코드를 수정한 경우 <strong>배포 → 배포 관리 → ✏️ 수정 → 새 버전</strong>으로 업데이트해야 반영됩니다.</p>
                <p>⚠️ 이 설정은 <strong>선택사항</strong>입니다. Google Drive 첨부파일 관리가 필요한 경우에만 설정하세요.</p>
              </div>
            </div>
          </div>

          <!-- 입력 필드 영역 -->
          <div class="p-6 space-y-4">
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">Google Drive 첨부파일 폴더 ID</label>
              <input v-model="form.driveFolderId" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono" placeholder="예: 1aBcDeFgHiJkLmNoPqRsTuVwXyZ">
              <p class="text-[11px] text-gray-400 mt-1">Google Drive 폴더 URL에서 folders/ 뒤의 문자열을 입력하세요.</p>
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">Apps Script 웹앱 URL</label>
              <input v-model="form.appsScriptUrl" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition font-mono" placeholder="https://script.google.com/macros/s/.../exec">
            </div>
          </div>
        </section>



        <!-- 완료 버튼 -->
        <div class="pt-4">
          <button @click="completeSetup" :disabled="!form.orgName || saving" class="w-full bg-blue-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-500/20 active:scale-[0.98]">
            {{ saving ? '설정 저장 중...' : '✅ 초기설정 완료' }}
          </button>
          <p class="text-xs text-center text-gray-400 mt-3">Slack, Apps Script 설정은 선택사항이며 나중에 설정 메뉴에서 변경할 수 있습니다.</p>
          <p class="text-xs text-center text-gray-400 mt-1">문서 분류 및 결재 검토 흐름은 설정 메뉴에서 구성할 수 있습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { db } from '../firebase/config'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useSettingsStore } from '../store/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const saving = ref(false)
const testingSlack = ref(false)
const slackTestResult = ref(null)

const testingFirebase = ref(false)
const firebaseTestResult = ref(null)

// 현재 .env.local에서 로드된 Firebase 설정 정보
const firebaseInfo = reactive({
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  apiKeyMasked: import.meta.env.VITE_FIREBASE_API_KEY
    ? import.meta.env.VITE_FIREBASE_API_KEY.slice(0, 10) + '••••••••••'
    : ''
})

const guideOpen = reactive({
  firebase: true,  // Firebase 설정 안내를 기본 열림
  org: false,
  slack: false,
  gas: false
})

const form = reactive({
  orgName: '',
  facilityType: '',
  slackWebhookUrl: '',
  appsScriptUrl: '',
  driveFolderId: ''
})

// Apps Script 코드 (PropertiesService 기반 — 하드코딩 없음)
const scriptCopied = ref(false)
const gasScriptCode = `/**
 * 공문서 관리 시스템 — Google Drive 첨부파일 업로드 & Slack 알림
 * ⚙️ 스크립트 속성(프로젝트 설정)에서 아래 값을 설정하세요:
 *   - DRIVE_FOLDER_ID : 첨부파일 저장 폴더 ID
 *   - SLACK_WEBHOOK_URL : Slack 알림 URL (선택)
 *   - ORG_NAME : 기관명 (선택, Slack 메시지용)
 */

// ── 스크립트 속성에서 설정값 불러오기 ──
function getConfig(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || '';
}

// ── POST 요청 수신 (웹앱 엔드포인트) ──
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'upload';

    let result;
    switch (action) {
      case 'upload':
        result = handleFileUpload(data);
        break;
      case 'notify':
        result = sendSlackNotification(data);
        break;
      default:
        result = { success: false, message: '알 수 없는 action: ' + action };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── GET 요청 (헬스체크용) ──
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: '공문서 관리 Apps Script가 정상 작동 중입니다.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── 파일 업로드 처리 ──
function handleFileUpload(data) {
  const folderId = getConfig('DRIVE_FOLDER_ID');
  if (!folderId) {
    return { success: false, message: 'DRIVE_FOLDER_ID 스크립트 속성이 설정되지 않았습니다.' };
  }

  const folder = DriveApp.getFolderById(folderId);
  const fileName = data.fileName || '첨부파일_' + new Date().getTime();
  const fileData = Utilities.base64Decode(data.fileBase64);
  const mimeType = data.mimeType || 'application/octet-stream';
  const blob = Utilities.newBlob(fileData, mimeType, fileName);

  // 문서번호별 하위 폴더 생성 (선택)
  let targetFolder = folder;
  if (data.receiptNo) {
    const subFolders = folder.getFoldersByName(data.receiptNo);
    targetFolder = subFolders.hasNext()
      ? subFolders.next()
      : folder.createFolder(data.receiptNo);
  }

  const file = targetFolder.createFile(blob);
  file.setSharing(
    DriveApp.Access.ANYONE_WITH_LINK,
    DriveApp.Permission.VIEW
  );

  // Slack 알림 (선택)
  const slackUrl = getConfig('SLACK_WEBHOOK_URL');
  if (slackUrl && data.receiptNo) {
    const orgName = getConfig('ORG_NAME') || '공문서 관리';
    sendSlack(slackUrl, ':file_folder: *[' + orgName + '] 첨부파일 업로드*\\n'
      + '> 문서번호: ' + data.receiptNo + '\\n'
      + '> 파일명: ' + fileName + '\\n'
      + '> <' + file.getUrl() + '|Drive에서 보기>');
  }

  return {
    success: true,
    fileId: file.getId(),
    fileUrl: file.getUrl(),
    fileName: file.getName(),
    folderId: targetFolder.getId()
  };
}

// ── Slack 알림 전송 ──
function sendSlackNotification(data) {
  const slackUrl = getConfig('SLACK_WEBHOOK_URL');
  if (!slackUrl) {
    return { success: false, message: 'SLACK_WEBHOOK_URL 스크립트 속성이 설정되지 않았습니다.' };
  }
  const orgName = getConfig('ORG_NAME') || '공문서 관리';
  const text = data.text || ':bell: *[' + orgName + ']* 새 알림이 있습니다.';
  sendSlack(slackUrl, text);
  return { success: true };
}

// ── Slack 전송 헬퍼 ──
function sendSlack(webhookUrl, text) {
  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text })
  });
}`

const copyScriptCode = async () => {
  try {
    await navigator.clipboard.writeText(gasScriptCode)
    scriptCopied.value = true
    setTimeout(() => { scriptCopied.value = false }, 2000)
  } catch {
    // fallback
    const ta = document.createElement('textarea')
    ta.value = gasScriptCode
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
    scriptCopied.value = true
    setTimeout(() => { scriptCopied.value = false }, 2000)
  }
}

const testFirebase = async () => {
  testingFirebase.value = true
  firebaseTestResult.value = null
  try {
    // Firestore에 간단한 읽기 시도로 연결 확인
    await getDoc(doc(db, 'settings', 'orgInfo'))
    firebaseTestResult.value = { ok: true, message: 'Firestore 연결 성공! 정상적으로 작동합니다.' }
  } catch (e) {
    console.error('Firebase 연결 테스트 실패:', e)
    if (e.code === 'permission-denied') {
      firebaseTestResult.value = { ok: true, message: 'Firebase 연결됨 (보안 규칙에 의해 접근 제한 — 정상)' }
    } else {
      firebaseTestResult.value = { ok: false, message: `연결 실패: ${e.message}` }
    }
  } finally {
    testingFirebase.value = false
  }
}

const toggleGuide = (key) => {
  guideOpen[key] = !guideOpen[key]
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
      driveFolderId: form.driveFolderId.trim(),
      isInitialized: true,
      initializedAt: new Date()
    })


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

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
        <div class="p-6 border-b border-gray-50">
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

        <!-- 슬랙 알림 메시지 템플릿 에디터 -->
        <div class="p-6 bg-gray-50/30">
          <label class="text-sm font-bold text-gray-800 block mb-3">알림 메시지 템플릿 설정</label>
          
          <div class="flex flex-col lg:flex-row gap-6">
            <div class="flex-1 space-y-3">
              <div class="flex flex-wrap gap-2">
                <button @click="insertVariable('{title}')" class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-blue-600 hover:bg-blue-50 transition">+ {title}</button>
                <button @click="insertVariable('{receiptNo}')" class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-blue-600 hover:bg-blue-50 transition">+ {receiptNo}</button>
                <button @click="insertVariable('{assigneeName}')" class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-blue-600 hover:bg-blue-50 transition">+ {assigneeName}</button>
                <button @click="insertVariable('{senderOrg}')" class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-blue-600 hover:bg-blue-50 transition">+ {senderOrg}</button>
                <button @click="insertVariable('{attachments}')" class="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono text-blue-600 hover:bg-blue-50 transition">+ {attachments}</button>
              </div>
              <textarea v-model="slackTemplate" ref="slackTemplateInput" rows="5" class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono" placeholder="템플릿을 입력하세요..."></textarea>
            </div>
            
            <div class="flex-1">
              <p class="text-xs font-semibold text-gray-500 mb-2">👀 미리보기</p>
              <div class="bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-full whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                {{ previewSlackMessage }}
              </div>
            </div>
          </div>
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
        <div v-if="guideOpen.gas" class="border-b border-blue-100 text-xs text-blue-800 leading-relaxed">
          <!-- 설정 순서 -->
          <div class="px-6 py-4 bg-blue-50/50 space-y-3">
            <p class="font-bold text-sm text-blue-900">📋 설정 순서</p>
            <ol class="list-decimal list-inside space-y-2 text-blue-700">
              <li><a href="https://script.google.com" target="_blank" class="underline font-semibold">script.google.com</a> 접속 → <strong>새 프로젝트</strong> 생성</li>
              <li>아래 <strong>전체 스크립트 코드</strong>를 복사하여 편집기에 붙여넣기</li>
              <li>상단 <strong>프로젝트 설정(⚙️)</strong> → <strong>스크립트 속성</strong> 탭에서 속성 추가:
                <div class="mt-1.5 ml-4 space-y-1 font-mono bg-white border border-blue-100 rounded-lg px-3 py-2">
                  <div><span class="text-blue-600 font-bold">DRIVE_FOLDER_ID</span> = Google Drive 폴더 ID <span class="text-blue-400">(필수)</span></div>
                  <div><span class="text-blue-600 font-bold">SLACK_WEBHOOK_URL</span> = Slack Webhook URL <span class="text-blue-400">(선택)</span></div>
                  <div><span class="text-blue-600 font-bold">ORG_NAME</span> = 기관명 <span class="text-blue-400">(선택)</span></div>
                </div>
              </li>
              <li><strong>배포 → 새 배포</strong> 클릭 → 유형: <strong>웹 앱</strong> 선택</li>
              <li>실행 권한: <strong>나(Me)</strong> / 액세스: <strong>모든 사용자(Anyone)</strong></li>
              <li>배포 후 생성된 URL을 아래 <strong>Apps Script 웹앱 URL</strong> 입력란에 저장</li>
              <li class="text-blue-500">⚠️ 스크립트 수정 후에는 반드시 <strong>새 버전으로 재배포</strong>해야 변경사항이 적용됩니다.</li>
            </ol>
          </div>

          <!-- 스크립트 코드 박스 -->
          <div class="px-6 py-4 bg-gray-50 space-y-2">
            <div class="flex items-center justify-between">
              <p class="font-bold text-gray-700">📄 스크립트 전체 코드</p>
              <button @click="copyScriptCode" class="flex items-center gap-1.5 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-[11px] font-semibold hover:bg-gray-700 transition">
                <svg v-if="!scriptCopied" class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                {{ scriptCopied ? '복사됨!' : '코드 복사' }}
              </button>
            </div>
            <pre class="bg-gray-900 text-green-300 text-[10px] rounded-xl p-4 overflow-x-auto overflow-y-auto max-h-72 leading-relaxed whitespace-pre font-mono select-all">{{ GAS_SCRIPT }}</pre>
          </div>

          <!-- 지원 액션 표 -->
          <div class="px-6 py-3 bg-blue-50/50">
            <p class="font-semibold text-blue-900 mb-1.5">⚡ 지원 액션</p>
            <table class="w-full text-[10px] border-collapse">
              <thead><tr class="bg-blue-100 text-blue-800">
                <th class="px-2 py-1 text-left rounded-tl font-bold">action</th>
                <th class="px-2 py-1 text-left font-bold">전달값</th>
                <th class="px-2 py-1 text-left rounded-tr font-bold">동작</th>
              </tr></thead>
              <tbody class="text-blue-700">
                <tr class="border-t border-blue-100"><td class="px-2 py-1 font-mono font-bold">upload</td><td class="px-2 py-1">receiptNo, fileName, fileBase64, mimeType</td><td class="px-2 py-1">접수번호 폴더 생성 후 파일 업로드</td></tr>
                <tr class="border-t border-blue-100"><td class="px-2 py-1 font-mono font-bold">deleteFile</td><td class="px-2 py-1">fileId</td><td class="px-2 py-1">파일 휴지통 이동</td></tr>
                <tr class="border-t border-blue-100"><td class="px-2 py-1 font-mono font-bold">deleteFolder</td><td class="px-2 py-1">folderId</td><td class="px-2 py-1">폴더 전체(파일 포함) 휴지통 이동</td></tr>
                <tr class="border-t border-blue-100"><td class="px-2 py-1 font-mono font-bold">notify</td><td class="px-2 py-1">text</td><td class="px-2 py-1">Slack 메시지 전송</td></tr>
              </tbody>
            </table>
          </div>
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
            <li><strong>사용자 관리</strong>에서 등록된 직원 목록에서 각 단계의 검토자를 선택합니다.</li>
            <li>검토자가 아직 등록되지 않았다면, 먼저 <strong>사용자 관리</strong>에서 직원을 추가하세요.</li>
          </ul>
        </div>
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <p class="text-xs text-gray-500 font-medium">사용자 관리에 등록된 직원 중에서 각 단계의 검토자를 선택하세요.</p>
            <span v-if="registeredUsers.length === 0" class="text-xs text-red-500 font-semibold">⚠️ 등록된 사용자가 없습니다</span>
            <span v-else class="text-xs text-gray-400">등록 직원 {{ registeredUsers.length }}명</span>
          </div>
          <div v-for="(step, idx) in reviewSteps" :key="idx" class="flex items-center gap-4 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50">
            <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">{{ step.level }}</div>
            <div class="flex-1 space-y-2">
              <input v-model="step.label" class="w-full bg-transparent font-medium text-sm text-gray-800 border-b border-gray-200 focus:outline-none focus:border-blue-500 pb-1 placeholder-gray-400" placeholder="직책 예: 1차 검토자">
              <select @change="onSelectReviewer($event, idx)" :value="step.email" class="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                <option value="">-- 검토자를 선택하세요 --</option>
                <option v-for="user in registeredUsers" :key="user.id" :value="user.email">
                  {{ user.name }} ({{ user.department || '직급 미설정' }}) — {{ user.email }}
                </option>
              </select>
              <div v-if="step.email" class="flex items-center gap-2 text-xs text-gray-500 pl-1">
                <span class="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-0.5 rounded-md font-medium">
                  ✅ {{ step.name }}
                </span>
                <span class="text-gray-400">{{ step.email }}</span>
              </div>
            </div>
          </div>
          <button @click="saveReviewSteps" class="w-full bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm mt-2">흐름 설정 저장</button>
        </div>
      </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { db } from '../firebase/config'
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore'
import { useSettingsStore } from '../store/settings'

const settingsStore = useSettingsStore()

// ── Apps Script 매뉴얼 코드 ──────────────────────────────────────────
const scriptCopied = ref(false)

const GAS_SCRIPT = `/**
 * 공문서 관리 시스템 — Google Drive 첨부파일 업로드 & Slack 알림
 * ⚙️ 스크립트 속성(프로젝트 설정 > 스크립트 속성)에서 아래 값을 설정하세요:
 *   - DRIVE_FOLDER_ID    : 첨부파일 저장 폴더 ID  (필수)
 *   - SLACK_WEBHOOK_URL  : Slack 알림 URL          (선택)
 *   - ORG_NAME           : 기관명, Slack 메시지용  (선택)
 */

function getConfig(key) {
  return PropertiesService.getScriptProperties().getProperty(key) || '';
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action || 'upload';

    let result;
    switch (action) {
      case 'upload':       result = handleFileUpload(data);      break;
      case 'deleteFile':   result = handleDeleteFile(data);      break;
      case 'deleteFolder': result = handleDeleteFolder(data);    break;
      case 'notify':       result = sendSlackNotification(data); break;
      default: result = { success: false, message: '알 수 없는 action: ' + action };
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

// ── 파일 업로드 ──────────────────────────────────────────────────────
function handleFileUpload(data) {
  const folderId = getConfig('DRIVE_FOLDER_ID');
  if (!folderId) return { success: false, message: 'DRIVE_FOLDER_ID 설정 안됨' };

  const folder = DriveApp.getFolderById(folderId);
  const fileName = data.fileName || '첨부파일_' + new Date().getTime();
  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.fileBase64),
    data.mimeType || 'application/octet-stream',
    fileName
  );

  let targetFolder = folder;
  if (data.receiptNo) {
    const iter = folder.getFoldersByName(data.receiptNo);
    targetFolder = iter.hasNext() ? iter.next() : folder.createFolder(data.receiptNo);
  }

  const file = targetFolder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const slackUrl = getConfig('SLACK_WEBHOOK_URL');
  if (slackUrl && data.receiptNo) {
    const orgName = getConfig('ORG_NAME') || '공문서 관리';
    sendSlack(slackUrl,
      ':file_folder: *[' + orgName + '] 첨부파일 업로드*\\n' +
      '> 문서번호: ' + data.receiptNo + '\\n' +
      '> 파일명: ' + fileName + '\\n' +
      '> <' + file.getUrl() + '|Drive에서 보기>'
    );
  }

  return {
    success: true,
    fileId:   file.getId(),
    fileUrl:  file.getUrl(),
    fileName: file.getName(),
    folderId: targetFolder.getId()
  };
}

// ── 파일 삭제 (휴지통 이동) ──────────────────────────────────────────
function handleDeleteFile(data) {
  if (!data.fileId) return { success: false, message: 'fileId 누락' };
  try {
    DriveApp.getFileById(data.fileId).setTrashed(true);
    return { success: true, message: '파일을 휴지통으로 이동했습니다.' };
  } catch (err) {
    return { success: false, message: '파일 삭제 실패: ' + err.message };
  }
}

// ── 폴더 삭제 (폴더 내 파일 전체 포함, 휴지통 이동) ────────────────
function handleDeleteFolder(data) {
  if (!data.folderId) return { success: false, message: 'folderId 누락' };
  try {
    DriveApp.getFolderById(data.folderId).setTrashed(true);
    return { success: true, message: '폴더를 휴지통으로 이동했습니다.' };
  } catch (err) {
    return { success: false, message: '폴더 삭제 실패: ' + err.message };
  }
}

// ── Slack 알림 ───────────────────────────────────────────────────────
function sendSlackNotification(data) {
  const slackUrl = getConfig('SLACK_WEBHOOK_URL');
  if (!slackUrl) return { success: false, message: 'SLACK_WEBHOOK_URL 설정 안됨' };
  sendSlack(slackUrl, data.text || ':bell: 새 알림이 있습니다.');
  return { success: true };
}

function sendSlack(webhookUrl, text) {
  UrlFetchApp.fetch(webhookUrl, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify({ text: text })
  });
}

// ── GET 요청 (연결 테스트) ───────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: '스크립트 정상 작동 중' }))
    .setMimeType(ContentService.MimeType.JSON);
}`

const copyScriptCode = async () => {
  try {
    await navigator.clipboard.writeText(GAS_SCRIPT)
    scriptCopied.value = true
    setTimeout(() => { scriptCopied.value = false }, 2500)
  } catch (e) {
    alert('복사 실패: 코드를 직접 선택하여 복사해 주세요.')
  }
}

// ── 일반 설정 ────────────────────────────────────────────────────────
const orgName = ref('')
const facilityType = ref('')
const slackWebhookUrl = ref('')
const slackTemplate = ref('')
const appsScriptUrl = ref('')
const driveFolderId = ref('')
const testingSlack = ref(false)
const slackTestResult = ref(null)
const slackTemplateInput = ref(null)

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
  { level: 1, label: '실장', email: '', name: '' },
  { level: 2, label: '국장', email: '', name: '' },
  { level: 3, label: '원장', email: '', name: '' }
])

// 사용자 관리에서 등록된 직원 목록
const registeredUsers = ref([])

const loadRegisteredUsers = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    registeredUsers.value = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter(u => u.active) // 활성 사용자만
  } catch (e) {
    console.error('사용자 목록 로드 실패:', e)
  }
}

// 검토자 선택 시 email/name 자동 채움
const onSelectReviewer = (event, stepIdx) => {
  const selectedEmail = event.target.value
  const step = reviewSteps.value[stepIdx]
  if (!selectedEmail) {
    step.email = ''
    step.name = ''
    return
  }
  const user = registeredUsers.value.find(u => u.email === selectedEmail)
  if (user) {
    step.email = user.email
    step.name = user.name
  }
}

const loadSettings = async () => {
  try {
    const orgSnap = await getDoc(doc(db, 'settings', 'orgInfo'))
    if (orgSnap.exists()) {
      const data = orgSnap.data()
      orgName.value = data.name || ''
      facilityType.value = data.facilityType || ''
      slackWebhookUrl.value = data.slackWebhookUrl || ''
      slackTemplate.value = data.slackTemplate || '🔔 새로운 문서가 배정되었습니다!\n- 문서제목: {title}\n- 접수번호: {receiptNo}\n- 담당자: {assigneeName}'
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
    slackWebhookUrl: slackWebhookUrl.value.trim(),
    slackTemplate: slackTemplate.value
  })
  await settingsStore.loadSettings()
  alert('Slack 설정 저장 완료')
}

const insertVariable = (variable) => {
  if (!slackTemplateInput.value) {
    slackTemplate.value += variable
    return
  }
  const el = slackTemplateInput.value
  const start = el.selectionStart
  const end = el.selectionEnd
  slackTemplate.value = slackTemplate.value.substring(0, start) + variable + slackTemplate.value.substring(end)
  
  setTimeout(() => {
    el.selectionStart = el.selectionEnd = start + variable.length
    el.focus()
  }, 10)
}

const previewSlackMessage = computed(() => {
  let text = slackTemplate.value || ''
  text = text.replace(/{title}/g, '2026년도 상반기 지침 안내')
  text = text.replace(/{receiptNo}/g, 'REC-0001')
  text = text.replace(/{assigneeName}/g, '홍길동')
  text = text.replace(/{senderOrg}/g, '보건복지부')
  text = text.replace(/{attachments}/g, '안내문.pdf, 서식.hwp')
  return text || '미리보기 텍스트가 없습니다.'
})

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
  loadRegisteredUsers()
})
</script>

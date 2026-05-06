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

        <!-- 배포 가이드 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h2 class="font-bold text-gray-800">📦 배포 가이드 (제3자 설치 매뉴얼)</h2>
              <p class="text-xs text-gray-500 mt-0.5">이 앱을 새로 설치하거나 다른 기관에 배포할 때 참고하세요.</p>
            </div>
            <button @click="toggleGuide('deploy')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition whitespace-nowrap">
              📖 <span>{{ guideOpen.deploy ? '닫기' : '매뉴얼 보기' }}</span>
            </button>
          </div>

          <div v-if="guideOpen.deploy" class="divide-y divide-gray-100 text-xs text-gray-700 leading-relaxed">

            <!-- 배포 구조 개요 -->
            <div class="px-6 py-4 bg-indigo-50/40 space-y-2">
              <p class="font-bold text-sm text-indigo-900">⚙️ 배포 구조</p>
              <p class="text-indigo-700">각 기관이 <strong>자신의 Firebase 프로젝트</strong>를 만들어 연결하는 방식입니다.<br>비용·데이터 모두 각자 부담하며, 중앙 서버나 SaaS 비용이 없습니다.</p>
              <div class="bg-white border border-indigo-100 rounded-xl px-4 py-3 font-mono text-[11px] text-indigo-800 space-y-1">
                <div>① GitHub에서 코드 받기 (git clone)</div>
                <div>② 자신의 Firebase 프로젝트 생성</div>
                <div>③ .env 파일에 Firebase 설정값 입력</div>
                <div>④ 빌드(npm run build) → 배포(firebase deploy)</div>
                <div>⑤ 앱 접속 → 이 초기설정 페이지에서 완료</div>
              </div>
              <p class="text-indigo-600 font-semibold">GitHub 주소: <a href="https://github.com/nsh-cmd/container" target="_blank" class="underline">https://github.com/nsh-cmd/container</a></p>
            </div>

            <!-- STEP 1: Node.js -->
            <div class="px-6 py-4 space-y-2">
              <p class="font-bold text-sm text-gray-800">STEP 1. Node.js 설치 확인</p>
              <p class="text-gray-600">터미널(명령 프롬프트)을 열고 아래 명령어로 설치 여부를 확인합니다.</p>
              <pre class="bg-gray-900 text-green-400 rounded-lg px-4 py-2 text-[11px] font-mono">node -v
npm -v</pre>
              <p class="text-gray-500">버전 번호가 출력되면 설치된 것입니다. <strong>v18 이상</strong>을 권장합니다.</p>
              <div class="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 space-y-2">
                <p class="font-semibold text-amber-800">⬇️ 미설치 시 설치 방법</p>
                <div class="space-y-1 text-amber-700">
                  <p><strong>Windows:</strong> <a href="https://nodejs.org" target="_blank" class="underline font-semibold">nodejs.org</a> 접속 → <strong>LTS 버전</strong> 다운로드 → .msi 설치 파일 실행 → 기본값으로 Next 클릭</p>
                  <p><strong>Mac:</strong> 터미널에서 <code class="bg-amber-100 px-1 rounded">brew install node</code> 실행 또는 위 사이트에서 .pkg 다운로드</p>
                  <p class="text-amber-600">⚠️ 설치 후 터미널을 <strong>완전히 닫았다가 다시 열어야</strong> node 명령어가 인식됩니다.</p>
                </div>
              </div>
            </div>

            <!-- STEP 2: 터미널 열기 -->
            <div class="px-6 py-4 space-y-2">
              <p class="font-bold text-sm text-gray-800">STEP 2. 터미널 열기 및 권한 안내</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="bg-blue-50 rounded-xl px-4 py-3 space-y-1">
                  <p class="font-semibold text-blue-800">🪟 Windows</p>
                  <p class="text-blue-700"><strong>방법 1</strong>: 시작 → <strong>PowerShell</strong> 검색 → 우클릭 → <strong>관리자 권한으로 실행</strong></p>
                  <p class="text-blue-700"><strong>방법 2</strong>: Win+R → <code class="bg-blue-100 px-1 rounded">cmd</code> → Enter</p>
                  <p class="text-blue-600 text-[10px]">⚠️ npm install이 권한 오류 날 경우 관리자 권한으로 실행</p>
                </div>
                <div class="bg-slate-50 rounded-xl px-4 py-3 space-y-1">
                  <p class="font-semibold text-slate-800">🍎 Mac</p>
                  <p class="text-slate-700"><strong>방법</strong>: Spotlight(Cmd+Space) → <strong>Terminal</strong> 검색</p>
                  <p class="text-slate-700">또는 Finder → 응용프로그램 → 유틸리티 → Terminal</p>
                  <p class="text-slate-600 text-[10px]">⚠️ 권한 오류 시 명령어 앞에 <code class="bg-slate-200 px-1 rounded">sudo</code> 추가</p>
                </div>
              </div>
            </div>

            <!-- STEP 3: CLI + 코드 받기 -->
            <div class="px-6 py-4 space-y-3">
              <p class="font-bold text-sm text-gray-800">STEP 3. Firebase CLI 설치 및 코드 받기</p>

              <!-- 설치 폴더 이동 안내 -->
              <div class="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 space-y-2">
                <p class="font-semibold text-sky-800 text-[11px]">📁 먼저 원하는 폴더로 이동하세요 (터미널이 기본 시스템 폴더로 열릴 수 있음)</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <p class="text-[10px] text-sky-700 font-semibold mb-1">🪟 Windows (PowerShell / CMD)</p>
                    <pre class="bg-gray-900 text-green-400 rounded-lg px-3 py-2 text-[11px] font-mono">cd C:\Users\사용자명\Desktop
rem 또는 원하는 경로 예시:
cd D:\work\apps</pre>
                  </div>
                  <div>
                    <p class="text-[10px] text-sky-700 font-semibold mb-1">🍎 Mac (Terminal)</p>
                    <pre class="bg-gray-900 text-green-400 rounded-lg px-3 py-2 text-[11px] font-mono">cd ~/Desktop
# 또는 원하는 경로 예시:
cd ~/Documents/apps</pre>
                  </div>
                </div>
                <p class="text-[10px] text-sky-600">💡 <code class="bg-sky-100 px-0.5 rounded">cd</code> 명령어로 폴더를 먼저 이동한 뒤 clone을 실행하면 해당 폴더 안에 설치됩니다.</p>
              </div>

              <pre class="bg-gray-900 text-green-400 rounded-lg px-4 py-3 text-[11px] font-mono leading-relaxed">npm install -g firebase-tools    ← Firebase 배포 도구 설치
firebase login                   ← 구글 계정으로 로그인 (브라우저 자동 열림)

git clone https://github.com/nsh-cmd/container.git
cd container
npm install                      ← 패키지 설치 (수분 소요)</pre>
              <div class="bg-amber-50 border border-amber-100 rounded-xl px-4 py-2 text-amber-700">
                ⚠️ <strong>git이 없는 경우</strong>: <a href="https://git-scm.com" target="_blank" class="underline font-semibold">git-scm.com</a>에서 설치 후 터미널 재시작.
                또는 GitHub 페이지에서 <strong>Code → Download ZIP</strong>으로 다운로드 후 압축 해제
              </div>
            </div>

            <!-- STEP 4: Firebase + .env -->
            <div class="px-6 py-4 space-y-3">
              <p class="font-bold text-sm text-gray-800">STEP 4. Firebase 프로젝트 생성 및 .env 파일 설정</p>
              <div class="space-y-1">
                <p class="font-semibold text-gray-700">① Firebase 프로젝트 생성</p>
                <ol class="list-decimal list-inside space-y-1 text-gray-600 ml-2">
                  <li><a href="https://console.firebase.google.com" target="_blank" class="underline font-semibold">console.firebase.google.com</a> → <strong>프로젝트 추가</strong></li>
                  <li>프로젝트 이름 입력 → 만들기</li>
                  <li><strong>빌드 → Authentication → 시작하기 → 이메일/비밀번호</strong> 활성화</li>
                  <li><strong>빌드 → Firestore Database → 데이터베이스 만들기 → 프로덕션 모드</strong></li>
                </ol>
              </div>
              <div class="space-y-1">
                <p class="font-semibold text-gray-700">② Firebase 설정값 찾기</p>
                <ol class="list-decimal list-inside space-y-1 text-gray-600 ml-2">
                  <li>Firebase Console → <strong>프로젝트 설정(⚙️) → 일반 탭 → 내 앱 영역</strong></li>
                  <li>웹 앱이 없으면 <strong>&lt;/&gt;</strong> 클릭 → 앱 등록</li>
                  <li><code class="bg-gray-100 px-1 rounded">firebaseConfig</code> 객체에서 각 값 확인</li>
                </ol>
              </div>
              <div class="space-y-1">
                <p class="font-semibold text-gray-700">③ .env 파일 작성 (코드 루트 폴더에 생성)</p>
                <pre class="bg-gray-900 text-green-400 rounded-lg px-4 py-3 text-[11px] font-mono leading-relaxed">VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abcdef
VITE_ADMIN_EMAIL=admin@yourdomain.com</pre>
                <div class="bg-red-50 border border-red-100 rounded-xl px-4 py-2 text-red-700 space-y-1">
                  <p>⚠️ <strong>.env 파일은 GitHub에 올라가지 않습니다.</strong> 각자 직접 작성해야 합니다.</p>
                  <p>⚠️ Windows 메모장 저장 시 파일명을 <code class="bg-red-100 px-1 rounded">".env"</code> (따옴표 포함)로 입력해야 확장자 없이 저장됩니다.</p>
                </div>
              </div>
            </div>

            <!-- STEP 5: 빌드 + 배포 -->
            <div class="px-6 py-4 space-y-2">
              <p class="font-bold text-sm text-gray-800">STEP 5. 빌드 및 Firebase 배포</p>
              <pre class="bg-gray-900 text-green-400 rounded-lg px-4 py-3 text-[11px] font-mono leading-relaxed">npm run build

firebase init hosting
  → 프로젝트 선택: 방금 만든 프로젝트 선택
  → public directory: dist
  → single-page app: Yes
  → GitHub auto-deploy: No

firebase deploy --only hosting,firestore:rules</pre>
              <p class="text-gray-600">배포 완료 후 출력되는 <strong>Hosting URL</strong>(xxx.web.app)로 접속하면 이 초기설정 페이지가 나타납니다.</p>
            </div>

            <!-- 오류 안내 -->
            <div class="px-6 py-4 bg-gray-50/50 space-y-2">
              <p class="font-bold text-sm text-gray-800">🙋 설치 중 문제가 발생했다면</p>
              <p class="text-gray-600">오류 메시지 전체와 어느 단계에서 발생했는지 캡처하여 담당자에게 전달하세요.</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                <div class="bg-white border border-gray-100 rounded-lg px-3 py-2">
                  <p class="font-semibold text-gray-700 mb-1">자주 발생하는 오류</p>
                  <ul class="space-y-1 text-gray-500">
                    <li>· <code class="bg-gray-100 px-0.5 rounded">npm: command not found</code> → Node.js 재설치</li>
                    <li>· <code class="bg-gray-100 px-0.5 rounded">EACCES permission denied</code> → 관리자 권한 터미널</li>
                    <li>· <code class="bg-gray-100 px-0.5 rounded">Firebase: Error (auth/...)</code> → Authentication 활성화 확인</li>
                    <li>· <code class="bg-gray-100 px-0.5 rounded">Missing or insufficient permissions</code> → Firestore 규칙 배포 확인</li>
                    <li>· 빌드 후 흰 화면 → .env 파일 내용 재확인</li>
                  </ul>
                </div>
                <div class="bg-white border border-gray-100 rounded-lg px-3 py-2">
                  <p class="font-semibold text-gray-700 mb-1">점검 체크리스트</p>
                  <ul class="space-y-1 text-gray-500">
                    <li>☐ Node.js v18 이상 설치됨</li>
                    <li>☐ .env 파일이 코드 루트 폴더에 있음</li>
                    <li>☐ Firebase Auth 이메일/비밀번호 활성화</li>
                    <li>☐ Firestore 데이터베이스 생성됨</li>
                    <li>☐ firebase deploy에 firestore:rules 포함</li>
                    <li>☐ 브라우저 캐시 삭제 후 재접속</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </section>

        <!-- 0. Firebase 연결 설정 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center justify-between">
            <div>
              <h2 class="font-bold text-gray-800">🔥 Firebase 연결 설정</h2>
              <p class="text-xs text-gray-500 mt-0.5">Firebase Console에서 복사한 설정값을 아래에 입력하세요.</p>
            </div>
            <button @click="toggleGuide('firebase')" class="text-xs text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1 transition whitespace-nowrap">
              📖 <span>{{ guideOpen.firebase ? '안내 닫기' : '값 찾는 방법' }}</span>
            </button>
          </div>

          <!-- 값 찾는 방법 안내 -->
          <div v-if="guideOpen.firebase" class="px-6 py-4 bg-blue-50/50 border-b border-blue-100 text-xs text-blue-800 leading-relaxed space-y-2">
            <p class="font-semibold">📋 Firebase 설정값 찾는 방법</p>
            <ol class="list-decimal list-inside space-y-1.5 text-blue-700">
              <li><a href="https://console.firebase.google.com" target="_blank" class="underline font-semibold">console.firebase.google.com</a> 접속 → 해당 프로젝트 클릭</li>
              <li>좌측 상단 <strong>⚙️ 프로젝트 설정</strong> 클릭</li>
              <li><strong>일반</strong> 탭 → 아래로 스크롤 → <strong>내 앱</strong> 영역</li>
              <li>웹 앱이 없으면 <strong>&lt;/&gt;</strong> 아이콘 클릭 → 앱 이름 입력 → 앱 등록</li>
              <li>아래 <code class="bg-blue-100 px-1 rounded">firebaseConfig</code> 코드 블록에서 각 항목의 값을 복사하여 아래 입력란에 붙여넣기</li>
            </ol>
            <div class="bg-white border border-blue-100 rounded-lg px-4 py-3 font-mono text-[11px] text-gray-700 leading-relaxed">
              <span class="text-gray-400">const firebaseConfig = &#123;</span><br>
              &nbsp;&nbsp;<span class="text-blue-600">apiKey</span>: <span class="text-green-600">"AIzaSy..."</span>,<br>
              &nbsp;&nbsp;<span class="text-blue-600">authDomain</span>: <span class="text-green-600">"your-project.firebaseapp.com"</span>,<br>
              &nbsp;&nbsp;<span class="text-blue-600">projectId</span>: <span class="text-green-600">"your-project-id"</span>,<br>
              &nbsp;&nbsp;<span class="text-blue-600">storageBucket</span>: <span class="text-green-600">"your-project.appspot.com"</span>,<br>
              &nbsp;&nbsp;<span class="text-blue-600">messagingSenderId</span>: <span class="text-green-600">"123456789"</span>,<br>
              &nbsp;&nbsp;<span class="text-blue-600">appId</span>: <span class="text-green-600">"1:123:web:abc"</span><br>
              <span class="text-gray-400">&#125;</span>
            </div>
            <div class="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-amber-700">
              또한 <strong>빌드 → Authentication → 이메일/비밀번호 활성화</strong>와 <strong>Firestore Database 생성</strong>이 완료되어 있어야 합니다.
            </div>
          </div>

          <!-- 입력 폼 -->
          <div class="p-6 space-y-4">
            <!-- 연결 상태 배너 -->
            <div class="flex items-center gap-3 px-4 py-3 rounded-xl border"
                 :class="firebaseInfo.projectId ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :class="firebaseInfo.projectId ? 'bg-emerald-500' : 'bg-amber-400'"></span>
              <span class="text-xs font-semibold" :class="firebaseInfo.projectId ? 'text-emerald-700' : 'text-amber-700'">
                {{ firebaseInfo.projectId ? `연결됨: ${firebaseInfo.projectId}` : '미설정 — 아래에 Firebase 설정값을 입력하세요' }}
              </span>
              <button v-if="firebaseInfo.projectId" @click="showFirebaseForm = !showFirebaseForm"
                      class="ml-auto text-xs text-gray-500 hover:text-gray-700 underline underline-offset-2">
                {{ showFirebaseForm ? '접기' : '수정' }}
              </button>
            </div>

            <!-- 설정값 입력 폼 -->
            <div v-if="!firebaseInfo.projectId || showFirebaseForm" class="space-y-3">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="text-xs font-semibold text-gray-600 block mb-1">API Key <span class="text-red-500">*</span></label>
                  <input v-model="fbConfig.apiKey" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 transition" placeholder="AIzaSy...">
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 block mb-1">Auth Domain <span class="text-red-500">*</span></label>
                  <input v-model="fbConfig.authDomain" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 transition" placeholder="your-project.firebaseapp.com">
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 block mb-1">Project ID <span class="text-red-500">*</span></label>
                  <input v-model="fbConfig.projectId" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 transition" placeholder="your-project-id">
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 block mb-1">Storage Bucket <span class="text-red-500">*</span></label>
                  <input v-model="fbConfig.storageBucket" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 transition" placeholder="your-project.appspot.com">
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 block mb-1">Messaging Sender ID <span class="text-red-500">*</span></label>
                  <input v-model="fbConfig.messagingSenderId" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 transition" placeholder="123456789">
                </div>
                <div>
                  <label class="text-xs font-semibold text-gray-600 block mb-1">App ID <span class="text-red-500">*</span></label>
                  <input v-model="fbConfig.appId" class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-orange-400 transition" placeholder="1:123:web:abcdef">
                </div>
              </div>
              <button @click="saveFirebaseConfig"
                      :disabled="!fbConfig.apiKey || !fbConfig.projectId || !fbConfig.authDomain"
                      class="w-full bg-orange-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-orange-600 disabled:opacity-40 transition shadow-sm shadow-orange-400/20">
                🔌 저장 후 연결 확인 (페이지 새로고침)
              </button>
              <p class="text-[11px] text-gray-400 text-center">입력값은 이 브라우저에 안전하게 저장되며, 파일 수정은 필요 없습니다.</p>
            </div>

            <!-- 연결 테스트 (설정 완료 후) -->
            <div v-if="firebaseInfo.projectId && !showFirebaseForm" class="flex items-center gap-3">
              <button @click="testFirebase" :disabled="testingFirebase"
                      class="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition whitespace-nowrap">
                {{ testingFirebase ? '확인 중...' : '🔌 연결 테스트' }}
              </button>
              <div v-if="firebaseTestResult" class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full" :class="firebaseTestResult.ok ? 'bg-green-500' : 'bg-red-500'"></span>
                <span class="text-xs font-semibold" :class="firebaseTestResult.ok ? 'text-green-600' : 'text-red-500'">{{ firebaseTestResult.message }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- 1. 관리자 계정 생성 -->
        <section class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
            <h2 class="font-bold text-gray-800">👤 관리자 계정 생성</h2>
            <p class="text-xs text-gray-500 mt-0.5">시스템에 로그인할 최고관리자 계정을 만듭니다.</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-600 block mb-1">이름 <span class="text-red-500">*</span></label>
                <input v-model="form.adminName" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="예: 홍길동">
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 block mb-1">이메일 <span class="text-red-500">*</span></label>
                <input v-model="form.adminEmail" type="email" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="admin@example.com">
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-xs font-semibold text-gray-600 block mb-1">비밀번호 <span class="text-red-500">*</span></label>
                <input v-model="form.adminPassword" type="password" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="6자 이상">
              </div>
              <div>
                <label class="text-xs font-semibold text-gray-600 block mb-1">비밀번호 확인 <span class="text-red-500">*</span></label>
                <input v-model="form.adminPasswordConfirm" type="password" required class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="동일하게 입력">
              </div>
            </div>
            <div class="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700">
              💡 이 계정은 시스템 전체를 관리하는 최고관리자입니다. 초기설정 완료 후 이 계정으로 로그인하세요.
            </div>
          </div>
        </section>

        <!-- 2. 시설 기본 정보 -->
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

    <!-- 커스텀 다이얼로그 -->
    <div v-if="dialog.show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                 :class="dialog.type === 'error' ? 'bg-red-100 text-red-600' : (dialog.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600')">
              <svg v-if="dialog.type === 'error'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
              <svg v-else-if="dialog.type === 'success'" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900">{{ dialog.title }}</h3>
          </div>
          <p class="text-sm text-slate-600 mb-6 leading-relaxed whitespace-pre-line">{{ dialog.message }}</p>
          <div class="flex justify-end">
            <button @click="dialog.onConfirm" class="px-4 py-2 text-white text-sm font-semibold rounded-xl transition shadow-sm"
                    :class="dialog.type === 'error' ? 'bg-red-600 hover:bg-red-700' : (dialog.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-blue-600 hover:bg-blue-700')">확인</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebase/config'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { useSettingsStore } from '../store/settings'

const router = useRouter()
const settingsStore = useSettingsStore()

const saving = ref(false)
const testingSlack = ref(false)
const slackTestResult = ref(null)

const testingFirebase = ref(false)
const firebaseTestResult = ref(null)

// localStorage 또는 env에서 저장된 Firebase 설정 읽기
const _storedFb = (() => {
  try { return JSON.parse(localStorage.getItem('firebase_config') || 'null') } catch { return null }
})()

// Firebase 연결 상태 표시용 (읽기 전용 요약)
const firebaseInfo = reactive({
  projectId:     _storedFb?.projectId     || import.meta.env.VITE_FIREBASE_PROJECT_ID     || '',
  authDomain:    _storedFb?.authDomain    || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN    || '',
  storageBucket: _storedFb?.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  apiKeyMasked: (_storedFb?.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '').slice(0, 10) + '••••••••••'
})

// Firebase 설정 입력 폼
const showFirebaseForm = ref(false)
const fbConfig = reactive({
  apiKey:            _storedFb?.apiKey            || import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        _storedFb?.authDomain        || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         _storedFb?.projectId         || import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     _storedFb?.storageBucket     || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: _storedFb?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             _storedFb?.appId             || import.meta.env.VITE_FIREBASE_APP_ID             || ''
})

const saveFirebaseConfig = () => {
  if (!fbConfig.apiKey || !fbConfig.authDomain || !fbConfig.projectId) {
    showAlert('입력 오류', 'API Key, Auth Domain, Project ID는 필수입니다.', 'error')
    return
  }
  localStorage.setItem('firebase_config', JSON.stringify({ ...fbConfig }))
  window.location.reload()
}

const guideOpen = reactive({
  deploy: false,
  firebase: true,
  org: false,
  slack: false,
  gas: false
})

const form = reactive({
  adminName: '',
  adminEmail: '',
  adminPassword: '',
  adminPasswordConfirm: '',
  orgName: '',
  facilityType: '',
  slackWebhookUrl: '',
  appsScriptUrl: '',
  driveFolderId: ''
})

// ── 커스텀 다이얼로그 ──
const dialog = ref({ show: false, title: '', message: '', type: 'info', isConfirm: false, onConfirm: () => {}, onCancel: () => {} })
const showAlert = (title, message, type = 'info') => new Promise((resolve) => {
  dialog.value = { show: true, title, message, type, isConfirm: false,
    onConfirm: () => { dialog.value.show = false; resolve() },
    onCancel: () => { dialog.value.show = false; resolve() }
  }
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
  if (!form.adminName.trim() || !form.adminEmail.trim() || !form.adminPassword) {
    await showAlert('입력 오류', '관리자 이름, 이메일, 비밀번호는 필수입니다.', 'error')
    return
  }
  if (form.adminPassword.length < 6) {
    await showAlert('입력 오류', '비밀번호는 6자 이상이어야 합니다.', 'error')
    return
  }
  if (form.adminPassword !== form.adminPasswordConfirm) {
    await showAlert('입력 오류', '비밀번호가 일치하지 않습니다.', 'error')
    return
  }
  if (!form.orgName.trim()) {
    await showAlert('입력 오류', '시설명은 필수 입력 항목입니다.', 'error')
    return
  }

  saving.value = true
  try {
    // 1. Firebase Auth 관리자 계정 생성
    const credential = await createUserWithEmailAndPassword(auth, form.adminEmail.trim(), form.adminPassword)
    const uid = credential.user.uid

    // 2. Firestore 관리자 프로필 생성
    await setDoc(doc(db, 'users', uid), {
      email: form.adminEmail.trim(),
      name: form.adminName.trim(),
      role: 'admin',
      active: true,
      department: '관리자',
      createdAt: new Date()
    })

    // 3. 기관 정보 저장 (isInitialized: true → 이후 부트스트랩 모드 종료)
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

    await showAlert('설정 완료', `초기설정이 완료되었습니다!\n\n관리자 계정: ${form.adminEmail.trim()}\n\n이제 시스템을 사용할 수 있습니다.`, 'success')
    router.push('/')
  } catch (e) {
    console.error(e)
    const msg = e.code === 'auth/email-already-in-use'
      ? '이미 사용 중인 이메일입니다.'
      : e.code === 'auth/weak-password'
      ? '비밀번호가 너무 약합니다. 6자 이상으로 입력하세요.'
      : `설정 저장 중 오류가 발생했습니다.\n${e.message}`
    await showAlert('오류', msg, 'error')
  } finally {
    saving.value = false
  }
}
</script>

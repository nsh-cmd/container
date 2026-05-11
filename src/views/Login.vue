<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-10 transform transition-all duration-300">

      <!-- 헤더 -->
      <div class="text-center mb-8">
        <div class="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">{{ displayTitle }}</h1>
        <p class="text-sm text-gray-500 mt-2">관리자 및 내부 승인 허가 시스템</p>
      </div>

      <!-- 탭 -->
      <div class="flex rounded-xl bg-gray-100 p-1 mb-6">
        <button @click="tab = 'login'"
          class="flex-1 py-2 text-sm font-semibold rounded-lg transition"
          :class="tab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          로그인
        </button>
        <button @click="tab = 'register'"
          class="flex-1 py-2 text-sm font-semibold rounded-lg transition"
          :class="tab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'">
          회원가입
        </button>
      </div>

      <!-- 로그인 폼 -->
      <form v-if="tab === 'login'" @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5 uppercase tracking-wide">이메일</label>
          <input v-model="email" type="email" required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="이메일을 입력하세요" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5 uppercase tracking-wide">비밀번호</label>
          <input v-model="password" type="password" required
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="••••••••" />
        </div>
        <button type="submit" :disabled="loading"
          class="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98] shadow-md shadow-blue-500/20">
          {{ loading ? '인증 처리 중...' : '로그인' }}
        </button>
        <p v-if="errorMsg" class="text-xs text-red-500 text-center bg-red-50 py-2 rounded-lg border border-red-100">{{ errorMsg }}</p>
      </form>

      <!-- 회원가입 폼 -->
      <form v-else @submit.prevent="handleRegister" class="space-y-4">
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">이름 <span class="text-red-500">*</span></label>
            <input v-model="reg.name" required
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="홍길동" />
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1.5">부서</label>
            <input v-model="reg.department"
              class="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="예: 생활지원팀" />
          </div>
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5">이메일 <span class="text-red-500">*</span></label>
          <input v-model="reg.email" type="email" required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="이메일을 입력하세요" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5">비밀번호 <span class="text-red-500">*</span></label>
          <input v-model="reg.password" type="password" required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="6자 이상" />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5">비밀번호 확인 <span class="text-red-500">*</span></label>
          <input v-model="reg.passwordConfirm" type="password" required
            class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            placeholder="동일하게 입력" />
        </div>
        <button type="submit" :disabled="regLoading"
          class="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-[0.98] shadow-md shadow-blue-500/20">
          {{ regLoading ? '신청 중...' : '가입 신청' }}
        </button>
        <p v-if="regError" class="text-xs text-red-500 text-center bg-red-50 py-2 rounded-lg border border-red-100">{{ regError }}</p>
        <p v-if="regSuccess" class="text-xs text-emerald-600 text-center bg-emerald-50 py-2 rounded-lg border border-emerald-100">{{ regSuccess }}</p>
      </form>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'

const tab = ref('login')

// 로그인
const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

// 회원가입
const reg = reactive({ name: '', email: '', password: '', passwordConfirm: '', department: '' })
const regError = ref('')
const regSuccess = ref('')
const regLoading = ref(false)

const authStore = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const displayTitle = computed(() => {
  const orgName = settingsStore.orgName
  return orgName ? `${orgName} 공문서 관리` : '공문서 관리 시스템'
})

const handleLogin = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    await authStore.login(email.value, password.value)
    await settingsStore.loadSettings()
    router.push('/')
  } catch {
    errorMsg.value = '로그인에 실패했습니다. 아이디나 비밀번호를 확인하세요.'
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  regError.value = ''
  regSuccess.value = ''

  if (reg.password.length < 6) {
    regError.value = '비밀번호는 6자 이상이어야 합니다.'
    return
  }
  if (reg.password !== reg.passwordConfirm) {
    regError.value = '비밀번호가 일치하지 않습니다.'
    return
  }

  regLoading.value = true
  try {
    await authStore.register({
      email: reg.email,
      password: reg.password,
      name: reg.name,
      department: reg.department
    })
    regSuccess.value = '가입 신청이 접수되었습니다. 관리자 승인 후 로그인 가능합니다.'
    Object.assign(reg, { name: '', email: '', password: '', passwordConfirm: '', department: '' })
    setTimeout(() => { tab.value = 'login'; regSuccess.value = '' }, 3000)
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      regError.value = '이미 사용 중인 이메일입니다.'
    } else if (e.code === 'auth/invalid-email') {
      regError.value = '유효하지 않은 이메일 형식입니다.'
    } else {
      regError.value = '가입 신청 중 오류가 발생했습니다. 다시 시도해주세요.'
    }
  } finally {
    regLoading.value = false
  }
}
</script>

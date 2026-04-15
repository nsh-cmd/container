<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl shadow-blue-900/5 border border-gray-100 p-10 transform transition-all duration-300">
      <div class="text-center mb-10">
        <div class="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </div>
        <h1 class="text-2xl font-bold tracking-tight">{{ displayTitle }}</h1>
        <p class="text-sm text-gray-500 mt-2">관리자 및 내부 승인 허가 시스템</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5 uppercase tracking-wide">이메일</label>
          <input 
            v-model="email" 
            type="email" 
            required 
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
            placeholder="이메일을 입력하세요" 
          />
        </div>
        <div>
          <label class="text-xs font-semibold text-gray-600 block mb-1.5 uppercase tracking-wide">비밀번호</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            class="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" 
            placeholder="••••••••" 
          />
        </div>
        
        <button 
          type="submit" 
          class="w-full bg-blue-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-blue-700 focus:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition transform active:scale-[0.98] shadow-md shadow-blue-500/20" 
          :disabled="loading"
        >
          <span v-if="loading">인증 처리 중...</span>
          <span v-else>로그인</span>
        </button>

        <p v-if="errorMsg" class="text-xs text-red-500 text-center mt-3 bg-red-50 py-2 rounded-lg border border-red-100">
          {{ errorMsg }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useSettingsStore } from '../store/settings'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const loading = ref(false)

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
    // 로그인 후 설정 로드
    await settingsStore.loadSettings()
    router.push('/')
  } catch (error) {
    console.error(error)
    errorMsg.value = '로그인에 실패했습니다. 아이디나 비밀번호를 확인하세요.'
  } finally {
    loading.value = false
  }
}
</script>

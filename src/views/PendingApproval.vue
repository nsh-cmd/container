<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-10 text-center">

      <!-- 아이콘 -->
      <div class="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 class="text-xl font-bold text-gray-800 mb-2">관리자 승인 대기 중</h1>
      <p class="text-sm text-gray-500 leading-relaxed mb-2">
        가입 신청이 접수되었습니다.<br>
        관리자가 계정을 승인하면 시스템을 사용할 수 있습니다.
      </p>
      <p class="text-xs text-gray-400 mb-8">
        승인 후 다시 로그인하거나 이 페이지를 새로고침 하세요.
      </p>

      <div class="space-y-3">
        <button @click="refresh"
          class="w-full bg-blue-600 text-white rounded-xl py-3 text-sm font-semibold hover:bg-blue-700 transition">
          🔄 새로고침
        </button>
        <button @click="logout"
          class="w-full bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-semibold hover:bg-gray-200 transition">
          로그아웃
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const refresh = () => window.location.reload()

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

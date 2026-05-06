<template>
  <div class="p-4 md:p-8">
    <header class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p class="text-sm text-gray-500 mt-1 hidden md:block">직원을 추가하고 역할을 설정하세요.</p>
      </div>
      <button @click="showAddModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-500/30">
        + 직원 추가
      </button>
    </header>

    <!-- 사용자 리스트 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">불러오는 중...</div>

      <template v-else-if="users.length > 0">
        <!-- 모바일 카드뷰 -->
        <div class="md:hidden divide-y divide-gray-50">
          <div v-for="user in users" :key="user.id" class="px-5 py-4">
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-100 to-blue-50 text-indigo-600 flex justify-center items-center font-bold text-sm border border-white shadow-sm">
                  {{ user.name ? user.name.charAt(0) : 'U' }}
                </div>
                <div>
                  <p class="text-[14px] font-bold text-slate-800">{{ user.name }}</p>
                  <p class="text-[12px] text-slate-400">{{ user.email }}</p>
                </div>
              </div>
              <span class="px-2 py-0.5 text-[11px] font-medium rounded-lg" :class="user.active ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'">
                {{ user.active ? '활성' : '비활성' }}
              </span>
            </div>
            <div class="flex items-center justify-between mt-2">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 text-[11px] font-semibold rounded-lg" :class="roleClasses[user.role]">{{ roleLabels[user.role] }}</span>
                <span v-if="user.department" class="text-[12px] text-slate-500">{{ user.department }}</span>
              </div>
              <button @click="toggleActive(user)" class="text-[12px] font-semibold text-slate-500 hover:text-slate-900 transition underline underline-offset-2">
                {{ user.active ? '비활성화' : '활성화' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 데스크톱 테이블 -->
        <table class="hidden md:table w-full text-left">
          <thead>
            <tr class="bg-gray-50 text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wider">
              <th class="px-6 py-4 font-medium">이름</th>
              <th class="px-6 py-4 font-medium">이메일</th>
              <th class="px-6 py-4 font-medium">직급</th>
              <th class="px-6 py-4 font-medium">역할</th>
              <th class="px-6 py-4 font-medium">상태</th>
              <th class="px-6 py-4 font-medium">관리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="user in users" :key="user.id" class="hover:bg-blue-50/30 transition">
              <td class="px-6 py-4 text-sm font-semibold text-gray-800">{{ user.name }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ user.email }}</td>
              <td class="px-6 py-4 text-sm text-gray-500">{{ user.department || '-' }}</td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-semibold rounded-lg" :class="roleClasses[user.role]">
                  {{ roleLabels[user.role] }}
                </span>
              </td>
              <td class="px-6 py-4">
                <span class="px-2.5 py-1 text-xs font-medium rounded-lg" :class="user.active ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'">
                  {{ user.active ? '활성' : '비활성' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button @click="toggleActive(user)" class="text-xs font-semibold text-gray-500 hover:text-gray-900 transition underline underline-offset-2">
                  {{ user.active ? '비활성화' : '활성화' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </template>

      <div v-else class="p-8 text-center text-gray-400">등록된 사용자가 없습니다.</div>
    </div>

    <!-- 추가 모달 -->
    <div v-if="showAddModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="font-bold text-gray-800">새 직원 추가</h3>
          <button @click="showAddModal = false" class="text-gray-400 hover:text-gray-600 transition">✕</button>
        </div>
        <form @submit.prevent="addUser" class="p-6 space-y-4">
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">이름 *</label>
            <input v-model="form.name" required class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="홍길동">
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">이메일 *</label>
            <input v-model="form.email" type="email" required class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="user@together63.kr">
          </div>
          <div>
            <label class="text-xs font-semibold text-gray-600 block mb-1">비밀번호 *</label>
            <input v-model="form.password" type="text" required class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="비밀번호 설정">
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">직급</label>
              <input v-model="form.department" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="생활지도원">
            </div>
            <div>
              <label class="text-xs font-semibold text-gray-600 block mb-1">역할 *</label>
              <select v-model="form.role" class="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="user">담당자</option>
                <option value="receiver">접수자</option>
                <option value="reviewer">검토자</option>
                <option value="admin">관리자</option>
              </select>
            </div>
          </div>
          <p class="text-xs text-amber-600 bg-amber-50 rounded-lg p-3 leading-relaxed border border-amber-200/60">
            ⚠️ 이메일/패스워드로 계정이 즉시 생성됩니다. 직원은 해당 정보로 로그인할 수 있습니다.
          </p>
          <div class="pt-2 flex gap-3">
            <button type="button" @click="showAddModal = false" class="flex-1 border border-gray-200 text-gray-600 rounded-xl py-2.5 text-sm font-semibold hover:bg-gray-50 transition">취소</button>
            <button type="submit" class="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 transition shadow-sm" :disabled="submitting">
              {{ submitting ? '저장 중...' : '저장하기' }}
            </button>
          </div>
          <p v-if="errorMsg" class="text-xs text-red-500 text-center">{{ errorMsg }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { db } from '../firebase/config'
import { collection, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore'

const users = ref([])
const loading = ref(true)
const showAddModal = ref(false)
const submitting = ref(false)
const errorMsg = ref('')

const form = ref({
  name: '', email: '', password: '', department: '', role: 'user'
})

const roleLabels = { admin: '관리자', receiver: '접수자', reviewer: '검토자', user: '담당자' }
const roleClasses = {
  admin: 'bg-red-100 text-red-700',
  receiver: 'bg-blue-100 text-blue-700',
  reviewer: 'bg-purple-100 text-purple-700',
  user: 'bg-gray-100 text-gray-700'
}

const loadUsers = async () => {
  loading.value = true
  try {
    const snap = await getDocs(collection(db, 'users'))
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch(e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const addUser = async () => {
  submitting.value = true
  errorMsg.value = ''
  try {
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.value.email, password: form.value.password, returnSecureToken: false })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || '계정 생성 실패')

    await setDoc(doc(db, 'users', data.localId), {
      email: form.value.email,
      name: form.value.name,
      department: form.value.department,
      role: form.value.role,
      active: true,
      createdAt: new Date()
    })

    showAddModal.value = false
    form.value = { name: '', email: '', password: '', department: '', role: 'user' }
    await loadUsers()
  } catch(e) {
    console.error(e)
    errorMsg.value = e.message
  } finally {
    submitting.value = false
  }
}

const toggleActive = async (user) => {
  if (!confirm(`${user.name}의 계정을 ${user.active ? '비활성화' : '활성화'} 하시겠습니까?`)) return
  try {
    const ref = doc(db, 'users', user.id)
    await updateDoc(ref, { active: !user.active })
    user.active = !user.active
  } catch(e) {
    alert('오류가 발생했습니다.')
  }
}

onMounted(() => {
  loadUsers()
})
</script>

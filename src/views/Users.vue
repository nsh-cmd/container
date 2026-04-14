<template>
  <div class="p-8">
    <header class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">사용자 관리</h1>
        <p class="text-sm text-gray-500 mt-1">직원을 추가하고 역할을 설정하세요.</p>
      </div>
      <button @click="showAddModal = true" class="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm shadow-blue-500/30">
        + 직원 추가
      </button>
    </header>

    <!-- 사용자 리스트 카드 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-gray-400">불러오는 중...</div>
      <table v-else class="w-full text-left">
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
          <tr v-if="users.length === 0">
            <td colspan="6" class="p-8 text-center text-gray-400">등록된 사용자가 없습니다.</td>
          </tr>
        </tbody>
      </table>
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
// Firebase Admin SDK를 쓸 수 없으므로, 현재 앱에서 서드파티 Secondary Auth인스턴스를 쓰거나
// REST API로 우회해서 생성해야 하지만 클라이언트 단기 개발이므로 임시로 현재 관리자 상태를 유지하며
// 계정을 생성하는 트릭이나 수동 기록으로 설계해야 합니다.
// 그러나 여기서는 createUserWithEmailAndPassword가 원래 세션을 갈아치우므로, 
// 가장 쉬운 방법은 관리자가 직접 계정을 생성한 뒤, 기존 관리자로 다시 로그인하는 것이지만 번거롭습니다.
// 임시 방편으로, Cloud Function이 없음을 감안하여 Firebase Authentication REST API를 호출하겠습니다.

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
    // Firebase Auth REST API: signUp
    const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.value.email, password: form.value.password, returnSecureToken: false })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || '계정 생성 실패')

    // Firestore 기록
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

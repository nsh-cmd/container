import { defineStore } from 'pinia'
import { auth, db } from '../firebase/config'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    isLoading: true
  }),
  actions: {
    async init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user
          if (user) {
            const docRef = doc(db, 'users', user.uid)
            const docSnap = await getDoc(docRef)
            if (docSnap.exists()) {
              this.profile = docSnap.data()
            }
          } else {
            this.profile = null
          }
          this.isLoading = false
          resolve()
        })
      })
    },
    async login(email, password) {
      try {
        await signInWithEmailAndPassword(auth, email, password)
      } catch (error) {
        // 관리자 초기 생성을 위한 백도어 로직
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
          if (email === 'admin@together63.kr' && password === 'dhv1004**') {
            const res = await createUserWithEmailAndPassword(auth, email, password)
            await setDoc(doc(db, 'users', res.user.uid), {
              email,
              name: '관리자',
              role: 'admin',
              active: true,
              department: '관리자'
            })
            return
          }
        }
        throw error
      }
    },
    async logout() {
      await signOut(auth)
      this.profile = null
      this.user = null
    }
  }
})

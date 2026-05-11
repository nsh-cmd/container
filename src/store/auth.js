import { defineStore } from 'pinia'
import { auth, db } from '../firebase/config'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

// 관리자 계정은 Firebase Console에서 직접 생성하고,
// VITE_ADMIN_EMAIL 환경변수에 해당 이메일을 설정하세요.
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || ''

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    profile: null,
    isLoading: true
  }),
  actions: {
    async fetchProfile(uid) {
      const docSnap = await getDoc(doc(db, 'users', uid))
      if (docSnap.exists()) {
        this.profile = docSnap.data()
      } else {
        this.profile = null
      }
    },
    async init() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user
          if (user) {
            await this.fetchProfile(user.uid)

            // Firestore 프로필 문서 누락 시 자동 복구 (Firebase Auth 계정은 존재하는 경우)
            if (!this.profile && ADMIN_EMAIL && user.email === ADMIN_EMAIL) {
              const adminProfile = {
                email: user.email,
                name: '최고관리자',
                role: 'admin',
                active: true,
                department: '관리자코드'
              }
              await setDoc(doc(db, 'users', user.uid), adminProfile)
              this.profile = adminProfile
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
      const res = await signInWithEmailAndPassword(auth, email, password)
      await this.fetchProfile(res.user.uid)

      // 로그인 성공 후 Firestore 프로필 누락 시 자동 복구
      if (!this.profile && ADMIN_EMAIL && email === ADMIN_EMAIL) {
        const adminProfile = {
          email,
          name: '최고관리자',
          role: 'admin',
          active: true,
          department: '관리자코드'
        }
        await setDoc(doc(db, 'users', res.user.uid), adminProfile)
        this.profile = adminProfile
      }
    },
    async register({ email, password, name, department }) {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        email,
        name,
        department: department || '',
        role: 'pending',
        active: false,
        createdAt: new Date()
      })
      await signOut(auth) // 승인 전까지 자동 로그인 방지
    },
    async logout() {
      await signOut(auth)
      this.profile = null
      this.user = null
    }
  }
})

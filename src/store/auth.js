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
            
            // 🔥 어드민 계정인데 Firestore 프로필 문서가 누락된 경우 자동 복구 로직
            if (!this.profile && user.email === 'admin@together63.kr') {
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
          resolve() // 최초 앱 렌더링 시점에만 block 해제용
        })
      })
    },
    async login(email, password) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password)
        await this.fetchProfile(res.user.uid)
        
        // 로그인 성공 시점 자동 복구
        if (!this.profile && email === 'admin@together63.kr') {
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
      } catch (error) {
        // 관리자 초기 생성을 위한 백도어 로직 (계정 자체가 없을 때)
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
          if (email === 'admin@together63.kr' && password === 'dhv1004**') {
            const res = await createUserWithEmailAndPassword(auth, email, password)
            const newProfile = {
              email,
              name: '최고관리자',
              role: 'admin',
              active: true,
              department: '관리자코드'
            }
            await setDoc(doc(db, 'users', res.user.uid), newProfile)
            this.profile = newProfile
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

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// localStorage에 저장된 설정이 있으면 우선 사용 (UI 입력 방식 지원)
// 없으면 빌드 타임 환경변수(.env) 사용
const stored = (() => {
  try {
    const raw = localStorage.getItem('firebase_config')
    return raw ? JSON.parse(raw) : null
  } catch { return null }
})()

const firebaseConfig = {
  apiKey:            stored?.apiKey            || import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        stored?.authDomain        || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         stored?.projectId         || import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     stored?.storageBucket     || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: stored?.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             stored?.appId             || import.meta.env.VITE_FIREBASE_APP_ID             || '',
}

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }

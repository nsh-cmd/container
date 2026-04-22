import { defineStore } from 'pinia'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    orgName: '',
    facilityType: '',
    slackWebhookUrl: '',
    appsScriptUrl: '',
    driveFolderId: '',
    isInitialized: false,
    isLoaded: false
  }),
  actions: {
    async loadSettings() {
      try {
        const snap = await getDoc(doc(db, 'settings', 'orgInfo'))
        if (snap.exists()) {
          const data = snap.data()
          this.orgName = data.name || ''
          this.facilityType = data.facilityType || ''
          this.slackWebhookUrl = data.slackWebhookUrl || ''
          this.appsScriptUrl = data.appsScriptUrl || ''
          this.driveFolderId = data.driveFolderId || ''
          this.isInitialized = data.isInitialized || false
        }
      } catch (e) {
        console.error('설정 로드 실패:', e)
      } finally {
        this.isLoaded = true
      }
    }
  }
})

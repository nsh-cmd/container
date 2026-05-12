import { defineStore } from 'pinia'
import { db } from '../firebase/config'
import { doc, getDoc } from 'firebase/firestore'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    orgName: '',
    facilityType: '',
    slackWebhookUrl: '',
    slackTemplate: '',
    slackBotToken: '',
    slackMemberMap: {},   // { 'email@domain.com': 'U012AB3CD' }
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
          this.slackTemplate = data.slackTemplate || '🔔 새로운 문서가 배정되었습니다!\n- 문서제목: {title}\n- 접수번호: {receiptNo}\n- 담당자: {assigneeName}\n- 첨부파일: {attachments}'
          this.slackBotToken = data.slackBotToken || ''
          this.slackMemberMap = data.slackMemberMap || {}
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

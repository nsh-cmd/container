import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase/config'

/**
 * 담당자가 검토 단계에 포함될 경우 그 이전 단계를 자동생략 처리합니다.
 * Receive.vue / Assign.vue 공통 사용
 */
export const applyAutoSkip = (reviewSteps, assigneeEmail, assigneeName) => {
  if (!reviewSteps || reviewSteps.length === 0) return reviewSteps

  const steps = JSON.parse(JSON.stringify(reviewSteps))
  const email = (assigneeEmail || '').trim()
  const name = (assigneeName || '').trim()

  let matchIdx = -1
  for (let i = steps.length - 1; i >= 0; i--) {
    const stepEmail = (steps[i].email || '').trim()
    const stepName = (steps[i].name || '').trim()
    if ((email && stepEmail === email) || (name && stepName === name)) {
      matchIdx = i
      break
    }
  }

  if (matchIdx > 0) {
    for (let i = 0; i < matchIdx; i++) {
      steps[i].isApproved = true
      steps[i].approvedAt = new Date()
      steps[i].name = (steps[i].name || '') + ' (자동생략)'
    }
  }

  return steps
}

/**
 * YYYYMMDD-NNN 형식의 접수번호를 생성합니다.
 * 당일 기존 문서 수를 기준으로 시작하며, 실제 문서 존재 여부를 확인해 중복을 방지합니다.
 */
export const generateReceiptNo = async (receiptDate) => {
  const dateStr = receiptDate.split('T')[0].replace(/-/g, '')

  const q = query(
    collection(db, 'documents'),
    where('receiptNo', '>=', dateStr),
    where('receiptNo', '<', dateStr + 'z')
  )
  const snap = await getDocs(q)

  for (let seq = snap.size + 1; seq <= snap.size + 20; seq++) {
    const candidate = `${dateStr}-${String(seq).padStart(3, '0')}`
    const existing = await getDoc(doc(db, 'documents', candidate))
    if (!existing.exists()) return candidate
  }

  throw new Error('접수번호 생성 실패: 동시 접수 충돌이 발생했습니다. 잠시 후 다시 시도하세요.')
}

/**
 * 검토 단계에서 이메일 배열을 추출합니다 (중복 제거).
 * Firestore 쿼리 최적화를 위한 reviewerEmails 필드 생성에 사용합니다.
 */
export const extractReviewerEmails = (reviewSteps) => {
  if (!reviewSteps) return []
  return [...new Set(reviewSteps.filter(s => s.email).map(s => s.email))]
}

/**
 * applyAutoSkip이 추가한 '(자동생략)' 마커로 자동생략 단계를 식별합니다.
 * 실제 검토자 승인과 자동 생략을 UI에서 구분할 때 사용합니다.
 */
export const isAutoSkipped = (step) => {
  return !!(step?.name && step.name.includes('(자동생략)'))
}

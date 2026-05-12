/**
 * Slack 유틸리티 함수
 */

/**
 * Slack 채널로 메시지 전송 (Incoming Webhook)
 */
export const sendSlackMessage = async (webhookUrl, text) => {
  if (!webhookUrl || !text) return
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      mode: 'no-cors'
    })
  } catch (e) { /* Slack 오류 무시 */ }
}

/**
 * 이메일 기반 슬랙 멘션 문자열 반환
 * - memberMap에 해당 이메일이 있으면 <@SLACKID> 형태 (실제 ping)
 * - 없으면 @이름 형태 (텍스트)
 */
export const getSlackMention = (email, name, memberMap) => {
  if (email && memberMap && memberMap[email]) {
    return `<@${memberMap[email]}>`
  }
  return `@${name || email || '담당자'}`
}

/**
 * Slack 워크스페이스 전체 사용자 조회
 * Bot Token Scopes 필요: users:read, users:read.email
 *
 * Authorization 헤더는 브라우저 CORS preflight에서 차단되므로
 * token을 application/x-www-form-urlencoded 바디로 전송 (CORS safe)
 */
export const fetchSlackWorkspaceUsers = async (botToken) => {
  const res = await fetch('https://slack.com/api/users.list', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `token=${encodeURIComponent(botToken)}`
  })
  const data = await res.json()
  if (!data.ok) throw new Error(data.error || 'Slack API 오류')
  return data.members.filter(m => !m.is_bot && !m.deleted)
}

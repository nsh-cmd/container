#!/usr/bin/env node
/**
 * 버전 범프 스크립트
 *
 * 사용법:
 *   node scripts/release.js [major|minor|patch] "변경내용1" "변경내용2" ...
 *   npm run release patch "버그 수정" "UI 개선"
 *
 * 기본값: patch 증가
 * 실행 후 git add / commit / tag / push 명령을 안내합니다.
 */

const fs = require('fs')
const path = require('path')

const args = process.argv.slice(2)

if (args.length === 0) {
  console.log('\n사용법: node scripts/release.js [major|minor|patch] "변경내용1" "변경내용2" ...')
  console.log('예시:   npm run release patch "버그 수정" "검색 성능 개선"\n')
  process.exit(1)
}

const BUMP_TYPES = ['major', 'minor', 'patch']
const bumpType = BUMP_TYPES.includes(args[0]) ? args[0] : 'patch'
const descriptions = BUMP_TYPES.includes(args[0]) ? args.slice(1) : args

if (descriptions.length === 0) {
  console.error('\n❌ 변경 내용을 최소 1개 이상 입력하세요.\n')
  process.exit(1)
}

// package.json 업데이트
const pkgPath = path.resolve(__dirname, '..', 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
const [major, minor, patch] = pkg.version.split('.').map(Number)
const oldVersion = pkg.version

let newVersion
if (bumpType === 'major') newVersion = `${major + 1}.0.0`
else if (bumpType === 'minor') newVersion = `${major}.${minor + 1}.0`
else newVersion = `${major}.${minor}.${patch + 1}`

const today = new Date()
const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`

pkg.version = newVersion
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
console.log(`\n✅ package.json: ${oldVersion} → ${newVersion}`)

// src/changelog.js 업데이트
const changelogPath = path.resolve(__dirname, '..', 'src', 'changelog.js')
let src = fs.readFileSync(changelogPath, 'utf-8')

// APP_VERSION / APP_VERSION_DATE 갱신
src = src.replace(
  /export const APP_VERSION = '[^']*'/,
  `export const APP_VERSION = '${newVersion}'`
)
src = src.replace(
  /export const APP_VERSION_DATE = '[^']*'/,
  `export const APP_VERSION_DATE = '${dateStr}'`
)

// CHANGELOG 배열 맨 앞에 새 항목 삽입
const changesStr = descriptions.map(d => `      '${d.replace(/'/g, "\\'")}',`).join('\n')
const newEntry = `  {\n    version: '${newVersion}',\n    date: '${dateStr}',\n    changes: [\n${changesStr}\n    ]\n  },\n  `
src = src.replace('export const CHANGELOG = [\n  {', `export const CHANGELOG = [\n${newEntry}{`)

fs.writeFileSync(changelogPath, src)
console.log(`✅ src/changelog.js: v${newVersion} (${dateStr}) 항목 추가`)

console.log(`\n📋 변경 내용 (${descriptions.length}건):`)
descriptions.forEach(d => console.log(`   • ${d}`))

console.log(`\n🚀 다음 단계를 실행하세요:`)
console.log(`   git add package.json src/changelog.js`)
console.log(`   git commit -m "chore: release v${newVersion}"`)
console.log(`   git tag v${newVersion}`)
console.log(`   git push && git push --tags\n`)

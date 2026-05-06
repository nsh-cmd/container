<template>
  <div class="p-8 pb-20 max-w-3xl mx-auto">
    <header class="mb-8">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-sm">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">패치 내역</h1>
          <p class="text-sm text-slate-500 mt-0.5">
            현재 버전:
            <span class="font-mono font-bold text-indigo-600">v{{ APP_VERSION }}</span>
            <span class="text-slate-400 ml-1">({{ APP_VERSION_DATE }})</span>
          </p>
        </div>
      </div>
    </header>

    <div class="space-y-5">
      <div
        v-for="(release, idx) in CHANGELOG"
        :key="release.version"
        class="bg-white rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden"
      >
        <div
          class="px-7 py-5 border-b border-slate-50 flex items-center gap-4"
          :class="idx === 0 ? 'bg-gradient-to-r from-indigo-50/80 to-blue-50/40' : 'bg-slate-50/30'"
        >
          <div class="flex items-center gap-3">
            <span class="font-mono font-bold text-lg text-slate-800">v{{ release.version }}</span>
            <span
              v-if="idx === 0"
              class="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-indigo-600 text-white shadow-sm"
            >최신</span>
          </div>
          <span class="text-[13px] text-slate-400 font-medium ml-auto">{{ release.date }}</span>
        </div>
        <ul class="px-7 py-5 space-y-2.5">
          <li
            v-for="change in release.changes"
            :key="change"
            class="flex items-start gap-3 text-[14px] text-slate-700 leading-relaxed"
          >
            <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0"></span>
            {{ change }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { APP_VERSION, APP_VERSION_DATE, CHANGELOG } from '../changelog'
</script>

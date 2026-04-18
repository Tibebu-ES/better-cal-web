<script setup lang="ts">
import { cn } from "@/lib/utils"

interface Props {
  iconClass?: string
  textClass?: string
  class?: string
}

defineProps<Props>()
</script>

<template>
  <div :class="cn('flex items-center gap-2', $props.class)">
    <svg
      :class="cn('h-6 w-6 shrink-0', iconClass)"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#4f46e5"/>
          <stop offset="100%" stop-color="#7c3aed"/>
        </linearGradient>
        <linearGradient id="logo-dot" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="100%" stop-color="#f59e0b"/>
        </linearGradient>
      </defs>
      <!-- Rounded square background -->
      <rect width="32" height="32" rx="7" ry="7" fill="url(#logo-bg)"/>
      <!-- Calendar body -->
      <rect x="5" y="9" width="22" height="19" rx="2.5" ry="2.5" fill="white" opacity="0.12"/>
      <rect x="5" y="9" width="22" height="19" rx="2.5" ry="2.5" fill="none" stroke="white" stroke-width="1.4" stroke-opacity="0.9"/>
      <!-- Header divider -->
      <line x1="5" y1="15.5" x2="27" y2="15.5" stroke="white" stroke-width="1" stroke-opacity="0.55"/>
      <!-- Ring tabs -->
      <rect x="10.5" y="6" width="2.5" height="7" rx="1.25" ry="1.25" fill="white" opacity="0.85"/>
      <rect x="19" y="6" width="2.5" height="7" rx="1.25" ry="1.25" fill="white" opacity="0.85"/>
      <!-- Sparkle star in header -->
      <g transform="translate(16,12.5)" opacity="0.95">
        <polygon points="0,-2.2 0.55,-0.75 2.1,-0.75 0.85,0.15 1.3,1.65 0,0.8 -1.3,1.65 -0.85,0.15 -2.1,-0.75 -0.55,-0.75" fill="white"/>
      </g>
      <!-- Day grid row 1 -->
      <circle cx="10"   cy="20" r="1.1" fill="white" opacity="0.45"/>
      <circle cx="14.5" cy="20" r="1.1" fill="white" opacity="0.45"/>
      <circle cx="19"   cy="20" r="1.1" fill="white" opacity="0.45"/>
      <circle cx="23.5" cy="20" r="1.1" fill="white" opacity="0.45"/>
      <!-- Day grid row 2 -->
      <circle cx="10"   cy="24.5" r="1.1" fill="white" opacity="0.45"/>
      <circle cx="14.5" cy="24.5" r="1.1" fill="white" opacity="0.45"/>
      <!-- Today highlight -->
      <circle cx="19" cy="24.5" r="2.5" fill="url(#logo-dot)"/>
      <polyline points="17.8,24.5 18.7,25.4 20.2,23.6" fill="none" stroke="white" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="23.5" cy="24.5" r="1.1" fill="white" opacity="0.45"/>
    </svg>
    <span :class="cn('text-xl font-bold tracking-tight text-foreground', textClass)">BetterCal</span>
  </div>
</template>

<script setup lang="ts">
import { Calendar } from 'lucide-vue-next'
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
    <Calendar :class="cn('h-6 w-6 text-primary shrink-0', iconClass)" />
    <span :class="cn('text-xl font-bold tracking-tight text-foreground', textClass)">BetterCal</span>
  </div>
</template>

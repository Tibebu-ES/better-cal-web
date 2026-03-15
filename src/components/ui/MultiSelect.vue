<script setup lang="ts">
import { computed, ref } from 'vue'
import { Check, ChevronsUpDown, X } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface Option {
  id: number
  name: string
}

const props = defineProps<{
  options: Option[]
  modelValue: number[]
  placeholder?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: number[]): void
}>()

const open = ref(false)

const selectedLabels = computed(() => {
  return props.options
    .filter((opt) => props.modelValue.includes(opt.id))
    .map((opt) => opt.name)
})

function toggleOption(id: number) {
  const newValue = props.modelValue.includes(id)
    ? props.modelValue.filter((v) => v !== id)
    : [...props.modelValue, id]
  emit('update:modelValue', newValue)
}

function removeOption(id: number) {
  emit('update:modelValue', props.modelValue.filter((v) => v !== id))
}
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        role="combobox"
        :aria-expanded="open"
        class="w-full justify-between h-auto min-h-9 px-3 py-2 flex-wrap gap-1"
      >
        <div v-if="modelValue.length > 0" class="flex flex-wrap gap-1">
          <Badge
            v-for="id in modelValue"
            :key="id"
            variant="secondary"
            class="mr-1 mb-1"
          >
            {{ options.find(o => o.id === id)?.name }}
            <button
              class="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              @mousedown.prevent
              @click.stop="removeOption(id)"
            >
              <X class="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          </Badge>
        </div>
        <span v-else class="text-muted-foreground">{{ placeholder || 'Select options...' }}</span>
        <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-full p-0">
      <Command>
        <CommandInput :placeholder="'Search ' + (placeholder || 'options') + '...'" />
        <CommandEmpty>No option found.</CommandEmpty>
        <CommandList>
          <CommandGroup>
            <CommandItem
              v-for="option in options"
              :key="option.id"
              :value="option.name"
              @select="toggleOption(option.id)"
            >
              <Check
                :class="cn(
                  'mr-2 h-4 w-4',
                  modelValue.includes(option.id) ? 'opacity-100' : 'opacity-0'
                )"
              />
              {{ option.name }}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>

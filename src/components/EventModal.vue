<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import MultiSelect from "@/components/ui/MultiSelect.vue"
import type { CalendarEvent, CustomEventFieldValue } from '@/stores/events'
import { useEventsStore } from '@/stores/events'
import type { SubCalendar, CustomEventField } from '@/stores/calendar'

interface Props {
  open: boolean
  event: Partial<CalendarEvent> | null
  subCalendars: SubCalendar[]
  canDelete?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', event: Partial<CalendarEvent>): void
  (e: 'delete', id: number): void
}>()

const eventsStore = useEventsStore()

const form = ref({
  id: undefined as number | undefined,
  title: '',
  sub_calendar_id: 0,
  start_date: '',
  end_date: '',
  all_day: false,
  custom_event_field_values: [] as CustomEventFieldValue[],
})

const getFieldValue = (fieldId: number) => {
  return form.value.custom_event_field_values.find(v => v.custom_event_field_id === fieldId)
}

const initializeCustomFields = () => {
  return eventsStore.customEventFields.map(field => {
    const existing = props.event?.custom_event_fields?.find(f => f.id === field.id)
    if (existing) {
      return {
        custom_event_field_id: field.id,
        value: existing.value || null,
        custom_event_field_option_id: existing.option_id || null,
        custom_event_field_option_ids: existing.option_ids || []
      }
    }
    return {
      custom_event_field_id: field.id,
      value: null,
      custom_event_field_option_id: null,
      custom_event_field_option_ids: []
    }
  })
}

watch(() => props.open, (isOpen) => {
  if (isOpen) {
    if (props.event) {
      form.value = {
        id: props.event.id,
        title: props.event.title || '',
        sub_calendar_id: props.event.sub_calendar_id || (props.subCalendars.length > 0 ? props.subCalendars[0].id : 0),
        start_date: props.event.start_date ? formatDateTime(props.event.start_date) : '',
        end_date: props.event.end_date ? formatDateTime(props.event.end_date) : '',
        all_day: props.event.all_day || false,
        custom_event_field_values: initializeCustomFields(),
      }
    } else {
      form.value = {
        id: undefined,
        title: '',
        sub_calendar_id: props.subCalendars.length > 0 ? props.subCalendars[0].id : 0,
        start_date: '',
        end_date: '',
        all_day: false,
        custom_event_field_values: initializeCustomFields(),
      }
    }
  }
}, { immediate: true })

function formatDateTime(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function handleSave() {
  const payload = { ...form.value }
  // Only send what's needed for the backend if we want to be strict, 
  // but based on instructions we just need to send custom_event_field_values
  emit('save', payload)
  emit('update:open', false)
}

function handleDelete() {
  if (form.value.id) {
    emit('delete', form.value.id)
    emit('update:open', false)
  }
}

const isNew = computed(() => !form.value.id)
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{{ isNew ? 'Add Event' : 'Edit Event' }}</DialogTitle>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="title">Title</Label>
          <Input id="title" v-model="form.title" placeholder="Event title" />
        </div>
        
        <div class="grid gap-2">
          <Label for="sub_calendar">Sub-calendar</Label>
          <select 
            id="sub_calendar" 
            v-model="form.sub_calendar_id"
            class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option v-for="sub in subCalendars" :key="sub.id" :value="sub.id">
              {{ sub.name }}
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="start_date">Start</Label>
            <Input id="start_date" type="datetime-local" v-model="form.start_date" />
          </div>
          <div class="grid gap-2">
            <Label for="end_date">End</Label>
            <Input id="end_date" type="datetime-local" v-model="form.end_date" />
          </div>
        </div>

        <div class="flex items-center space-x-2">
          <input 
            id="all_day" 
            type="checkbox" 
            v-model="form.all_day"
            class="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label for="all_day">All day</Label>
        </div>

        <div v-for="field in eventsStore.customEventFields" :key="field.id" class="grid gap-2">
          <Label :for="'field-' + field.id">{{ field.name }}</Label>
          
          <template v-if="field.type === 'text'">
            <Input 
              :id="'field-' + field.id" 
              v-model="getFieldValue(field.id)!.value" 
              :placeholder="field.name" 
            />
          </template>

          <template v-else-if="field.type === 's_select'">
            <select 
              :id="'field-' + field.id" 
              v-model="getFieldValue(field.id)!.custom_event_field_option_id"
              class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option :value="null">None</option>
              <option v-for="opt in field.options" :key="opt.id" :value="opt.id">
                {{ opt.name }}
              </option>
            </select>
          </template>

          <template v-else-if="field.type === 'm_select'">
            <MultiSelect 
              :options="field.options" 
              v-model="getFieldValue(field.id)!.custom_event_field_option_ids!"
              :placeholder="'Select ' + field.name"
            />
          </template>
        </div>
      </div>

      <DialogFooter class="flex justify-between items-center sm:justify-between">
        <div>
            <Button v-if="!isNew && canDelete" variant="destructive" @click="handleDelete">
              Delete
            </Button>
        </div>
        <div class="flex gap-2">
            <Button variant="outline" @click="emit('update:open', false)">
              Cancel
            </Button>
            <Button @click="handleSave">
              Save
            </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

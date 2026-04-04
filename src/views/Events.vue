<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {Key, Calendar as CalendarIcon, Clock, LucideLock, Calendar} from 'lucide-vue-next';
import { useEventsStore } from '@/stores/events';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import EventModal from '@/components/EventModal.vue';
import type { CalendarEvent } from '@/stores/events';

const route = useRoute();
const eventsStore = useEventsStore();
const key = route.params.key as string;

const selectedSubCalendars = ref<number[]>([]);
const isEventModalOpen = ref(false);
const canModifyEvents = ref(false);
const canDeleteEvents = ref(false);
const selectedEvent = ref<Partial<CalendarEvent> | null>(null);

const hoveredEvent = ref<{
    event: CalendarEvent;
    subCalendarName: string;
    x: number;
    y: number;
} | null>(null);

const subCalendarsWithModifyPermission = computed(() => {
    if(eventsStore.accessKeyDetail?.shared_type === 'all_sub_calendars' && eventsStore.accessKeyDetail?.role === 'modify'  ){
      return eventsStore.subCalendars;
    }else if(eventsStore.accessKeyDetail?.shared_type === 'selected_sub_calendars'){
      const permissions = eventsStore.accessKeyDetail?.sub_calendar_permissions || [];
      const modifyIds = permissions
          .filter(p => p.access_type === 'modify')
          .map(p => p.sub_calendar_id);
      return eventsStore.subCalendars.filter(s => modifyIds.includes(s.id));
    }else{
      return [];
    }


});

const hasModifyPermissionToSubCalendar = (subCalendarId: number) => {
  let hasPermissionToModify = false;

  if (eventsStore.accessKeyDetail?.shared_type === 'selected_sub_calendars') {
    const permission = eventsStore.accessKeyDetail?.sub_calendar_permissions.find(p => p.sub_calendar_id === subCalendarId);
    hasPermissionToModify = permission?.access_type === 'modify';
  } else if (
      eventsStore.accessKeyDetail?.shared_type === 'all_sub_calendars' &&
      eventsStore.accessKeyDetail?.role === 'modify'
  ) {
    hasPermissionToModify = true;
  }

  return hasPermissionToModify;
};

onMounted(async () => {
    await eventsStore.initialize(key);
    selectedSubCalendars.value = eventsStore.subCalendars.map(s => s.id);
});

function toggleSubCalendar(id: number) {
    if (selectedSubCalendars.value.includes(id)) {
        selectedSubCalendars.value = selectedSubCalendars.value.filter(sId => sId !== id);
    } else {
        selectedSubCalendars.value.push(id);
    }
}

const filteredEvents = computed(() => {
    return eventsStore.events.filter(event => selectedSubCalendars.value.includes(event.sub_calendar_id));
});

const calendarOptions = computed(() => ({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    events: filteredEvents.value.map(event => {
        const subCal = eventsStore.subCalendars.find(s => s.id === event.sub_calendar_id);
        return {
            id: event.id?.toString(),
            title: event.title,
            start: event.start_date,
            end: event.end_date,
            allDay: event.all_day,
            backgroundColor: subCal?.color,
            borderColor: subCal?.color,
            extendedProps: { ...event }
        };
    }),
    select: handleDateSelect,
    eventClick: handleEventClick,
    eventMouseEnter: handleEventMouseEnter,
    eventMouseLeave: handleEventMouseLeave
}));

function handleEventMouseEnter(mouseEnterInfo: any) {
    const eventId = parseInt(mouseEnterInfo.event.id);
    const event = eventsStore.events.find(e => e.id === eventId);
    if (!event) return;

    const subCal = eventsStore.subCalendars.find(s => s.id === event.sub_calendar_id);
    
    hoveredEvent.value = {
        event,
        subCalendarName: subCal?.name || 'Unknown',
        x: mouseEnterInfo.jsEvent.clientX,
        y: mouseEnterInfo.jsEvent.clientY
    };
}

function handleEventMouseLeave() {
    hoveredEvent.value = null;
}

function formatDate(startDateStr: string, endDateStr: string, allDay: boolean) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime())) return startDateStr;
    
    const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short',
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    if (allDay) {
        const startFormatted = start.toLocaleDateString(undefined, options);
        const endFormatted = end.toLocaleDateString(undefined, options);
        
        if (startFormatted === endFormatted) {
            return startFormatted;
        }
        return `${startFormatted} - ${endFormatted}`;
    } else {
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const startDateFormatted = start.toLocaleDateString(undefined, options);
        const endDateFormatted = end.toLocaleDateString(undefined, options);
        const startTimeFormatted = start.toLocaleTimeString(undefined, timeOptions).toUpperCase();
        const endTimeFormatted = end.toLocaleTimeString(undefined, timeOptions).toUpperCase();

        if (startDateFormatted === endDateFormatted) {
            return `${startDateFormatted}, ${startTimeFormatted} - ${endTimeFormatted}`;
        }
        
        return `${startDateFormatted}, ${startTimeFormatted} - ${endDateFormatted}, ${endTimeFormatted}`;
    }
}


/**
 * Handles date selection in the calendar. for adding new event
 * @param selectInfo
 */
function handleDateSelect(selectInfo: any) {
    // Check if any sub-calendar has 'modify' permission
    if (subCalendarsWithModifyPermission.value.length === 0) {
      return;
    }


    selectedEvent.value = {
        title: '',
        start_date: selectInfo.startStr,
        end_date: selectInfo.endStr,
        all_day: selectInfo.allDay,
        sub_calendar_id: subCalendarsWithModifyPermission.value[0]?.id
    };
    isEventModalOpen.value = true;
    canModifyEvents.value = true;

    
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
}

/**
 * Handles event click in the calendar. for editing existing event
 * @param clickInfo
 */
function handleEventClick(clickInfo: any) {
    const eventId = parseInt(clickInfo.event.id);
    const event = eventsStore.events.find(e => e.id === eventId);
    if (!event) return;

    //if key has no permission to modify this event
    let hasPermissionToModify = hasModifyPermissionToSubCalendar(event.sub_calendar_id);
    

    if (!hasPermissionToModify) {
      return;
    }


    selectedEvent.value = { ...event };
    canModifyEvents.value = canDeleteEvents.value = hasPermissionToModify;
    isEventModalOpen.value = true;
}

function handleSaveEvent(eventData: Partial<CalendarEvent>) {
    if (eventData.id) {
        eventsStore.updateEvent(eventData.id, eventData);
    } else {
        eventsStore.createEvent(eventData as Omit<CalendarEvent, 'id'>);
    }
}

function handleDeleteEvent(id: number) {
    eventsStore.deleteEvent(id);
}

</script>

<template>
    <div class="h-screen flex flex-col">
        <div v-if="eventsStore.loading" class="flex-1 flex items-center justify-center">
            Loading...
        </div>
        <div v-else-if="!eventsStore.accessKeyDetail" class="flex-1 flex items-center justify-center text-red-500">
            Invalid Access Key or unauthorized access.
        </div>
        <div v-else class="flex-1 flex overflow-hidden">
            <!--left sidebar-->
            <div class="w-64 bg-gray-50 border-r p-4 overflow-y-auto hidden md:block">
                <div class="flex items-center gap-2 mb-8">
                  <CalendarIcon class="h-6 w-6 text-primary" />
                  <span class="text-xl font-bold tracking-tight">BetterCal</span>
                </div>
                <p class="text-sm font-semibold mb-2 text-gray-500 tracking-tight">Sub-calendars</p>
                <div class="space-y-2">
                    <div 
                        v-for="subCal in eventsStore.subCalendars" 
                        :key="subCal.id"
                        class="flex items-center space-x-1 cursor-pointer text-white p-1 rounded relative"

                        @click="toggleSubCalendar(subCal.id)"
                        :style="{
                                backgroundColor: subCal.color,
                                opacity: selectedSubCalendars.includes(subCal.id) ? 1 : 0.4
                            }"
                        :class="{ 'with-overlay': !selectedSubCalendars.includes(subCal.id) }"
                    >
                      
                      <LucideLock
                          v-if="!hasModifyPermissionToSubCalendar(subCal.id)"
                          class="h-4 w-4  flex-shrink-0"
                      />
                        <span 
                            class="text-sm truncate "
                        >
                            {{ subCal.name }}
                        </span>
                    </div>
                </div>
            </div>
            <!--          content with the events-->
            <div class="flex-1 p-4 overflow-auto">
                <div class="mb-4 flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-800">{{ eventsStore.calendar?.name }}</h1>
                    <p class="flex items-center space-x-2" title="Name of key used to access the service">
                      <Key class="w-4 h-4 text-gray-500"/>
                      <span>{{ eventsStore.accessKeyDetail.name }}</span>
                    </p>
                </div>
                <FullCalendar :options="calendarOptions" />
            </div>
        </div>

        <!-- Event Hover Tooltip -->
        <div 
            v-if="hoveredEvent"
            class="fixed z-[100] pointer-events-none bg-white border border-gray-200 rounded-lg shadow-xl p-3 w-96 transform -translate-x-1/2 -translate-y-[calc(100%+10px)]"
            :style="{ 
                left: `${hoveredEvent.x}px`, 
                top: `${hoveredEvent.y}px`
            }"
        >
            <h3 class="font-bold text-gray-900 mb-2">{{ hoveredEvent.event.title }}</h3>

            <div class="flex items-center text-xs text-gray-500 mb-2">
              <Clock class="w-3 h-3 mr-1" />
              <span>{{ formatDate(hoveredEvent.event.start_date, hoveredEvent.event.end_date, hoveredEvent.event.all_day) }}</span>
            </div>

            <div class="font-bold flex items-center text-xs text-gray-900 mb-2">
                <CalendarIcon class="w-3 h-3 mr-1" />
                <span>{{ hoveredEvent.subCalendarName }}</span>
            </div>

            <div v-if="hoveredEvent.event.custom_event_fields?.length" class="mt-2 pt-2 border-t border-gray-100 space-y-2">
                <div v-for="field in hoveredEvent.event.custom_event_fields" :key="field.id" class="text-xs">

                    <div class="flex items-center flex-wrap gap-1">
                      <span class="font-bold text-gray-900 block mb-1">{{ field.name }}:</span>
                        <template v-if="field.type === 'text'">
                            <span v-if="field.value" class="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                                {{ field.value }}
                            </span>
                        </template>
                        <template v-else-if="field.type === 's_select'">
                            <span v-if="field.option" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                {{ field.option.name }}
                            </span>
                        </template>
                        <template v-else-if="field.type === 'm_select'">
                            <span v-for="option in field.options" :key="option.id" class="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                                {{ option.name }}
                            </span>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <EventModal 
            v-model:open="isEventModalOpen"
            :event="selectedEvent"
            :sub-calendars="subCalendarsWithModifyPermission"
            :can-delete="canDeleteEvents"
            :can-modify="canModifyEvents"
            @save="handleSaveEvent"
            @delete="handleDeleteEvent"
        />
    </div>
</template>

<style>
.fc {
    max-width: 100%;
    height: 100%;
}

.with-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.3) 0, rgba(255, 255, 255, 0.3) 10px, transparent 10px, transparent 20px);
  z-index: 1;
  pointer-events: none;
  border-radius: inherit;
}
</style>

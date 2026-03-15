<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
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
const selectedEvent = ref<Partial<CalendarEvent> | null>(null);

const subCalendarsWithModifyPermission = computed(() => {
    const permissions = eventsStore.accessKeyDetail?.sub_calendar_permissions || [];
    const modifyIds = permissions
        .filter(p => p.access_type === 'modify')
        .map(p => p.sub_calendar_id);
    return eventsStore.subCalendars.filter(s => modifyIds.includes(s.id));
});

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
    eventChange: handleEventChange
}));

function handleDateSelect(selectInfo: any) {
    // Check if any sub-calendar has 'modify' permission
    const canModify = eventsStore.accessKeyDetail?.sub_calendar_permissions.some(p => p.access_type === 'modify');
    if (!canModify) {
        alert("You don't have permission to add events.");
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
    
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();
}

function handleEventClick(clickInfo: any) {
    const eventId = parseInt(clickInfo.event.id);
    const event = eventsStore.events.find(e => e.id === eventId);
    if (!event) return;

    const permission = eventsStore.accessKeyDetail?.sub_calendar_permissions.find(p => p.sub_calendar_id === event.sub_calendar_id);
    
    if (permission?.access_type !== 'modify') {
        alert("You don't have permission to modify this event.");
        return;
    }

    selectedEvent.value = { ...event };
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

function handleEventChange(changeInfo: any) {
    const eventId = parseInt(changeInfo.event.id);
    const event = eventsStore.events.find(e => e.id === eventId);
    if (!event) return;

    const permission = eventsStore.accessKeyDetail?.sub_calendar_permissions.find(p => p.sub_calendar_id === event.sub_calendar_id);
    
    if (permission?.access_type !== 'modify') {
        alert("You don't have permission to modify this event. Reverting change.");
        changeInfo.revert();
        return;
    }

    eventsStore.updateEvent(eventId, {
        start_date: changeInfo.event.startStr,
        end_date: changeInfo.event.endStr,
        all_day: changeInfo.event.allDay
    });
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
            <div class="w-64 bg-gray-50 border-r p-4 overflow-y-auto hidden md:block">
                <h2 class="text-lg font-semibold mb-4 text-gray-700">Sub-calendars</h2>
                <div class="space-y-2">
                    <div 
                        v-for="subCal in eventsStore.subCalendars" 
                        :key="subCal.id"
                        class="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
                        @click="toggleSubCalendar(subCal.id)"
                    >
                        <div 
                            class="w-4 h-4 rounded-sm flex-shrink-0"
                            :style="{ 
                                backgroundColor: subCal.color,
                                border: selectedSubCalendars.includes(subCal.id) ? '2px solid #374151' : '1px solid #d1d5db',
                                opacity: selectedSubCalendars.includes(subCal.id) ? 1 : 0.4
                            }"
                        ></div>
                        <span 
                            class="text-sm truncate"
                            :class="{ 'text-gray-400': !selectedSubCalendars.includes(subCal.id), 'text-gray-700 font-medium': selectedSubCalendars.includes(subCal.id) }"
                        >
                            {{ subCal.name }}
                        </span>
                    </div>
                </div>
            </div>
            <div class="flex-1 p-4 overflow-auto">
                <div class="mb-4 flex justify-between items-center">
                    <h1 class="text-2xl font-bold text-gray-800">{{ eventsStore.accessKeyDetail.name }} - Calendar</h1>
                </div>
                <FullCalendar :options="calendarOptions" />
            </div>
        </div>
        <EventModal 
            v-model:open="isEventModalOpen"
            :event="selectedEvent"
            :sub-calendars="subCalendarsWithModifyPermission"
            can-delete
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
</style>

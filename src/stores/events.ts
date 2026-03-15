import { defineStore } from "pinia";
import api from "@/api/eventsAxios.ts";
import type { AccessKey, Calendar, SubCalendar, CustomEventField, CustomEventFieldOption } from "@/stores/calendar.ts";

export interface CustomEventFieldValue {
    custom_event_field_id: number;
    value?: string | null;
    custom_event_field_option_id?: number | null;
    custom_event_field_option_ids?: number[];
}

export interface FetchedCustomEventField {
    id: number;
    name: string;
    type: "text" | "s_select" | "m_select";
    value?: string;
    option_id?: number;
    option_ids?: number[];
    option?: CustomEventFieldOption;
    options?: CustomEventFieldOption[];
}

export interface CalendarEvent {
    id: number;
    sub_calendar_id: number;
    title: string;
    description?: string;
    location?: string;
    start_date: string;
    end_date: string;
    all_day: boolean;
    custom_event_fields?: FetchedCustomEventField[];
    custom_event_field_values?: CustomEventFieldValue[];
}

interface EventsState {
    accessKeyDetail: AccessKey | null;
    events: CalendarEvent[];
    calendar: Calendar | null;
    subCalendars: SubCalendar[];
    customEventFields: CustomEventField[];
    loading: boolean;
}

export const useEventsStore = defineStore("events", {
    state: (): EventsState => ({
        accessKeyDetail: null,
        calendar: null,
        subCalendars: [],
        customEventFields: [],
        events: [],
        loading: false,
    }),

    actions: {
        async initialize(key: string) {
            localStorage.setItem('access_key', key);
            this.loading = true;
            try {
                const res = await api.get('/v1/events/access-key-details');
                this.accessKeyDetail = res.data?.access_key;
                this.calendar = res.data?.calendar;
                this.subCalendars = res.data?.sub_calendars || [];
                this.customEventFields = res.data?.custom_event_fields || [];
                await this.fetchEvents();
            } catch (error) {
                console.error("Failed to initialize events store", error);
            } finally {
                this.loading = false;
            }
        },

        async fetchEvents() {
            try {
                const res = await api.get('/v1/events');
                this.events = res.data.data;
            } catch (error) {
                console.error("Failed to fetch events", error);
            }
        },

        async createEvent(event: Omit<CalendarEvent, 'id'>) {
            try {
                const res = await api.post('/v1/events', event);
                this.events.push(res.data?.data);
                return res.data;
            } catch (error) {
                console.error("Failed to create event", error);
                throw error;
            }
        },

        async updateEvent(id: number, event: Partial<CalendarEvent>) {
            try {
                const res = await api.put(`/v1/events/${id}`, event);
                this.events = this.events.map(e => e.id === id ? res.data.data : e);
                return res.data.data;
            } catch (error) {
                console.error("Failed to update event", error);
                throw error;
            }
        },

        async deleteEvent(id: number) {
            try {
                await api.delete(`/v1/events/${id}`);
                this.events = this.events.filter(e => e.id !== id);
            } catch (error) {
                console.error("Failed to delete event", error);
                throw error;
            }
        }
    }
});

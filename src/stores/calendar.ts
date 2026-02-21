import { defineStore } from "pinia";
import api from "@/api/axios.ts";


export interface Calendar {
    id: number,
    name: string,
    active: boolean,
    about: string,
    timezone: string
    locale: string
}

export interface SubCalendar {
    id: number,
    calendar_id: number,
    name: string,
    active: boolean,
    overlap: boolean,
    color: string

}

export interface CustomEventFieldOption {
    id: number,
    custom_event_field_id: number,
    name: string
}

export interface CustomEventField {
    id: number,
    calendar_id: number,
    name: string,
    type: "text" | "s_select" | "m_select",
    options: CustomEventFieldOption[]
}




interface CalendarState {
    selectedCalendar: Calendar | null
    subCalendars: SubCalendar[],
    customEventFields: CustomEventField[],
    loading: boolean
}


export const useCalendarStore = defineStore("calendar", {
    state: (): CalendarState => ({
        selectedCalendar: null,
        subCalendars: [],
        customEventFields: [],
        loading: false
    }),

    actions: {
        async loadSelectedCalendar(id: number) {
            this.loading = true;
            const res = await api.get(`/v1/calendars/${id}`);
            this.selectedCalendar = res.data;
            this.loading = false;
        },

        async loadSubCalendars() {
            if (!this.selectedCalendar) return;
            const res = await api.get(`/v1/calendars/${this.selectedCalendar.id}/sub-calendars`);
            this.subCalendars = res.data.data;
        },

        async createSubCalendar(SubCalendar: {name: string, color: string, overlap: boolean}) {
            //if selectedCalendar is null, return
            if (!this.selectedCalendar) return;
            const res = await api.post(`/v1/calendars/${this.selectedCalendar.id}/sub-calendars`, SubCalendar);
            this.subCalendars.push(res.data);
        },

        async updateSubCalendar(id: number, SubCalendar: {name: string, color: string, overlap: boolean}) {
            if (!this.selectedCalendar) return;
            const res = await api.put(`/v1/calendars/${this.selectedCalendar.id}/sub-calendars/${id}`, SubCalendar);
            this.subCalendars = this.subCalendars.map(sub => sub.id === id ? res.data : sub);
        },

        async deleteSubCalendar(id: number) {
            if (!this.selectedCalendar) return;
            await api.delete(`/v1/calendars${this.selectedCalendar.id}/sub-calendars/${id}`);
            this.subCalendars = this.subCalendars.filter(sub => sub.id !== id);
        },

        async loadCustomEventFields() {
            if (!this.selectedCalendar) return;
            const res = await api.get(`/v1/calendars/${this.selectedCalendar.id}/custom-event-fields`);
            this.customEventFields = res.data.data;
        },

        async createCustomEventField(CustomEventField: {name: string, type: string, options: string[]}) {
            if (!this.selectedCalendar) return;
            const res = await api.post(`/v1/calendars/${this.selectedCalendar.id}/custom-event-fields`, CustomEventField);
            this.customEventFields.push(res.data);
        },

        async updateCustomEventField(id: number, CustomEventField: {name: string, type: string, options: CustomEventFieldOption[]}) {
            if (!this.selectedCalendar) return;
            const res = await api.put(`/v1/calendars/${this.selectedCalendar.id}/custom-event-fields/${id}`, CustomEventField);
            this.customEventFields = this.customEventFields.map(field => field.id === id ? res.data : field);
        },

        async deleteCustomEventField(id: number) {
            if (!this.selectedCalendar) return;
            await api.delete(`/v1/calendars/${this.selectedCalendar.id}/custom-event-fields/${id}`);
            this.customEventFields = this.customEventFields.filter(field => field.id !== id);
        },

        clear() {
            this.selectedCalendar = null;
            this.subCalendars = [];
        }
    }
});
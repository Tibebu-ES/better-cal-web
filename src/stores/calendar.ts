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

export interface SubCalendarPermission {
    sub_calendar_id: number,
    access_type: "read_only" | "modify"
}

export interface AccessKey {
    id: number,
    calendar_id: number,
    name: string,
    key: string,
    active: boolean,
    has_password: boolean,
    password?: string,
    sub_calendar_permissions: SubCalendarPermission[]
}




interface CalendarState {
    selectedCalendar: Calendar | null
    subCalendars: SubCalendar[],
    customEventFields: CustomEventField[],
    accessKeys: AccessKey[],
    loading: boolean
}


export const useCalendarStore = defineStore("calendar", {
    state: (): CalendarState => ({
        selectedCalendar: null,
        subCalendars: [],
        customEventFields: [],
        accessKeys: [],
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
            await api.delete(`/v1/calendars/${this.selectedCalendar.id}/sub-calendars/${id}`);
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

        async loadAccessKeys() {
            if (!this.selectedCalendar) return;
            const res = await api.get(`/v1/calendars/${this.selectedCalendar.id}/access-keys`);
            this.accessKeys = res.data.data;
        },

        async loadAllEntities() {
            this.loading = true;
            await Promise.all([
                this.loadSubCalendars(),
                this.loadCustomEventFields(),
                this.loadAccessKeys()
            ]);
            this.loading = false;
        },

        async createAccessKey(key: AccessKey) {
            if (!this.selectedCalendar) return;
            const res = await api.post(`/v1/calendars/${this.selectedCalendar.id}/access-keys`, key);
            this.accessKeys.push(res.data);
        },

        async updateAccessKey(id: number, key: AccessKey) {
            if(!this.selectedCalendar) return;
            const res = await api.put(`/v1/calendars/${this.selectedCalendar.id}/access-keys/${id}`, key);
            this.accessKeys = this.accessKeys.map(key => key.id === id ? res.data : key);
        },

        async deleteAccessKey(id: number) {
            if(!this.selectedCalendar) return;
            await api.delete(`/v1/calendars/${this.selectedCalendar.id}/access-keys/${id}`);
            this.accessKeys = this.accessKeys.filter(key => key.id !== id);
        },

        clear() {
            this.selectedCalendar = null;
            this.subCalendars = [];
            this.customEventFields = [];
            this.accessKeys = [];
        }
    }
});
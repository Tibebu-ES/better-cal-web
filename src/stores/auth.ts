import { defineStore } from "pinia";
import api from "@/api/axios.ts";

interface User {
    id: number
    name: string
    email: string
}

 interface Calendar {
    id: number,
    name: string,
    active: boolean,
    about: string,
    timezone: string
    locale: string
}

interface AuthState {
    user: User | null
    token: string | null
    defaultCalendar: Calendar | null
}


export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('token'),
    defaultCalendar: JSON.parse(localStorage.getItem('defaultCalendar') || 'null')
  }),
  actions: {
    async login(data: { email: string; password: string }) {
      const  res = await api.post("/auth/login", data);

      this.user = res.data.user;
      this.token = res.data.token;
      this.defaultCalendar = res.data.default_calendar;
      // @ts-ignore
      localStorage.setItem('token', this.token);
      localStorage.setItem('user', JSON.stringify(this.user));
      localStorage.setItem('defaultCalendar', JSON.stringify(this.defaultCalendar));
      localStorage.setItem("selectedCalendar", String(this.defaultCalendar?.id));
    },

      async register( name: string, email: string, password: string ) {
        const res = await api.post("/auth/register", {
            name, email, password,password_confirmation: password
        });

        this.user = res.data.user;
        this.token = res.data.token;
        this.defaultCalendar = res.data.default_calendar;
        // @ts-ignore
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('defaultCalendar', JSON.stringify(this.defaultCalendar));
        localStorage.setItem("selectedCalendar", String(this.defaultCalendar?.id));
      },
      
      logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('defaultCalendar');
        this.token = null;
        this.user = null;
      }
  },
})
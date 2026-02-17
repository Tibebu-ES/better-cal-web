import { defineStore } from "pinia";
import api from "@/api/axios.ts";

interface User {
    id: number
    name: string
    email: string
}

interface AuthState {
    user: User | null
    token: string | null
}


export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    token: localStorage.getItem('token')
  }),
  actions: {
    async login(data: { email: string; password: string }) {
      const  res = await api.post("/auth/login", data);

      this.user = res.data.user;
      this.token = res.data.token;
      localStorage.setItem('token', this.token);
    },

      async register( name: string, email: string, password: string ) {
        const res = await api.post("/auth/register", {
            name, email, password,password_confirmation: password
        });

        this.user = res.data.user;
        this.token = res.data.token;
        localStorage.setItem('token', this.token);
      },
      
      logout() {
        localStorage.removeItem('token');
        this.token = null;
        this.user = null;
      }
  },
})
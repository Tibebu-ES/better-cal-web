import { createRouter, createWebHistory } from 'vue-router'
import {useAuthStore} from "@/stores/auth.ts";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Calendars from "@/views/Calendars.vue";
import Dashboard from "@/views/Dashboard.vue";



const routes = [
      {
        path: '/',
        component: Home,
        meta: { guest: true }
      },
      {
        path: '/login',
        component: Login,
        meta: { guest: true }
      },
    {
        path: '/logout',
        component: () => useAuthStore().logout(),
    },
    {
        path: '/register',
        component: Register,
        meta: { guest: true }
    },
    {
        path: '/calendars',
        component: Calendars,
        meta: { requiresAuth: true }
    },
    {
        path: '/dashboard/:id',
        component: Dashboard,
        meta: { requiresAuth: true }
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.token) {
        return "/login"
    }

    if (to.meta.guest && auth.token) {
        return "/calendars"
    }
})

export default router
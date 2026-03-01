import { createRouter, createWebHistory } from 'vue-router'
import {useAuthStore} from "@/stores/auth.ts";
import Home from "@/views/Home.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Calendars from "@/views/Calendars.vue";
import Dashboard from "@/views/Dashboard.vue";
import DashboardLayout from "@/views/DashboardLayout.vue";
import SubCalendars from "@/views/SubCalendars.vue";
import CustomEventFields from "@/views/CustomEventFields.vue";
import AccessKeys from "@/views/AccessKeys.vue";




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

    // App layout with nested pages (sidebar stays, content swaps)
    {
        path: '/calendar',
        component: DashboardLayout,
        meta: { requiresAuth: true },
        children: [
            { path: '', redirect: '/calendar/dashboard' },
            { path: 'dashboard', component: Dashboard },
            { path: 'sub-calendars', component: SubCalendars },
            { path: 'event-fields', component: CustomEventFields},
            { path: 'access-keys', component: AccessKeys},
            { path: '/:pathMatch(.*)*', redirect: '/calendar/dashboard'}
        ],
    },
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
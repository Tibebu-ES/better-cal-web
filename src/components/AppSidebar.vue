<script setup lang="ts">
import { Calendar, ListPlus, LayoutTemplate, Eye, ChevronUp, User2 } from 'lucide-vue-next'
import Logo from '@/components/Logo.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
    SidebarFooter,
} from '@/components/ui/sidebar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

// Menu items.
const items = [
  {
    title: 'Dashboard',
    url: '/calendar/dashboard',
    icon: LayoutTemplate,
  },
  {
    title: 'Sub-calendars',
    url: '/calendar/sub-calendars',
    icon: Calendar,
  },
  {
    title: 'Event Fields',
    url: '/calendar/event-fields',
    icon: ListPlus,
  },
  {
    title: 'Access Keys',
    url: '/calendar/access-keys',
    icon: Eye,
  },

]
</script>

<template>
  <Sidebar collapsible="icon" variant="floating">
    <SidebarHeader class="px-3 py-2">
      <SidebarMenu>
        <SidebarMenuItem>
          <router-link to="/" class="flex items-center gap-2 px-1 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors overflow-hidden h-12">
            <Logo class="px-2" text-class="group-data-[collapsible=icon]:hidden" />
          </router-link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem v-for="item in items" :key="item.title">
              <SidebarMenuButton as-child :is-active="item.url === $route.path">
                <RouterLink :to="item.url">
                  <component :is="item.icon" />
                  <span>{{ item.title }}</span>
                </RouterLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <SidebarMenuButton>
                <User2 /> {{ auth.user?.name || 'Username' }}
                <ChevronUp class="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                side="top"
                class="w-(--reka-popper-anchor-width)"
            >
              <DropdownMenuItem>
                <span>Account</span>
              </DropdownMenuItem>
              <DropdownMenuItem @click="handleLogout">
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  </Sidebar>
</template>

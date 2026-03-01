<script setup lang="ts">

import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar"
import AppSidebar from "@/components/AppSidebar.vue";
</script>

<template>
  <SidebarProvider>
    <AppSidebar />

    <SidebarInset class="flex flex-col overflow-hidden">
      <header class="flex h-14 items-center gap-2 border-b px-4 shrink-0">
        <SidebarTrigger />
        <h1 class="text-base font-semibold">Dashboard</h1>
      </header>

      <main class="flex-1 overflow-hidden p-4">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
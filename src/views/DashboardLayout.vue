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

    <SidebarInset>
      <header class="flex h-14 items-center gap-2 border-b px-4">
        <SidebarTrigger />
        <h1 class="text-base font-semibold">Calendar Dashboard</h1>
      </header>

      <main class="p-4">
        <RouterView />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
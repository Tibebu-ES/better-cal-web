<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useCalendarStore } from "@/stores/calendar.ts";
import router from "@/router";
import { Calendar, ListPlus, Eye } from "lucide-vue-next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const calendarStore = useCalendarStore();
const selectedCalendar = computed(() => calendarStore.selectedCalendar);
const subCalendars = computed(() => calendarStore.subCalendars);
const customFields = computed(() => calendarStore.customEventFields);
const accessKeys = computed(() => calendarStore.accessKeys);
const isLoading = computed(() => calendarStore.loading);

const stats = computed(() => [
  {
    title: "Sub-calendars",
    value: subCalendars.value.length,
    icon: Calendar,
    url: "/calendar/sub-calendars",
    color: "text-blue-500",
  },
  {
    title: "Event Fields",
    value: customFields.value.length,
    icon: ListPlus,
    url: "/calendar/event-fields",
    color: "text-green-500",
  },
  {
    title: "Access Keys",
    value: accessKeys.value.length,
    icon: Eye,
    url: "/calendar/access-keys",
    color: "text-purple-500",
  },
]);

onMounted(async () => {
  const selectedCalendarId = localStorage.getItem("selectedCalendar");
  if (!selectedCalendarId) return router.push("/calendars");

  await calendarStore.loadSelectedCalendar(Number(selectedCalendarId));
  await calendarStore.loadAllEntities();
});
</script>

<template>
  <div v-if="isLoading" class="flex h-full items-center justify-center">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
  <div v-else class="space-y-8 p-4 ">
    <!-- Dashboard Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">{{ selectedCalendar?.name }}</h1>
      <p class="text-muted-foreground italic">
        {{ selectedCalendar?.about || "No description provided for this calendar." }}
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-4 md:grid-cols-3">
      <Card 
        v-for="stat in stats" 
        :key="stat.title"
        class="cursor-pointer hover:bg-muted/50 transition-colors"
        @click="router.push(stat.url)"
      >
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            {{ stat.title }}
          </CardTitle>
          <component :is="stat.icon" class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold" :class="stat.color">{{ stat.value }}</div>
          <p class="text-xs text-muted-foreground mt-1">
            Manage your calendar's {{ stat.title.toLowerCase() }}
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Calendar Info Section -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card class="col-span-4">
        <CardHeader>
          <CardTitle>Calendar Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none text-muted-foreground">Timezone</p>
                <p class="text-sm">{{ selectedCalendar?.timezone }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium leading-none text-muted-foreground">Locale</p>
                <p class="text-sm">{{ selectedCalendar?.locale }}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
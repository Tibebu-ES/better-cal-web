<script setup lang="ts">
import {computed, onMounted} from "vue";

import { useCalendarStore} from "@/stores/calendar.ts";
import router from "@/router";

const calendarStore = useCalendarStore();
const selectedCalendar = computed(() => calendarStore.selectedCalendar);

onMounted(async () => {
  const selectedCalendar = localStorage.getItem("selectedCalendar");
  if(!selectedCalendar) return router.push('/calendars')
  await calendarStore.loadSelectedCalendar(Number(selectedCalendar));
})

</script>

<template>
 <h1>Dashboard for {{selectedCalendar?.name}} </h1>
</template>

<style scoped>
/* no-op */
</style>
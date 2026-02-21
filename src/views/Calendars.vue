<script setup lang="ts">
import { onMounted, ref } from "vue"
import api from "@/api/axios"
import { useRouter } from "vue-router"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CreateCalendarModal from "@/components/CreateCalendarModal.vue"

interface Calendar {
  id: number,
  name: string,
  about: string,
}


const router = useRouter()
const showCreate = ref(false)
const calendars = ref<Calendar[]>([])

const fetchCalendars = async () => {
  const res = await api.get("/v1/calendars")
  calendars.value = res.data.data
}

onMounted(fetchCalendars)

const openCalendar = (id: number)  => {
  //@todo set the selected calendar in the store
  localStorage.setItem("selectedCalendar", String(id))
  router.push(`/calendar/dashboard`)
}
</script>

<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-semibold">Calendars</h1>
      <Button @click="showCreate = true">New calendar</Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card
          v-for="calendar in calendars"
          :key="calendar.id"
          class="cursor-pointer hover:bg-muted"
          @click="openCalendar(calendar.id)"
      >
        <CardHeader>
          <CardTitle>{{ calendar.name }}</CardTitle>
        </CardHeader>
        <CardContent>
          <p class="text-sm text-muted-foreground">
            {{ calendar.about || "No description" }}
          </p>
        </CardContent>
      </Card>
    </div>

    <CreateCalendarModal
        v-if="showCreate"
        @close="showCreate = false"
        @created="fetchCalendars"
    />
  </div>
</template>

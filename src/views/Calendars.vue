<script setup >
import { onMounted, ref } from "vue"
import api from "@/api/axios"
import { useRouter } from "vue-router"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CreateCalendarModal from "@/components/CreateCalendarModal.vue"

const router = useRouter()
const calendars = ref([])
const showCreate = ref(false)

const fetchCalendars = async () => {
  const res = await api.get("/v1/calendars")
  calendars.value = res.data.data
}

onMounted(fetchCalendars)

const openCalendar = (calendar) => {
  router.push(`/dashboard/${calendar.id}`)
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
          @click="openCalendar(calendar)"
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

<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {useCalendarStore, type CustomEventField, type CustomEventFieldOption} from "@/stores/calendar.ts";
import router from "@/router";

import {Button} from "@/components/ui/button";
import {Card, CardAction, CardHeader, CardTitle} from "@/components/ui/card";

const calendarStore = useCalendarStore();

const selectedCalendar = computed(() => calendarStore.selectedCalendar);
const customEventFields = computed( () => calendarStore.customEventFields);

//get custom event field type label function given type as text, 's_select', 'm_select'
function getCustomEventFieldTypeLabel(type: CustomEventField['type']) {
  switch(type) {
    case 's_select': return 'Single select';
    case 'm_select': return 'Multi select';
    default: return 'Text';
  }
}


onMounted(async () => {
  const selectedCalendarId = localStorage.getItem("selectedCalendar")
  if (!selectedCalendarId) return router.push("/calendars")

  await calendarStore.loadSelectedCalendar(Number(selectedCalendarId))
  await calendarStore.loadCustomEventFields()

})


</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">Event fields</h2>
        <p class="text-sm text-muted-foreground">
          Manage event fields for
          <span class="font-medium">{{ selectedCalendar?.name ?? "…" }}</span>
        </p>
      </div>

      <Button >Add event field</Button>
    </div>

<!--   list of custom event fields -->
    <div class="grid  gap-4">
        <Card v-for="field in customEventFields" :key="field.id" class="flex  gap-4">
          <CardHeader>
            <CardTitle>{{ field.name }}</CardTitle>
            <div class="text-sm text-muted-foreground">{{ getCustomEventFieldTypeLabel(field.type) }}</div>
            <CardAction>
              <Button variant="outline">Edit</Button>
            </CardAction>
          </CardHeader>
        </Card>
    </div>

  </div>
</template>

<style scoped>

</style>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import router from "@/router"
import { useCalendarStore, type SubCalendar } from "@/stores/calendar"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const calendarStore = useCalendarStore()

const subCalendars = computed(() => calendarStore.subCalendars)
const selectedCalendar = computed(() => calendarStore.selectedCalendar)

const dialogOpen = ref(false)
const dialogMode = ref<"create" | "edit">("create")
const editingId = ref<number | null>(null)

const form = reactive({
  name: "",
  color: "#3b82f6",
  overlap: false,
})

const dialogTitle = computed(() =>
  dialogMode.value === "create" ? "Add sub-calendar" : "Edit sub-calendar",
)

function openCreateDialog() {
  dialogMode.value = "create"
  editingId.value = null
  form.name = ""
  form.color = "#3b82f6"
  form.overlap = false
  dialogOpen.value = true
}

function openEditDialog(sub: SubCalendar) {
  dialogMode.value = "edit"
  editingId.value = sub.id
  form.name = sub.name ?? ""
  form.color = sub.color || "#3b82f6"
  form.overlap = !!sub.overlap
  dialogOpen.value = true
}

async function submitDialog() {
  const payload = {
    name: form.name.trim(),
    color: form.color,
    overlap: form.overlap,
  }

  if (!payload.name) return

  if (dialogMode.value === "create") {
    await calendarStore.createSubCalendar(payload)
  } else if (editingId.value != null) {
    await calendarStore.updateSubCalendar(editingId.value, payload)
  }

  dialogOpen.value = false
}

async function removeSubCalendar(id: number) {
  const ok = window.confirm("Delete this sub-calendar?")
  if (!ok) return
  await calendarStore.deleteSubCalendar(id)
}

onMounted(async () => {
  const selectedCalendarId = localStorage.getItem("selectedCalendar")
  if (!selectedCalendarId) return router.push("/calendars")

  await calendarStore.loadSelectedCalendar(Number(selectedCalendarId))
  await calendarStore.loadSubCalendars()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-lg font-semibold">Sub-calendars</h2>
        <p class="text-sm text-muted-foreground">
          Manage sub-calendars for
          <span class="font-medium">{{ selectedCalendar?.name ?? "…" }}</span>
        </p>
      </div>

      <Button @click="openCreateDialog">Add sub-calendar</Button>
    </div>

    <div class="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[44%]">Name</TableHead>
            <TableHead class="w-[16%]">Color</TableHead>
            <TableHead class="w-[16%]">Overlap</TableHead>
            <TableHead class="w-[12%]">Active</TableHead>
            <TableHead class="w-[12%]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="sub in subCalendars" :key="sub.id">
            <TableCell class="font-medium">{{ sub.name }}</TableCell>

            <TableCell>
              <div class="flex items-center gap-2">
                <span
                  class="inline-block size-4 rounded-sm border"
                  :style="{ backgroundColor: sub.color }"
                />
                <span class="text-xs text-muted-foreground">{{ sub.color }}</span>
              </div>
            </TableCell>

            <TableCell>
              <span class="text-sm">{{ sub.overlap ? "Yes" : "No" }}</span>
            </TableCell>

            <TableCell>
              <span class="text-sm">{{ sub.active ? "Yes" : "No" }}</span>
            </TableCell>

            <TableCell>
              <div class="flex justify-end gap-2">
                <Button variant="outline" size="sm" @click="openEditDialog(sub)">
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  @click="removeSubCalendar(sub.id)"
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="subCalendars.length === 0">
            <TableCell colspan="5" class="py-10 text-center text-muted-foreground">
              No sub-calendars yet.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>
            Set a name, color, and whether this sub-calendar can overlap.
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-4 py-2">
          <div class="grid gap-2">
            <Label for="sub-name">Name</Label>
            <Input
              id="sub-name"
              v-model="form.name"
              placeholder="e.g. Work, Personal, Holidays"
            />
          </div>

          <div class="grid gap-2">
            <Label for="sub-color">Color</Label>
            <div class="flex items-center gap-3">
              <input
                id="sub-color"
                v-model="form.color"
                type="color"
                class="h-9 w-14 rounded-md border bg-background px-1"
              />
              <Input v-model="form.color" class="max-w-[180px]" />
            </div>
          </div>

          <div class="flex items-center justify-between rounded-md border p-3">
            <div class="space-y-0.5">
              <div class="text-sm font-medium">Overlap</div>
              <div class="text-xs text-muted-foreground">
                Allow events in this sub-calendar to overlap.
              </div>
            </div>

            <label class="flex items-center gap-2 text-sm">
              <input
                v-model="form.overlap"
                type="checkbox"
                class="size-4 rounded border"
              />
              <span>{{ form.overlap ? "Enabled" : "Disabled" }}</span>
            </label>
          </div>
        </div>

        <DialogFooter class="gap-2">
          <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
          <Button @click="submitDialog">
            {{ dialogMode === "create" ? "Create" : "Save changes" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped>
/* (intentionally empty) */
</style>
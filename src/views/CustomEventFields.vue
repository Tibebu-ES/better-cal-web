<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {useCalendarStore, type CustomEventField} from "@/stores/calendar.ts";
import router from "@/router";

import {Button} from "@/components/ui/button";
import {Card, CardHeader, CardTitle} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Trash2, Plus, Pencil} from "lucide-vue-next";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {toast} from "vue-sonner";

const calendarStore = useCalendarStore();

const selectedCalendar = computed(() => calendarStore.selectedCalendar);
const customEventFields = computed( () => calendarStore.customEventFields);

const dialogOpen = ref(false)
const confirmOpen = ref(false)
const dialogMode = ref<"create" | "edit">("create")
const editingId = ref<number | null>(null)
const itemToDelete = ref<number | null>(null)

const form = reactive({
  name: "",
  type: "text",
  options: [] as {id?: number, name: string}[],
})

function openEditDialog(field: CustomEventField) {
  dialogMode.value = "edit"
  editingId.value = field.id
  form.name = field.name
  form.type = field.type
  form.options = field.options.map(o => ({ id: o.id, name: o.name }))
  dialogOpen.value = true
}

async function removeCustomEventField(id: number) {
  itemToDelete.value = id
  confirmOpen.value = true
}

async function handleConfirmDelete() {
  if (itemToDelete.value !== null) {
    try {
      await calendarStore.deleteCustomEventField(itemToDelete.value)
      toast.success("Event field deleted successfully")
      itemToDelete.value = null
    } catch (e) {
      toast.error("Failed to delete event field")
    }
  }
}


function addOption() {
  form.options.push({ name: "" })
}

function removeOption(index: number) {
  form.options.splice(index, 1)
}

const dialogTitle = computed(() =>
    dialogMode.value === "create" ? "Add event field" : "Edit event field",
)

function openCreateDialog() {
  dialogMode.value = "create"
  editingId.value = null
  form.name = ""
  form.type = "text"
  form.options = []
  dialogOpen.value = true
}

//get custom event field type label function given type as text, 's_select', 'm_select'
function getCustomEventFieldTypeLabel(type: CustomEventField['type']) {
  switch(type) {
    case 's_select': return 'Single select';
    case 'm_select': return 'Multi select';
    default: return 'Text';
  }
}

async function submitDialog() {
  if (!form.name.trim()) return

  try {
    if (dialogMode.value === "create") {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        options: form.type === 'text' ? [] : form.options.filter(o => o.name.trim() !== "").map(o => o.name.trim())
      }
      await calendarStore.createCustomEventField(payload)
      toast.success("Event field created successfully")
    } else if (editingId.value != null) {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        options: form.type === 'text' ? [] : form.options.filter(o => o.name.trim() !== "").map(o => ({
          id: o.id,
          name: o.name.trim(),
          custom_event_field_id: editingId.value
        }))
      }
      await calendarStore.updateCustomEventField(editingId.value, payload as any)
      toast.success("Event field updated successfully")
    }
    dialogOpen.value = false
  } catch (e) {
    toast.error(dialogMode.value === "create" ? "Failed to create event field" : "Failed to update event field")
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
  <div class="space-y-8 p-4">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold tracking-tight">Event fields</h2>
        <p class="text-sm text-muted-foreground">
          Manage event fields for
          <span class="font-medium">{{ selectedCalendar?.name ?? "…" }}</span>
        </p>
      </div>

      <Button @click="openCreateDialog" >
        <Plus class="mr-2 h-4 w-4" />
        Add event field
      </Button>
    </div>

<!--   list of custom event fields -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="field in customEventFields" :key="field.id" class="flex flex-col">
          <CardHeader>
            <CardTitle>{{ field.name }}</CardTitle>
            <div class="text-sm text-muted-foreground">{{ getCustomEventFieldTypeLabel(field.type) }}</div>
            <div class="mt-4 flex gap-2">
              <Button variant="outline" size="sm" @click="openEditDialog(field)">
                <Pencil class="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" @click="removeCustomEventField(field.id)">
                <Trash2 class="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </CardHeader>
        </Card>
    </div>
  </div>

  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-[520px]">
      <DialogHeader>
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          Set a name, type, and options.
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-2">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col space-y-1.5">
            <Label for="name">Name</Label>
            <Input v-model="form.name" id="name" placeholder="e.g. Location, Department" required />
          </div>
          <div class="flex flex-col space-y-1.5">
            <Label for="type">Type</Label>
            <select v-model="form.type" id="type" :disabled="dialogMode === 'edit'" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" >
              <option value="text">Text</option>
              <option value="s_select">Single select</option>
              <option value="m_select">Multi select</option>
            </select>
          </div>
        </div>

        <div v-if="form.type === 's_select' || form.type === 'm_select'" class="space-y-4">
          <div class="flex items-center justify-between">
            <Label>Options</Label>
            <Button type="button" variant="outline" size="sm" @click="addOption">
              <Plus class="mr-2 h-4 w-4" />
              Add option
            </Button>
          </div>

          <div class="space-y-2">
            <div v-for="(option, index) in form.options" :key="index" class="flex items-center gap-2">
              <Input v-model="option.name" placeholder="Option name" required />
              <Button type="button" variant="ghost" size="icon" @click="removeOption(index)">
                <Trash2 class="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <p v-if="form.options.length === 0" class="text-sm text-muted-foreground text-center py-2 border border-dashed rounded-md">
              No options added yet. Click "Add option" to start.
            </p>
          </div>
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

  <ConfirmModal
      v-model:open="confirmOpen"
      title="Delete event field"
      description="Are you sure you want to delete this event field? This action cannot be undone."
      @confirm="handleConfirmDelete"
  />
</template>

<style scoped>

</style>
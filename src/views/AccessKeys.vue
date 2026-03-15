<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {useCalendarStore, type AccessKey, type SubCalendarPermission} from "@/stores/calendar.ts";
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
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";
import {Trash2, Plus, Pencil, Key, Copy, Check, ExternalLink} from "lucide-vue-next";
import ConfirmModal from "@/components/ConfirmModal.vue";
import {toast} from "vue-sonner";

const calendarStore = useCalendarStore();

const selectedCalendar = computed(() => calendarStore.selectedCalendar);
const accessKeys = computed(() => calendarStore.accessKeys);
const subCalendars = computed(() => calendarStore.subCalendars);

const dialogOpen = ref(false)
const confirmOpen = ref(false)
const dialogMode = ref<"create" | "edit">("create")
const editingId = ref<number | null>(null)
const itemToDelete = ref<number | null>(null)

const form = reactive({
  name: "",
  active: true,
  has_password: false,
  password: "",
  sub_calendar_permissions: [] as SubCalendarPermission[],
})

// Initialize permissions for all sub-calendars
function initPermissions() {
  form.sub_calendar_permissions = subCalendars.value.map(sub => ({
    sub_calendar_id: sub.id,
    access_type: "read_only" as const
  }));
}

function openCreateDialog() {
  dialogMode.value = "create"
  editingId.value = null
  form.name = ""
  form.active = true
  form.has_password = false
  form.password = ""
  initPermissions()
  dialogOpen.value = true
}

function openEditDialog(key: AccessKey) {
  dialogMode.value = "edit"
  editingId.value = key.id
  form.name = key.name
  form.active = key.active
  form.has_password = key.has_password
  form.password = "" // Don't show old password
  
  // Map existing permissions, and add defaults for any new sub-calendars
  form.sub_calendar_permissions = subCalendars.value.map(sub => {
    const existing = key.sub_calendar_permissions.find(p => p.sub_calendar_id === sub.id);
    return existing ? { ...existing } : { sub_calendar_id: sub.id, access_type: "read_only" as const };
  });
  
  dialogOpen.value = true
}

async function removeAccessKey(id: number) {
  itemToDelete.value = id
  confirmOpen.value = true
}

async function handleConfirmDelete() {
  if (itemToDelete.value !== null) {
    try {
      await calendarStore.deleteAccessKey(itemToDelete.value)
      toast.success("Access key deleted successfully")
      itemToDelete.value = null
    } catch (e) {
      toast.error("Failed to delete access key")
    }
  }
}

async function submitDialog() {
  if (!form.name.trim()) return

  try {
    const payload: any = {
      name: form.name.trim(),
      active: form.active,
      has_password: form.has_password,
      sub_calendar_permissions: form.sub_calendar_permissions
    }
    
    if (form.has_password && form.password) {
      payload.password = form.password;
    }

    if (dialogMode.value === "create") {
      await calendarStore.createAccessKey(payload)
      toast.success("Access key created successfully")
    } else if (editingId.value != null) {
      await calendarStore.updateAccessKey(editingId.value, payload)
      toast.success("Access key updated successfully")
    }
    dialogOpen.value = false
  } catch (e) {
    toast.error(dialogMode.value === "create" ? "Failed to create access key" : "Failed to update access key")
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Key copied to clipboard")
  })
}

const dialogTitle = computed(() =>
    dialogMode.value === "create" ? "Add access key" : "Edit access key",
)

onMounted(async () => {
  const selectedCalendarId = localStorage.getItem("selectedCalendar")
  if (!selectedCalendarId) return router.push("/calendars")

  await calendarStore.loadSelectedCalendar(Number(selectedCalendarId))
  await calendarStore.loadAccessKeys()
  await calendarStore.loadSubCalendars()
})

</script>

<template>
  <div class="space-y-8 p-4">
    <div class="flex items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold tracking-tight">Access keys</h2>
        <p class="text-sm text-muted-foreground">
          Manage access keys for
          <span class="font-medium">{{ selectedCalendar?.name ?? "…" }}</span>
        </p>
      </div>

      <Button @click="openCreateDialog">
        <Plus class="mr-2 h-4 w-4" />
        Add access key
      </Button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card v-for="key in accessKeys" :key="key.id" class="flex flex-col">
        <CardHeader>
          <div class="flex justify-between items-start">
            <CardTitle class="text-base">{{ key.name }}</CardTitle>
            <div :class="['px-2 py-0.5 rounded-full text-xs font-medium', key.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700']">
              {{ key.active ? 'Active' : 'Inactive' }}
            </div>
          </div>
          
          <div class="flex items-center gap-2 mt-2 p-2 bg-muted rounded-md border border-dashed">
            <Key class="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <code class="text-xs truncate flex-1">{{ key.key }}</code>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click="copyToClipboard(key.key)">
              <Copy class="h-3.5 w-3.5" />
            </Button>
          </div>

          <div class="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
             <div class="flex items-center gap-1">
               <component :is="key.has_password ? Key : Key" class="h-3 w-3" />
               {{ key.has_password ? 'Password protected' : 'No password' }}
             </div>
             <div class="flex items-center gap-1">
                <Check class="h-3 w-3" />
                {{ key.sub_calendar_permissions.length }} sub-calendars
             </div>
          </div>

          <div class="mt-4 flex gap-2">
            <Button variant="outline" size="sm" class="flex-1" @click="openEditDialog(key)">
              <Pencil class="mr-2 h-3.5 w-3.5" />
              Edit
            </Button>
            <Button variant="outline" size="sm" class="h-8 w-8" @click="router.push(`/events/${key.key}`)">
              <ExternalLink class="h-3.5 w-3.5" />
            </Button>
            <Button variant="destructive" size="sm" class="h-8 w-8" @click="removeAccessKey(key.id)">
              <Trash2 class="h-3.5 w-3.5" />
            </Button>
          </div>
        </CardHeader>
      </Card>
      
      <div v-if="accessKeys.length === 0" class="col-span-full py-12 flex flex-col items-center justify-center border-2 border-dashed rounded-lg text-muted-foreground">
        <Key class="h-12 w-12 mb-4 opacity-20" />
        <p>No access keys found. Create your first one to share your calendar.</p>
        <Button variant="link" @click="openCreateDialog">Add access key</Button>
      </div>
    </div>
  </div>

  <Dialog v-model:open="dialogOpen">
    <DialogContent class="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="p-6 pb-0">
        <DialogTitle>{{ dialogTitle }}</DialogTitle>
        <DialogDescription>
          Configure how people can access this calendar.
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 overflow-y-auto p-6 space-y-6">
        <div class="grid gap-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="name">Name</Label>
              <Input v-model="form.name" id="name" placeholder="e.g. Read-only Public, Manager Key" required />
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="active">Status</Label>
              <select v-model="form.active" id="active" class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" >
                <option :value="true">Active</option>
                <option :value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div class="space-y-4 pt-2 border-t">
            <div class="flex items-center justify-between">
              <div class="space-y-0.5">
                <Label for="has_password">Require Password</Label>
                <p class="text-[0.8rem] text-muted-foreground">Add an extra layer of security.</p>
              </div>
               <select v-model="form.has_password" id="has_password" class="w-[120px] flex h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" >
                <option :value="true">Yes</option>
                <option :value="false">No</option>
              </select>
            </div>
            
            <div v-if="form.has_password" class="flex flex-col space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <Label for="password">Password</Label>
              <Input v-model="form.password" id="password" type="password" placeholder="Leave empty to keep current password" />
            </div>
          </div>

          <div class="space-y-4 pt-2 border-t">
            <div class="space-y-0.5">
                <Label>Permissions</Label>
                <p class="text-[0.8rem] text-muted-foreground">Select access level for each sub-calendar.</p>
            </div>
            
            <div class="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sub-calendar</TableHead>
                    <TableHead class="w-[180px]">Access Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="sub in subCalendars" :key="sub.id">
                    <TableCell class="font-medium">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: sub.color }"></div>
                        {{ sub.name }}
                      </div>
                    </TableCell>
                    <TableCell>
                      <select 
                        v-model="form.sub_calendar_permissions.find(p => p.sub_calendar_id === sub.id)!.access_type"
                        class="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="read_only">Read-only</option>
                        <option value="modify">Modify</option>
                      </select>
                    </TableCell>
                  </TableRow>
                  <TableRow v-if="subCalendars.length === 0">
                    <TableCell colspan="2" class="text-center py-4 text-muted-foreground italic">
                      No sub-calendars found.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="p-6 pt-0 gap-2">
        <Button variant="outline" @click="dialogOpen = false">Cancel</Button>
        <Button @click="submitDialog">
          {{ dialogMode === "create" ? "Create Key" : "Save Changes" }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmModal
      v-model:open="confirmOpen"
      title="Delete access key"
      description="Are you sure you want to delete this access key? This action cannot be undone and people using this key will lose access."
      @confirm="handleConfirmDelete"
  />
</template>

<style scoped>
/* Optional: improve scrollbar look for the dialog content */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgba(0,0,0,0.1);
  border-radius: 10px;
}
</style>
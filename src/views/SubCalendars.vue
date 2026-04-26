<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue"
import router from "@/router"
import { useCalendarStore, type SubCalendar } from "@/stores/calendar"
import ConfirmModal from "@/components/ConfirmModal.vue"
import { toast } from "vue-sonner"
import { Plus, Pencil, Trash2, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, MoreHorizontal } from "lucide-vue-next"

import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
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
const pagination = computed(() => calendarStore.pagination)
const selectedCalendar = computed(() => calendarStore.selectedCalendar)

const currentPage = ref(1)

async function changePage(page: number) {
  if (page < 1 || (pagination.value && page > pagination.value.last_page)) return
  currentPage.value = page
  await calendarStore.loadSubCalendars(page)
}

const dialogOpen = ref(false)
const confirmOpen = ref(false)
const dialogMode = ref<"create" | "edit">("create")
const editingId = ref<number | null>(null)
const itemToDelete = ref<number | null>(null)

const form = reactive({
  name: "",
  color: "#3b82f6",
  overlap: false,
  active: true,
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
  form.active = true
  dialogOpen.value = true
}

function openEditDialog(sub: SubCalendar) {
  dialogMode.value = "edit"
  editingId.value = sub.id
  form.name = sub.name ?? ""
  form.color = sub.color || "#3b82f6"
  form.overlap = !!sub.overlap
  form.active = !!sub.active
  dialogOpen.value = true
}

async function submitDialog() {
  const payload = {
    name: form.name.trim(),
    color: form.color,
    overlap: form.overlap,
    active: form.active,
  }

  if (!payload.name) return

  try {
    if (dialogMode.value === "create") {
      await calendarStore.createSubCalendar(payload)
      toast.success("Sub-calendar created successfully")
      // Reload current page to see changes
      await calendarStore.loadSubCalendars(currentPage.value)
    } else if (editingId.value != null) {
      await calendarStore.updateSubCalendar(editingId.value, payload)
      toast.success("Sub-calendar updated successfully")
    }
    dialogOpen.value = false
  } catch (e) {
    toast.error(dialogMode.value === "create" ? "Failed to create sub-calendar" : "Failed to update sub-calendar")
  }
}

async function removeSubCalendar(id: number) {
  itemToDelete.value = id
  confirmOpen.value = true
}

async function handleConfirmDelete() {
  if (itemToDelete.value !== null) {
    try {
      await calendarStore.deleteSubCalendar(itemToDelete.value)
      toast.success("Sub-calendar deleted successfully")
      itemToDelete.value = null
      // Reload current page. If current page becomes empty, go to previous page
      if (subCalendars.value.length === 0 && currentPage.value > 1) {
        await changePage(currentPage.value - 1)
      } else {
        await calendarStore.loadSubCalendars(currentPage.value)
      }
    } catch (e) {
      toast.error("Failed to delete sub-calendar")
    }
  }
}

onMounted(async () => {
  const selectedCalendarId = localStorage.getItem("selectedCalendar")
  if (!selectedCalendarId) return router.push("/calendars")

  await calendarStore.loadSelectedCalendar(Number(selectedCalendarId))
  await calendarStore.loadSubCalendars(currentPage.value)
})
</script>

<template>
  <div class="space-y-8 p-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold tracking-tight">Sub-calendars</h2>
        <p class="text-muted-foreground">
          Manage sub-calendars for
          <span class="font-medium text-foreground underline decoration-primary/30 decoration-2 underline-offset-4">
            {{ selectedCalendar?.name ?? "…" }}
          </span>
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button @click="openCreateDialog" class="shadow-sm">
          <Plus class="mr-2 h-4 w-4" />
          Add sub-calendar
        </Button>
      </div>
    </div>

    <div class="rounded-lg border shadow-sm overflow-hidden">
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow>
            <TableHead class="w-[40%]">Name</TableHead>
            <TableHead class="w-[18%] text-center">Color</TableHead>
            <TableHead class="w-[15%] text-center">Overlap</TableHead>
            <TableHead class="w-[15%] text-center">Active</TableHead>
            <TableHead class="w-[12%] text-right pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow v-for="sub in subCalendars" :key="sub.id" class="group transition-colors">
            <TableCell>
              <div class="flex flex-col">
                <span class="font-semibold text-foreground">{{ sub.name }}</span>
              </div>
            </TableCell>

            <TableCell>
              <div class="flex items-center justify-center gap-2">
                <span
                  class="inline-block size-5 rounded-full border shadow-sm ring-1 ring-border"
                  :style="{ backgroundColor: sub.color }"
                />
                <code class="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                  {{ sub.color.toUpperCase() }}
                </code>
              </div>
            </TableCell>

            <TableCell class="text-center">
              <Badge
                :variant="sub.overlap ? 'default' : 'secondary'"
                class="px-2 py-0.5 capitalize font-normal"
              >
                {{ sub.overlap ? 'Allowed' : 'Blocked' }}
              </Badge>
            </TableCell>

            <TableCell class="text-center">
              <Badge
                :variant="sub.active ? 'outline' : 'secondary'"
                :class="[
                  sub.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'opacity-50',
                  'px-2 py-0.5 capitalize font-normal'
                ]"
              >
                {{ sub.active ? 'Active' : 'Inactive' }}
              </Badge>
            </TableCell>

            <TableCell class="text-right pr-4">
              <div class="flex justify-end items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger as-child>
                      <Button
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8 text-muted-foreground hover:text-foreground"
                        @click="openEditDialog(sub)"
                      >
                        <Pencil class="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit sub-calendar</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal class="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-40">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="openEditDialog(sub)">
                      <Pencil class="mr-2 h-3.5 w-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      class="text-destructive focus:text-destructive"
                      @click="removeSubCalendar(sub.id)"
                    >
                      <Trash2 class="mr-2 h-3.5 w-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-if="subCalendars.length === 0">
            <TableCell colspan="5" class="py-20 text-center">
              <div class="flex flex-col items-center justify-center space-y-3">
                <div class="rounded-full bg-muted p-4">
                  <Plus class="h-8 w-8 text-muted-foreground/50" />
                </div>
                <div class="space-y-1">
                  <p class="font-medium">No sub-calendars yet</p>
                  <p class="text-sm text-muted-foreground">
                    Get started by creating your first sub-calendar.
                  </p>
                </div>
                <Button variant="outline" size="sm" @click="openCreateDialog" class="mt-2">
                  Add first sub-calendar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div v-if="pagination && pagination.last_page > 1" class="flex items-center justify-between px-2">
      <div class="text-sm text-muted-foreground">
        Showing {{ pagination.from }} to {{ pagination.to }} of {{ pagination.total }} sub-calendars
      </div>
      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="pagination.total"
        :items-per-page="pagination.per_page"
        :sibling-count="1"
        show-edges
        @update:page="changePage"
        class="flex-none w-auto mx-0"
      >
        <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst >
            <ChevronsLeft class="h-4 w-4 " />
          </PaginationFirst>
          <PaginationPrevious>
            <ChevronLeft class="h-4 w-4" />
          </PaginationPrevious>

          <template v-for="(item, index) in items">
            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button class="h-9 w-9 p-0" :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext>
            <ChevronRight class="h-4 w-4" />
          </PaginationNext>
          <PaginationLast>
            <ChevronsRight class="h-4 w-4" />
          </PaginationLast>
        </PaginationContent>
      </Pagination>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{{ dialogTitle }}</DialogTitle>
          <DialogDescription>
            Set a name, color, and whether this sub-calendar can overlap.
          </DialogDescription>
        </DialogHeader>

        <div class="grid gap-5 py-4">
          <div class="grid gap-2">
            <Label for="sub-name" class="text-sm font-semibold">Name</Label>
            <Input
              id="sub-name"
              v-model="form.name"
              placeholder="e.g. Work, Personal, Holidays"
              class="h-10"
            />
          </div>

          <div class="grid gap-2">
            <Label for="sub-color" class="text-sm font-semibold">Color</Label>
            <div class="flex items-center gap-3">
              <div class="relative flex items-center">
                <input
                  id="sub-color"
                  v-model="form.color"
                  type="color"
                  class="h-10 w-12 cursor-pointer rounded-md border bg-background p-1 shadow-sm transition-hover hover:bg-accent"
                />
              </div>
              <Input
                v-model="form.color"
                class="font-mono uppercase h-10"
                placeholder="#000000"
              />
            </div>
          </div>

          <div class="flex flex-row items-center justify-between rounded-lg border bg-muted/30 p-4 shadow-sm">
            <div class="space-y-0.5">
              <Label for="sub-overlap" class="text-sm font-semibold cursor-pointer">Allow Overlap</Label>
              <p class="text-[12px] text-muted-foreground leading-tight">
                Permit multiple events at the same time in this calendar.
              </p>
            </div>
            <Checkbox
              id="sub-overlap"
              v-model="form.overlap"
            />
          </div>

          <div class="flex flex-row items-center justify-between rounded-lg border bg-muted/30 p-4 shadow-sm">
            <div class="space-y-0.5">
              <Label for="sub-active" class="text-sm font-semibold cursor-pointer">Active</Label>
              <p class="text-[12px] text-muted-foreground leading-tight">
                Show or hide this sub-calendar in the calendar view.
              </p>
            </div>
            <Checkbox
              id="sub-active"
              v-model="form.active"
            />
          </div>
        </div>

        <DialogFooter class="gap-2 sm:gap-0">
          <Button variant="ghost" @click="dialogOpen = false" class="mr-auto">Cancel</Button>
          <Button @click="submitDialog" class="px-8 shadow-sm">
            {{ dialogMode === "create" ? "Create Sub-calendar" : "Save Changes" }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ConfirmModal
      v-model:open="confirmOpen"
      title="Delete sub-calendar"
      description="Are you sure you want to delete this sub-calendar? This action cannot be undone."
      @confirm="handleConfirmDelete"
    />
  </div>
</template>

<style scoped>
/* (intentionally empty) */
</style>
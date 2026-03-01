<script setup lang="ts">
import { ref } from "vue"
import api from "@/api/axios"
import { toast } from "vue-sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const emit = defineEmits(["close", "created"])

const name = ref("")
const about = ref("")

const create = async () => {
  try {
    await api.post("/v1/calendars", {
      name: name.value,
      about: about.value
    })

    toast.success("Calendar created successfully")
    emit("created")
    emit("close")
  } catch (e) {
    toast.error("Failed to create calendar")
  }
}
</script>

<template>
  <Dialog open @update:open="emit('close')">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create calendar</DialogTitle>
      </DialogHeader>

      <div class="space-y-4">
        <div>
          <Label>Name</Label>
          <Input v-model="name" />
        </div>

        <div>
          <Label>Description</Label>
          <Input v-model="about" />
        </div>

        <Button class="w-full" @click="create">
          Create
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

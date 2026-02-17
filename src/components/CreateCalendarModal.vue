<script setup>
import { ref } from "vue"
import api from "@/api/axios"

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
  await api.post("/v1/calendars", {
    name: name.value,
    about: about.value
  })

  emit("created")
  emit("close")
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

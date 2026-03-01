<script setup lang="ts">
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "vue-sonner"

const auth = useAuthStore()
const router = useRouter()

const name = ref("")
const email = ref("")
const password = ref("")

const submit = async () => {
  try {
    await auth.register(name.value, email.value, password.value)
    toast.success("Account created successfully!")
    router.push("/calendars")
  } catch (e) {
    toast.error("Registration failed. Please try again.")
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Register</CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">
        <div>
          <Label>Name</Label>
          <Input v-model="name" />
        </div>

        <div>
          <Label>Email</Label>
          <Input v-model="email" type="email" />
        </div>

        <div>
          <Label>Password</Label>
          <Input v-model="password" type="password" />
        </div>

        <Button class="w-full" @click="submit">
          Create account
        </Button>
      </CardContent>
    </Card>
  </div>
</template>

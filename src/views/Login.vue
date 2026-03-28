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

const email = ref("")
const password = ref("")

const submit = async () => {
  try {
    await auth.login({
      email: email.value,
      password: password.value
    })

    toast.success("Welcome back!")
    //router.push("/calendars")
    router.push("/calendar/dashboard")
  } catch (e) {
    toast.error("Invalid credentials")
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <Card class="w-[400px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>

      <CardContent class="space-y-4">
        <div class="space-y-2">
          <Label>Email</Label>
          <Input v-model="email" type="email" />
        </div>

        <div class="space-y-2">
          <Label>Password</Label>
          <Input v-model="password" type="password" />
        </div>

        <Button class="w-full" @click="submit">
          Login
        </Button>
        <p class="text-center">
          Don't have an account? <router-link to="/register" class="text-blue-500 hover:underline">Register</router-link>'
        </p>
      </CardContent>
    </Card>
  </div>

</template>

<style scoped>

</style>
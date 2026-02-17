<script setup lang="ts">
import { ref } from "vue"
import { useAuthStore } from "@/stores/auth"
import { useRouter } from "vue-router"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const auth = useAuthStore()
const router = useRouter()

const email = ref("")
const password = ref("")
const error = ref(null)

const submit = async () => {
  try {
    await auth.login({
      email: email.value,
      password: password.value
    })

    router.push("/calendars")
  } catch (e) {
    error.value = "Invalid credentials"
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
        <div>
          <Label>Email</Label>
          <Input v-model="email" type="email" />
        </div>

        <div>
          <Label>Password</Label>
          <Input v-model="password" type="password" />
        </div>

        <p v-if="error" class="text-sm text-red-500">{{ error }}</p>

        <Button class="w-full" @click="submit">
          Login
        </Button>
      </CardContent>
    </Card>
  </div>

</template>

<style scoped>

</style>
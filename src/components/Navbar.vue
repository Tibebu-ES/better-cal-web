<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-vue-next'
import Logo from '@/components/Logo.vue'

const router = useRouter()
const isMenuOpen = ref(false)
</script>

<template>
  <nav class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
      <div class="cursor-pointer" @click="router.push('/')">
        <Logo />
      </div>
      
      <!-- Desktop Nav -->
      <div class="hidden md:flex items-center gap-8">
        <a href="/#features" class="text-sm font-medium transition-colors hover:text-primary">Features</a>
        <a href="#" class="text-sm font-medium transition-colors hover:text-primary">Pricing</a>
        <a href="#" class="text-sm font-medium transition-colors hover:text-primary">About</a>
        <div class="flex items-center gap-4">
          <Button variant="ghost" size="sm" @click="router.push('/login')">Log in</Button>
          <Button size="sm" @click="router.push('/register')">Get Started</Button>
        </div>
      </div>

      <!-- Mobile Nav Toggle -->
      <button class="md:hidden" @click="isMenuOpen = !isMenuOpen">
        <Menu v-if="!isMenuOpen" class="h-6 w-6" />
        <X v-else class="h-6 w-6" />
      </button>
    </div>

    <!-- Mobile Menu -->
    <div v-if="isMenuOpen" class="md:hidden border-b bg-background px-4 py-4 space-y-4">
      <a href="/#features" class="block text-sm font-medium" @click="isMenuOpen = false">Features</a>
      <a href="#" class="block text-sm font-medium" @click="isMenuOpen = false">Pricing</a>
      <a href="#" class="block text-sm font-medium" @click="isMenuOpen = false">About</a>
      <div class="flex flex-col gap-2 pt-2">
        <Button variant="outline" class="w-full" @click="router.push('/login'); isMenuOpen = false">Log in</Button>
        <Button class="w-full" @click="router.push('/register'); isMenuOpen = false">Get Started</Button>
      </div>
    </div>
  </nav>
</template>

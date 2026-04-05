<script setup lang="ts">
import Logo from '@/components/Logo.vue'
</script>

<template>
  <footer class="border-t py-12 bg-muted/20">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex flex-col md:flex-row justify-between items-center gap-8">
        <div class="flex items-center gap-4 text-muted-foreground">
          <Logo />
          <span class="text-sm">© 2026 All rights reserved.</span>
        </div>
        <div class="flex gap-6 text-sm text-muted-foreground">
          <a href="#" class="hover:text-primary transition-colors">Privacy</a>
          <a href="#" class="hover:text-primary transition-colors">Terms</a>
          <a href="#" class="hover:text-primary transition-colors">Cookies</a>
        </div>
      </div>
    </div>
  </footer>
</template>

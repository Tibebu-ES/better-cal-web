<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import { 
  Clock, 
  Users, 
  Shield, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

const features = [
  {
    title: 'Smart Scheduling',
    description: 'Intelligent algorithms that find the best time for everyone, considering multiple time zones and preferences.',
    icon: Clock,
  },
  {
    title: 'Team Collaboration',
    description: 'Shared calendars and resource management built specifically for modern high-performing teams.',
    icon: Users,
  },
  {
    title: 'Enterprise Security',
    description: 'Bank-grade encryption and granular permissions to keep your scheduling data safe and private.',
    icon: Shield,
  },
]

const benefits = [
  'Unlimited calendar connections',
  'Automated meeting reminders',
  'Custom booking pages',
  'Real-time synchronization',
]
</script>

<template>
  <div class="min-h-screen bg-background text-foreground selection:bg-primary/10 flex flex-col">
    <Navbar />

    <main>
      <!-- Hero Section -->
      <section class="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-32">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div class="text-center max-w-3xl mx-auto">
            <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6">
              Scheduling made <span class="text-primary italic">actually</span> better
            </h1>
            <p class="text-xl text-muted-foreground mb-10 leading-relaxed">
              The professional calendar solution for teams who value their time. 
              Sync everything, schedule faster, and focus on what matters.
            </p>
            <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" class="h-12 px-8 text-base" @click="router.push('/register')">
                Start for Free
                <ArrowRight class="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg" class="h-12 px-8 text-base">
                View Demo
              </Button>
            </div>
          </div>
        </div>
        
        <!-- Background Decoration -->
        <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none overflow-hidden">
          <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px]"></div>
          <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]"></div>
        </div>
      </section>

      <!-- Features Section -->
      <section id="features" class="py-24 bg-muted/30">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Built for productivity</h2>
            <p class="text-muted-foreground max-w-2xl mx-auto">
              Stop fighting with your calendar and start letting it work for you.
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card v-for="feature in features" :key="feature.title" class="border-none shadow-md hover:shadow-lg transition-shadow bg-card">
              <CardHeader>
                <div class="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <component :is="feature.icon" class="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{{ feature.title }}</CardTitle>
                <CardDescription class="text-base pt-2">
                  {{ feature.description }}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <!-- Benefits Section -->
      <section class="py-24">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex flex-col lg:flex-row items-center gap-16">
            <div class="flex-1 space-y-8">
              <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to manage your time
              </h2>
              <div class="space-y-4">
                <div v-for="benefit in benefits" :key="benefit" class="flex items-center gap-3">
                  <CheckCircle2 class="h-5 w-5 text-primary" />
                  <span class="text-lg">{{ benefit }}</span>
                </div>
              </div>
              <Button size="lg" variant="secondary">Explore All Features</Button>
            </div>
            <div class="flex-1 w-full max-w-xl">
              <div class="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border flex items-center justify-center p-8 relative">
                 <!-- Mock UI -->
                 <div class="w-full h-full bg-background rounded-xl shadow-2xl border p-4 space-y-4 overflow-hidden">
                    <div class="h-4 w-1/3 bg-muted rounded"></div>
                    <div class="grid grid-cols-7 gap-2">
                      <div v-for="n in 28" :key="n" class="aspect-square bg-muted/50 rounded flex items-center justify-center text-[10px] text-muted-foreground">
                        {{ n }}
                      </div>
                    </div>
                    <div class="space-y-2">
                      <div class="h-12 w-full bg-primary/10 rounded-lg border-l-4 border-primary p-2">
                        <div class="h-2 w-1/4 bg-primary/20 rounded mb-1"></div>
                        <div class="h-3 w-1/2 bg-primary/40 rounded"></div>
                      </div>
                      <div class="h-12 w-full bg-muted/30 rounded-lg p-2">
                        <div class="h-2 w-1/4 bg-muted rounded mb-1"></div>
                        <div class="h-3 w-1/2 bg-muted/50 rounded"></div>
                      </div>
                    </div>
                 </div>
                 <!-- Floating elements -->
                 <div class="absolute -top-4 -right-4 bg-background p-3 rounded-lg shadow-xl border flex items-center gap-3 animate-bounce">
                    <Users class="h-5 w-5 text-blue-500" />
                    <span class="text-xs font-semibold">Team synced</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-primary text-primary-foreground rounded-3xl mx-4 mb-24 overflow-hidden relative">
        <div class="container mx-auto px-4 text-center relative z-10">
          <h2 class="text-3xl font-bold tracking-tight sm:text-5xl mb-6">
            Ready to reclaim your time?
          </h2>
          <p class="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
            Join over 10,000 professionals using BetterCal to streamline their workday.
          </p>
          <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" variant="secondary" class="h-12 px-8 text-base font-semibold" @click="router.push('/register')">
              Get Started Now
            </Button>
            <Button size="lg" variant="secondary" class="h-12 px-8 text-base ">
              Contact Sales
            </Button>
          </div>
        </div>
        <!-- Decorative blobs -->
        <div class="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-[80px]"></div>
        <div class="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/10 rounded-full blur-[80px]"></div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Optional: smooth scrolling for anchor links */
html {
  scroll-behavior: smooth;
}
</style>
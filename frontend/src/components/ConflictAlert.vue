<template>
  <div v-if="conflicts.length > 0" class="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-200 dark:border-red-800/50 shadow-sm animate-pulse-once">
    <div class="flex">
      <div class="flex-shrink-0">
        <AlertCircleIcon class="h-5 w-5 text-red-500 dark:text-red-400" />
      </div>
      <div class="ml-3 flex-1">
        <h3 class="text-sm font-medium text-red-800 dark:text-red-300">
          Solapamiento Detectado
        </h3>
        <div class="mt-2 text-sm text-red-700 dark:text-red-200/80">
          <p class="mb-2">El horario seleccionado choca con las siguientes citas:</p>
          <ul class="list-disc pl-5 space-y-1">
            <li v-for="conflict in conflicts" :key="conflict._id">
              {{ conflict.patientName }} ({{ conflict.startTime }} - {{ conflict.endTime }})
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircleIcon } from 'lucide-vue-next';
import type { Appointment } from '../types/appointment';

defineProps<{
  conflicts: Appointment[]
}>();
</script>

<style scoped>
.animate-pulse-once {
  animation: pulse-border 1.5s cubic-bezier(0.4, 0, 0.6, 1) 1;
}
@keyframes pulse-border {
  0%, 100% { border-color: inherit; }
  50% { border-color: rgb(239 68 68); }
}
</style>

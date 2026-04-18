<template>
  <div :class="{'dark': isDark}" class="min-h-screen transition-colors duration-300">
    <div class="min-h-screen bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-slate-100 font-sans selection:bg-primary-500/30">
      
      <!-- Navbar Glassmorphism -->
      <nav class="sticky top-0 z-40 glass border-b border-slate-200 dark:border-slate-700/50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <div class="flex-shrink-0 flex items-center gap-2">
                <div class="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                  <ActivityIcon class="w-5 h-5 text-white" />
                </div>
                <span class="font-bold tracking-tight text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                  CitasMed
                </span>
              </div>
            </div>
            <div class="flex items-center space-x-4">
              <button type="button" @click="toggleDark()" aria-label="Alternar modo oscuro" title="Alternar modo oscuro" class="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                <SunIcon v-if="isDark" class="w-5 h-5" />
                <MoonIcon v-else class="w-5 h-5" />
              </button>
              <button @click="openNewForm" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-md shadow-primary-500/20 text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all active:scale-95">
                <PlusIcon class="-ml-1 mr-2 h-4 w-4" />
                Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <!-- Welcome Section -->
        <div class="mb-8">
          <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Gestión de Citas
          </h1>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Administra los horarios de los doctores y pacientes de manera fácil y sin solapamientos.
          </p>
        </div>

        <!-- Componente Principal -->
        <AppointmentList @edit="openEditForm" />
      </main>

      <!-- Modal de Formulario -->
      <AppointmentForm 
        :is-open="isFormOpen" 
        :appointment-to-edit="appointmentToEdit"
        @close="closeForm"
        @saved="onFormSaved"
      />

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useToggle } from '@vueuse/core';
import { MoonIcon, SunIcon, PlusIcon, ActivityIcon } from 'lucide-vue-next';

import AppointmentList from './components/AppointmentList.vue';
import AppointmentForm from './components/AppointmentForm.vue';
import type { Appointment } from './types/appointment';

const isDark = ref(true); // Modo oscuro activado por defecto (Bonus de estética premium)
const toggleDark = useToggle(isDark);

const isFormOpen = ref(false);
const appointmentToEdit = ref<Appointment | null>(null);

const openNewForm = () => {
  appointmentToEdit.value = null;
  isFormOpen.value = true;
};

const openEditForm = (appt: Appointment) => {
  appointmentToEdit.value = appt;
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
};

const onFormSaved = () => {
  // Lista se refresca automáticamente porque el store se enlazó
};

onMounted(() => {
  // Config class en el HTML root para Tailwind oscuro real
  // Pero lo manejamos en el div wrapper por simplicidad visual
});
</script>

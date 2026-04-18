<template>
  <div class="glass rounded-xl overflow-hidden shadow-lg border border-slate-200/60 dark:border-slate-700/60 transition-all">
    <!-- Header y Filtros -->
    <div class="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <CalendarDaysIcon class="w-6 h-6 mr-2 text-primary-500" />
          Listado de Citas
        </h2>
        
        <!-- Filtros -->
        <div class="flex flex-wrap gap-3 w-full sm:w-auto">
          <div class="relative w-full sm:w-48">
            <SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              v-model="filters.doctorName" 
              type="text" 
              placeholder="Buscar doctor..." 
              class="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
            />
          </div>
          
          <div class="flex items-center space-x-2 bg-white dark:bg-dark-bg border border-slate-300 dark:border-slate-600 rounded-lg px-2 focus-within:ring-2 focus-within:ring-primary-500 transition-all">
            <div class="flex flex-col relative">
              <span class="text-[0.65rem] absolute -top-2 left-1 bg-white dark:bg-dark-bg px-1 text-slate-500 font-medium z-10">Desde</span>
              <input 
                v-model="filters.startDate" 
                type="date" 
                class="pt-2 pb-1.5 px-2 text-sm bg-transparent border-none outline-none dark:text-white dark:[color-scheme:dark]"
              />
            </div>
            <span class="text-slate-300 dark:text-slate-600 font-bold">-</span>
            <div class="flex flex-col relative">
              <span class="text-[0.65rem] absolute -top-2 left-1 bg-white dark:bg-dark-bg px-1 text-slate-500 font-medium z-10">Hasta</span>
              <input 
                v-model="filters.endDate" 
                type="date" 
                class="pt-2 pb-1.5 px-2 text-sm bg-transparent border-none outline-none dark:text-white dark:[color-scheme:dark]"
              />
            </div>
          </div>
          
          <select 
            v-model="filters.status" 
            class="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 outline-none transition-all dark:text-white"
          >
            <option value="">Estado: Todos</option>
            <option value="scheduled">Programada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Tabla -->
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
            <th class="px-6 py-4 font-semibold">Paciente</th>
            <th class="px-6 py-4 font-semibold">Doctor</th>
            <th class="px-6 py-4 font-semibold">Fecha y Hora</th>
            <th class="px-6 py-4 font-semibold">Estado</th>
            <th class="px-6 py-4 font-semibold text-right">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
          <tr v-if="loading">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500">
              <Loader2Icon class="w-8 h-8 animate-spin mx-auto text-primary-500 mb-2" />
              Cargando citas...
            </td>
          </tr>
          <tr v-else-if="appointments.length === 0">
            <td colspan="5" class="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
              <InboxIcon class="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-3" />
              No se encontraron citas.
            </td>
          </tr>
          <tr v-else v-for="app in appointments" :key="app._id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
            <td class="px-6 py-4">
              <div class="font-medium text-slate-900 dark:text-slate-100">{{ app.patientName }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs" :title="app.reason">{{ app.reason }}</div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center text-slate-700 dark:text-slate-300">
                <div class="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 flex items-center justify-center text-xs font-bold mr-2">
                  {{ app.doctorName.charAt(0) }}
                </div>
                {{ app.doctorName }}
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-slate-900 dark:text-slate-200 font-medium">{{ formatDate(app.date) }}</div>
              <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center mt-1">
                <ClockIcon class="w-3 h-3 mr-1" />
                {{ app.startTime }} - {{ app.endTime }}
              </div>
            </td>
            <td class="px-6 py-4">
              <Badge :status="app.status">
                {{ translateStatus(app.status) }}
              </Badge>
            </td>
            <td class="px-6 py-4 text-right">
              <div class="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button @click="$emit('edit', app)" class="p-1.5 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded-md transition-colors" title="Editar">
                  <Edit2Icon class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(app._id!)" class="p-1.5 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 rounded-md transition-colors" title="Eliminar">
                  <Trash2Icon class="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div v-if="pagination.total > 0 && !loading" class="px-4 py-3 sm:px-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
      <div class="hidden sm:block">
        <p class="text-sm text-slate-700 dark:text-slate-300">
          Mostrando página <span class="font-medium text-slate-900 dark:text-white">{{ pagination.page }}</span> de <span class="font-medium text-slate-900 dark:text-white">{{ pagination.totalPages || 1 }}</span>
          (Total: <span class="font-medium">{{ pagination.total }}</span> citas)
        </p>
      </div>
      <div class="flex-1 flex justify-between sm:justify-end gap-2">
        <button 
          @click="store.setPage(pagination.page - 1)" 
          :disabled="pagination.page <= 1"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Anterior
        </button>
        <button 
          @click="store.setPage(pagination.page + 1)" 
          :disabled="pagination.page >= pagination.totalPages"
          class="relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { 
  CalendarDaysIcon, SearchIcon, ClockIcon, Edit2Icon, Trash2Icon, Loader2Icon, InboxIcon 
} from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import Badge from './ui/Badge.vue';
import { useAppointmentStore } from '../stores/appointmentStore';

defineEmits(['edit']);

const store = useAppointmentStore();
const { appointments, loading, filters, pagination } = storeToRefs(store);

// Cargar inicial
onMounted(() => {
  store.fetchAppointments();
});

// Debounce para los filtros (buscar text)
const applyFilters = useDebounceFn(() => {
  store.fetchAppointments();
}, 300);

// Observamos cambios explícitos
watch(filters, () => {
  store.pagination.page = 1; // Al aplicar filtros forzamos retorno a la página 1
  applyFilters();
}, { deep: true });

const formatDate = (dateArg: string | Date) => {
  try {
    const rawStr = typeof dateArg === 'string' ? dateArg : String((dateArg as Date).toISOString());
    const tParts = rawStr.split('T');
    const dateStr = tParts[0] || "";
    
    // Extracción tolerante para la directiva noUncheckedIndexedAccess de TS
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateArg;
    
    const pYear = parts[0] || "";
    const pMonth = parts[1] || "";
    const pDay = parts[2] || "";
    
    const year = parseInt(pYear, 10);
    const month = parseInt(pMonth, 10);
    const day = parseInt(pDay, 10);
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return dateArg;

    const localDate = new Date(year, month - 1, day);
    
    return format(localDate, "dd MMM, yyyy", { locale: es });
  } catch {
    return dateArg;
  }
};

const translateStatus = (st: string) => {
  const map: Record<string, string> = {
    'scheduled': 'Programada',
    'completed': 'Completada',
    'cancelled': 'Cancelada'
  };
  return map[st] || st;
};

const confirmDelete = async (id: string) => {
  if (confirm("¿Estás seguro de eliminar esta cita de forma permanente?")) {
    await store.deleteAppointment(id);
  }
};
</script>

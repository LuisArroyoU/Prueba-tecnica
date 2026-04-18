<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
    <div class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="close"></div>
    
    <div class="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all border border-slate-200 dark:border-slate-700 relative z-10 glass">
      
      <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 class="text-xl font-semibold text-slate-800 dark:text-slate-100">
          {{ isEditing ? 'Editar Cita' : 'Nueva Cita' }}
        </h2>
        <button @click="close" class="text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
          <XIcon class="h-5 w-5" />
        </button>
      </div>

      <form @submit.prevent="submit" class="p-6 space-y-4">
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Paciente</label>
          <input v-model="form.patientName" required type="text" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Nombre completo" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Doctor</label>
          <input v-model="form.doctorName" required type="text" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Ej. Dr. García" />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
          <input v-model="form.date" :min="today" required type="date" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:[color-scheme:dark]" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora Inicio</label>
            <input v-model="form.startTime" required type="time" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:[color-scheme:dark]" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hora Fin</label>
            <input v-model="form.endTime" required type="time" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:[color-scheme:dark]" />
          </div>
        </div>

        <!-- Alerta de Conflictos Reactiva -->
        <ConflictAlert v-if="realtimeConflicts.length > 0" :conflicts="realtimeConflicts" />
        
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo</label>
          <textarea v-model="form.reason" required rows="3" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all" placeholder="Breve descripción del motivo..."></textarea>
        </div>

        <div v-if="isEditing">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
          <select v-model="form.status" class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-dark-bg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all">
            <option value="scheduled">Programada</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        
        <div class="pt-4 flex justify-end space-x-3">
          <button type="button" @click="close" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium transition-colors">
            Cancelar
          </button>
          <button type="submit" :disabled="isChecking || realtimeConflicts.length > 0 || isSaving" class="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium shadow-md shadow-primary-500/20 transition-all disabled:opacity-50 flex items-center">
            <Loader2Icon v-if="isSaving" class="animate-spin -ml-1 mr-2 h-4 w-4" />
            Guardar Cita
          </button>
        </div>
      </form>
      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { XIcon, Loader2Icon } from 'lucide-vue-next';
import { useDebounceFn } from '@vueuse/core';
import ConflictAlert from './ConflictAlert.vue';
import { api } from '../services/api';
import { useAppointmentStore } from '../stores/appointmentStore';
import type { Appointment } from '../types/appointment';

const props = defineProps<{
  isOpen: boolean;
  appointmentToEdit?: Appointment | null;
}>();

const emit = defineEmits(['close', 'saved']);
const store = useAppointmentStore();

const defaultForm: Appointment = {
  patientName: '',
  doctorName: '',
  date: '',
  startTime: '',
  endTime: '',
  reason: '',
  status: 'scheduled'
};

const form = ref<Appointment>({...defaultForm});
const isSaving = ref(false);
const isChecking = ref(false);
const realtimeConflicts = ref<Appointment[]>([]);

const isEditing = computed(() => !!props.appointmentToEdit);

// Fecha de hoy formato YYYY-MM-DD para restringir el input
const today = computed(() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.appointmentToEdit) {
      // Extraemos la fecha directamente del string ISO para evitar timezone shifts
      const dateStr = String(props.appointmentToEdit.date).split('T')[0] || '';
      form.value = { ...props.appointmentToEdit, date: dateStr };
    } else {
      form.value = { ...defaultForm };
    }
    realtimeConflicts.value = [];
  }
});

// Usamos vueuse para debouncing la validación mientras teclea
const checkConflicts = useDebounceFn(async () => {
  if (!form.value.doctorName || !form.value.date || !form.value.startTime || !form.value.endTime) {
    realtimeConflicts.value = [];
    return;
  }
  
  if (form.value.startTime >= form.value.endTime) {
    return; // Evitamos llamada inútil
  }

  isChecking.value = true;
  try {
    const res = await api.checkConflicts(
      form.value.doctorName,
      form.value.date as string,
      form.value.startTime,
      form.value.endTime,
      isEditing.value ? form.value._id : undefined
    );
    realtimeConflicts.value = res.conflicts || [];
  } catch (e) {
    console.error("Error comprobando solapamientos", e);
  } finally {
    isChecking.value = false;
  }
}, 500);

// Observamos dependencias críticas para la lógica de negocio
watch([() => form.value.doctorName, () => form.value.date, () => form.value.startTime, () => form.value.endTime], () => {
  checkConflicts();
});

const close = () => {
  emit('close');
};

const submit = async () => {
  isSaving.value = true;
  // A nivel store
  let res;
  if (isEditing.value) {
    res = await store.updateAppointment(form.value._id!, form.value);
  } else {
    res = await store.createAppointment(form.value);
  }

  isSaving.value = false;
  if (res.success) {
    emit('saved');
    close();
  } else if (res.conflicts) {
    realtimeConflicts.value = res.conflicts;
  } else {
    alert(res.message);
  }
};
</script>

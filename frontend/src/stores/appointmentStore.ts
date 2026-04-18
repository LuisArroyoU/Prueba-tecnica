import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';
import type { Appointment } from '../types/appointment';

export const useAppointmentStore = defineStore('appointments', () => {
  const appointments = ref<Appointment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Filters
  const filters = ref({
    startDate: '',
    endDate: '',
    doctorName: '',
    status: ''
  });

  // Paginación
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchAppointments = async () => {
    loading.value = true;
    error.value = null;
    try {
      const res = await api.getAppointments(filters.value, pagination.value.page, pagination.value.limit);
      appointments.value = res.data;
      pagination.value = res.meta;
    } catch (err) {
      const e = err as { message: string, status?: number, data?: { message?: string, conflicts?: Appointment[] } };
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const createAppointment = async (appt: Appointment) => {
    loading.value = true;
    error.value = null;
    try {
      const newAppt = await api.createAppointment(appt);
      await fetchAppointments(); // Forzamos recarga para que la paginación ordene y calcule correctament
      return { success: true, data: newAppt };
    } catch (err) {
      const e = err as { message: string, status?: number, data?: { message?: string, conflicts?: Appointment[] } };
      if (e.status === 409) return { success: false, conflicts: e.data?.conflicts, message: e.data?.message };
      return { success: false, message: e.data?.message || 'Error desconocido' };
    } finally {
      loading.value = false;
    }
  };

  const updateAppointment = async (id: string, appt: Appointment) => {
    loading.value = true;
    error.value = null;
    try {
      const updated = await api.updateAppointment(id, appt);
      const index = appointments.value.findIndex(a => a._id === id);
      if (index !== -1) appointments.value[index] = updated;
      return { success: true, data: updated };
    } catch (err) {
      const e = err as { message: string, status?: number, data?: { message?: string, conflicts?: Appointment[] } };
      if (e.status === 409) return { success: false, conflicts: e.data?.conflicts, message: e.data?.message };
      return { success: false, message: e.data?.message || 'Error desconocido' };
    } finally {
      loading.value = false;
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await api.deleteAppointment(id);
      await fetchAppointments(); // Recargar la página actual para rellenar huecos
    } catch (err) {
      const e = err as { message: string, status?: number, data?: { message?: string, conflicts?: Appointment[] } };
      error.value = e.message;
    }
  };

  const setPage = (newPage: number) => {
    pagination.value.page = newPage;
    fetchAppointments();
  };

  return {
    appointments,
    loading,
    error,
    filters,
    pagination,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    setPage
  };
});

import type { Appointment, ConflictResponse, PaginatedResponse } from '../types/appointment';

const BASE_URL = 'http://localhost:3000/api/appointments';

export const api = {
  async getAppointments(filters?: Record<string, string>, page = 1, limit = 10): Promise<PaginatedResponse<Appointment>> {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    const response = await fetch(`${BASE_URL}?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener citas');
    return response.json();
  },

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, data };
    return data;
  },

  async updateAppointment(id: string, appointment: Appointment): Promise<Appointment> {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(appointment),
    });
    const data = await response.json();
    if (!response.ok) throw { status: response.status, data };
    return data;
  },

  async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Error al eliminar');
  },

  async checkConflicts(doctorName: string, date: string, startTime: string, endTime: string, excludeId?: string): Promise<ConflictResponse> {
    const params = new URLSearchParams({ doctorName, date, startTime, endTime });
    if (excludeId) params.append('excludeId', excludeId);
    
    const response = await fetch(`${BASE_URL}/conflicts/check?${params.toString()}`);
    if (!response.ok) throw new Error('Error verificando solapamiento');
    return response.json();
  }
};

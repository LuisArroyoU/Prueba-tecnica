export interface Appointment {
  _id?: string;
  patientName: string;
  doctorName: string;
  date: string | Date;
  startTime: string;
  endTime: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

export interface ConflictResponse {
  hasConflicts: boolean;
  conflicts: Appointment[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

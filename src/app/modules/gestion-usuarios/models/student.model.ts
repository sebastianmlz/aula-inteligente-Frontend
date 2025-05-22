import { User } from "./user.model";

export interface Student {
  id?: string; // Puede ser 'id' o 'student_id' según la API
  user: User;
  student_id: string;
  enrollment_date?: string;
  parent_name?: string;
  parent_contact?: string;
  parent_email?: string;
  emergency_contact?: string;
  academic_metrics?: {
    current_average: number;
    attendance_percentage: number;
  };
}
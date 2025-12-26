
export interface RegistrationData {
  id: string; // Used as unique key (Employee ID)
  name: string;
  employeeId: string;
  recommendedProgram: string;
  personalProgram: string;
  timestamp: string;
}

export type ViewRole = 'employee' | 'admin';

export interface AppState {
  role: ViewRole;
  isLoggedIn: boolean;
  currentEmployeeId?: string;
}

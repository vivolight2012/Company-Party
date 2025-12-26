
export interface RegistrationData {
  id: string; // Used as unique key (Employee ID)
  name: string;
  employeeId: string;
  department: string;
  recommendedProgram: string;
  programName: string;
  programType: '唱歌' | '跳舞' | '小品' | '弹奏' | '其他';
  participantCount: '单人' | '多人';
  participantList?: string;
  timestamp: string;
}

export type ViewRole = 'employee' | 'admin';

export interface AppState {
  role: ViewRole;
  isLoggedIn: boolean;
  currentEmployeeId?: string;
}
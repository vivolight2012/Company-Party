
import { RegistrationData } from '../types';

const STORAGE_KEY = 'annual_meeting_registrations_2026';

export const getRegistrations = (): RegistrationData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveRegistration = (data: RegistrationData): void => {
  const registrations = getRegistrations();
  const index = registrations.findIndex(r => r.employeeId === data.employeeId);
  
  if (index >= 0) {
    registrations[index] = data;
  } else {
    registrations.push(data);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
};

export const getRegistrationByEmployeeId = (id: string): RegistrationData | undefined => {
  const registrations = getRegistrations();
  return registrations.find(r => r.employeeId === id);
};

export const exportToCSV = (data: RegistrationData[]) => {
  const headers = ['姓名', '工号', '节目推荐', '个人报名节目', '报名时间'];
  const rows = data.map(r => [
    r.name,
    r.employeeId,
    `"${r.recommendedProgram.replace(/"/g, '""')}"`,
    `"${r.personalProgram.replace(/"/g, '""')}"`,
    r.timestamp
  ]);

  const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `2026年会报名数据_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

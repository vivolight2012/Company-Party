
import { RegistrationData } from '../types';

/**
 * 💡 配置说明：
 * 部署 Google Apps Script 后，将生成的 Web App URL 粘贴在下方。
 * 如果为空，系统将自动使用浏览器的 localStorage（仅限本机）。
 */
const API_ENDPOINT = ''; 

const STORAGE_KEY = 'annual_meeting_registrations_2026';

// 内部辅助函数：本地降级方案
const getLocalRegistrations = (): RegistrationData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const getRegistrations = async (): Promise<RegistrationData[]> => {
  if (!API_ENDPOINT) {
    return getLocalRegistrations();
  }
  
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ action: 'getAll' }),
      mode: 'cors'
    });
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return getLocalRegistrations();
  }
};

export const saveRegistration = async (data: RegistrationData): Promise<boolean> => {
  if (!API_ENDPOINT) {
    const registrations = getLocalRegistrations();
    const index = registrations.findIndex(r => r.employeeId === data.employeeId);
    if (index >= 0) registrations[index] = data;
    else registrations.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
    return true;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      body: JSON.stringify({ action: 'save', registration: data }),
      mode: 'cors'
    });
    const result = await response.json();
    return result.result === 'success';
  } catch (error) {
    console.error('Save error:', error);
    return false;
  }
};

export const getRegistrationByEmployeeId = async (id: string): Promise<RegistrationData | undefined> => {
  const registrations = await getRegistrations();
  return registrations.find(r => r.employeeId === id);
};

export const exportToCSV = (data: RegistrationData[]) => {
  const headers = ['姓名', '工号', '部门', '节目推荐', '节目名称', '节目类型', '参演人数', '参演人员名单', '报名时间'];
  const rows = data.map(r => [
    r.name,
    r.employeeId,
    r.department,
    `"${(r.recommendedProgram || '').replace(/"/g, '""')}"`,
    `"${(r.programName || '').replace(/"/g, '""')}"`,
    r.programType,
    r.participantCount,
    `"${(r.participantList || '').replace(/"/g, '""')}"`,
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

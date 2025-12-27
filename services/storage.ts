
import { RegistrationData } from '../types';

/**
 * 💡 Supabase 客户端单例初始化
 */
declare var supabase: any;
declare var SUPABASE_CONFIG: { url: string; anonKey: string };

let supabaseClient: any = null;

const getSupabaseStatus = () => {
  const isDefaultUrl = !SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('你的项目ID') || SUPABASE_CONFIG.url.includes('example');
  const isDefaultKey = !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('你的匿名Key');
  
  if (typeof supabase === 'undefined') return 'missing_sdk';
  if (isDefaultUrl || isDefaultKey) return 'initial_state'; 
  return 'configured';
};

const getSupabase = () => {
  if (supabaseClient) return supabaseClient;
  
  const status = getSupabaseStatus();
  if (status !== 'configured') return null;
  
  try {
    if (supabase && typeof supabase.createClient === 'function') {
      supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      return supabaseClient;
    }
    return null;
  } catch (e) {
    console.error('Supabase 初始化异常:', e);
    return null;
  }
};

const TABLE_NAME = 'annual_party_list';
const STORAGE_KEY = 'annual_meeting_registrations_2026_fallback';

const getLocalRegistrations = (): RegistrationData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveToLocal = (reg: RegistrationData) => {
  const registrations = getLocalRegistrations();
  const index = registrations.findIndex(r => r.employeeId === reg.employeeId);
  if (index >= 0) {
    registrations[index] = reg;
  } else {
    registrations.push(reg);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
};

/**
 * 1. 获取报名数据 (合并本地与云端)
 */
export const getRegistrations = async (): Promise<RegistrationData[]> => {
  const localData = getLocalRegistrations();
  const client = getSupabase();
  
  if (!client) return localData;

  try {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('*')
      .order('timestamp', { ascending: false });

    if (error) {
      console.warn('云端查询返回错误 (可能表未创建):', error.message);
      return localData;
    }

    const cloudData: RegistrationData[] = (data || []).map((item: any) => ({
      name: item.name,
      employeeId: item.employee_id,
      department: item.department,
      recommendedProgram: item.recommended_program,
      programName: item.program_name,
      programType: item.program_type,
      participantCount: item.participant_count,
      participantList: item.participant_list,
      timestamp: item.timestamp,
      id: item.employee_id
    }));

    // 合并逻辑：以云端为准
    return cloudData;
  } catch (error) {
    return localData;
  }
};

/**
 * 2. 核心保存函数
 */
export const saveRegistration = async (reg: RegistrationData): Promise<{
  success: boolean, 
  mode: 'cloud' | 'local', 
  reason?: 'unconfigured' | 'network_error' | 'database_error'
}> => {
  saveToLocal(reg);
  const client = getSupabase();
  if (!client) return { success: true, mode: 'local', reason: 'unconfigured' };

  try {
    const payload = {
      employee_id: String(reg.employeeId || ''),
      name: String(reg.name || ''),
      department: String(reg.department || ''),
      program_name: String(reg.programName || ''),
      program_type: String(reg.programType || '其他'),
      participant_count: String(reg.participantCount || '单人'),
      participant_list: String(reg.participantList || ''),
      recommended_program: String(reg.recommendedProgram || ''),
      timestamp: String(reg.timestamp || new Date().toLocaleString())
    };

    const { error } = await client.from(TABLE_NAME).upsert(payload, { onConflict: 'employee_id' });
    if (error) throw error;
    return { success: true, mode: 'cloud' };
  } catch (error: any) {
    return { success: true, mode: 'local', reason: 'database_error' };
  }
};

/**
 * 3. 删除报名信息
 */
export const deleteRegistration = async (employeeId: string): Promise<boolean> => {
  // 从本地删除
  const localData = getLocalRegistrations();
  const filtered = localData.filter(r => r.employeeId !== employeeId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  const client = getSupabase();
  if (!client) return true;

  try {
    const { error } = await client
      .from(TABLE_NAME)
      .delete()
      .eq('employee_id', employeeId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('云端删除失败:', error);
    return false;
  }
};

export const getRegistrationByEmployeeId = async (id: string): Promise<RegistrationData | undefined> => {
  const registrations = await getRegistrations();
  return registrations.find(r => r.employeeId === id);
};

export const exportToCSV = (data: RegistrationData[]) => {
  const headers = ['序号', '工号', '姓名', '部门', '节目名称', '人数', '表演类型', '建议', '最后更新'];
  const rows = data.map((r, index) => [
    index + 1,
    r.employeeId,
    r.name,
    r.department,
    `"${(r.programName || '').replace(/"/g, '""')}"`,
    r.participantCount,
    r.programType,
    `"${(r.recommendedProgram || '').replace(/"/g, '""')}"`,
    r.timestamp
  ]);

  const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `2026年会报名导出_${new Date().getTime()}.csv`);
  link.click();
};

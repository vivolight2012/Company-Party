
import { RegistrationData } from '../types';

/**
 * 💡 Supabase 客户端初始化逻辑
 */
declare var supabase: any;
declare var SUPABASE_CONFIG: { url: string; anonKey: string };

const getSupabaseStatus = () => {
  const isDefaultUrl = !SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('你的项目ID') || SUPABASE_CONFIG.url.includes('example');
  const isDefaultKey = !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('你的匿名Key');
  const isInvalidKeyFormat = SUPABASE_CONFIG.anonKey.length < 50;

  if (typeof supabase === 'undefined') return 'missing_sdk';
  if (isDefaultUrl || isDefaultKey || isInvalidKeyFormat) return 'initial_state'; 
  return 'configured';
};

const getSupabase = () => {
  const status = getSupabaseStatus();
  if (status !== 'configured') return null;
  
  try {
    if (supabase && typeof supabase.createClient === 'function') {
      return supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    }
    return null;
  } catch (e) {
    console.error('Supabase 客户端初始化异常:', e);
    return null;
  }
};

const TABLE_NAME = 'annual_party_list';
const STORAGE_KEY = 'annual_meeting_registrations_2026_fallback';

// 获取本地存储数据
const getLocalRegistrations = (): RegistrationData[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

// 保存到本地存储
const saveToLocal = (reg: RegistrationData) => {
  const registrations = getLocalRegistrations();
  const index = registrations.findIndex(r => r.employeeId === reg.employeeId);
  if (index >= 0) registrations[index] = reg;
  else registrations.push(reg);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
};

/**
 * 1. 获取全量报名数据
 */
export const getRegistrations = async (): Promise<RegistrationData[]> => {
  const localData = getLocalRegistrations();
  const client = getSupabase();
  
  if (!client) return localData;

  try {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('*');

    if (error) {
      console.error('Supabase 查询失败:', error.message, error.hint);
      throw error;
    }

    const cloudData = (data || []).map((item: any) => ({
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
    const combined = [...cloudData];
    localData.forEach(l => {
      if (!combined.find(c => c.employeeId === l.employeeId)) {
        combined.push(l);
      }
    });
    return combined;
  } catch (error) {
    console.warn('读取云端数据失败，切换至全本地模式');
    return localData;
  }
};

/**
 * 2. 核心保存函数
 */
export const saveRegistration = async (reg: RegistrationData): Promise<{
  success: boolean, 
  mode: 'cloud' | 'local', 
  reason?: 'unconfigured' | 'network_error' | 'database_error' | 'invalid_config'
}> => {
  // 1. 优先本地保存，防止任何故障导致数据丢失
  saveToLocal(reg);
  
  const configStatus = getSupabaseStatus();
  if (configStatus === 'initial_state') {
    return { success: true, mode: 'local' };
  }

  const client = getSupabase();
  if (!client) {
    return { success: true, mode: 'local', reason: 'invalid_config' };
  }

  try {
    // 2. 尝试同步云端
    const { error } = await client
      .from(TABLE_NAME)
      .upsert({
        employee_id: reg.employeeId,
        name: reg.name,
        department: reg.department,
        program_name: reg.programName,
        program_type: reg.programType,
        participant_count: reg.participantCount,
        participant_list: reg.participantList,
        recommended_program: reg.recommendedProgram,
        timestamp: reg.timestamp
      }, { onConflict: 'employee_id' });

    if (error) {
      console.error('Supabase Upsert Error:', error.code, error.message);
      throw error;
    }
    
    return { success: true, mode: 'cloud' };
  } catch (error: any) {
    const isNetworkError = error.message?.includes('fetch') || error.code === 'PGRST301';
    return { 
      success: true, 
      mode: 'local', 
      reason: isNetworkError ? 'network_error' : 'database_error' 
    };
  }
};

export const getRegistrationByEmployeeId = async (id: string): Promise<RegistrationData | undefined> => {
  const registrations = await getRegistrations();
  return registrations.find(r => r.employeeId === id);
};

export const exportToCSV = (data: RegistrationData[]) => {
  // 列顺序：序号、工号、姓名、部门、节目名称、人数、表演类型、建议、最后更新
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
  link.setAttribute("download", `年会报名导出_${new Date().getTime()}.csv`);
  link.click();
};

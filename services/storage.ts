
import { RegistrationData } from '../types';

/**
 * 💡 Supabase 客户端初始化
 * 增加对占位符的检查，防止无效的 API 调用
 */
declare var supabase: any;
declare var SUPABASE_CONFIG: { url: string; anonKey: string };

const getSupabase = () => {
  const isDefaultUrl = !SUPABASE_CONFIG.url || SUPABASE_CONFIG.url.includes('你的项目ID');
  const isDefaultKey = !SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.anonKey.includes('你的匿名Key');
  
  if (typeof supabase === 'undefined' || isDefaultUrl || isDefaultKey) {
    // 只有在明确配置了有效 URL 时才启用云端模式
    return null;
  }
  
  try {
    return supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
  } catch (e) {
    console.error('Supabase client init error:', e);
    return null;
  }
};

const TABLE_NAME = 'annual_party_list';
const STORAGE_KEY = 'annual_meeting_registrations_2026_fallback';

// 获取本地降级存储数据
const getLocalRegistrations = (): RegistrationData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
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
 * 3. 实现 fetchData 函数：从 Supabase 读取数据，并合并本地数据
 */
export const getRegistrations = async (): Promise<RegistrationData[]> => {
  const localData = getLocalRegistrations();
  const client = getSupabase();
  
  if (!client) return localData;

  try {
    const { data, error } = await client
      .from(TABLE_NAME)
      .select('*');

    if (error) throw error;

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

    // 合并策略：以工号为准，如果本地有更新的（或者云端没有的），以本地/云端去重合并
    const combined = [...cloudData];
    localData.forEach(l => {
      if (!combined.find(c => c.employeeId === l.employeeId)) {
        combined.push(l);
      }
    });
    return combined;
  } catch (error) {
    console.error('Supabase fetch error, using local data:', error);
    return localData;
  }
};

/**
 * 2. 实现 submitData 函数：优先发送到 Supabase，失败则仅保存至本地
 */
export const saveRegistration = async (reg: RegistrationData): Promise<{success: boolean, mode: 'cloud' | 'local'}> => {
  // 无论如何先保存在本地，防止数据丢失
  saveToLocal(reg);
  
  const client = getSupabase();
  if (!client) {
    return { success: true, mode: 'local' };
  }

  try {
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

    if (error) throw error;
    return { success: true, mode: 'cloud' };
  } catch (error) {
    console.error('Supabase submit error, saved to local only:', error);
    // 云端失败但本地已存，返回成功并告知模式
    return { success: true, mode: 'local' };
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
  link.setAttribute("download", `2026年会报名数据_导出_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

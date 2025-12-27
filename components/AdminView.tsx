
import React, { useState, useEffect } from 'react';
import { getRegistrations, exportToCSV } from '../services/storage';
import { RegistrationData } from '../types';

export const AdminView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [registrations, setRegistrations] = useState<RegistrationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllData = async () => {
    setIsLoading(true);
    const data = await getRegistrations();
    setRegistrations(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const filteredData = registrations.filter(
    r => (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
         (r.employeeId || '').includes(searchTerm) ||
         (r.department || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto mt-8 p-6 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">信息管理后台</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-slate-400 text-sm">云端实时同步，当前报名：<span className="text-white font-semibold">{registrations.length}</span> 人</p>
            <button 
              onClick={fetchAllData}
              className={`text-indigo-400 hover:text-indigo-300 p-1 transition-all ${isLoading ? 'animate-spin' : ''}`}
              title="手动刷新"
            >
              🔄
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="搜索姓名、工号或部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64 text-white"
          />
          <button
            onClick={() => exportToCSV(registrations)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
          >
            导出 CSV
          </button>
          <button 
            onClick={onLogout}
            className="text-sm text-slate-400 hover:text-white transition-colors ml-2"
          >
            退出
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700 min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">加载云端数据...</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 text-slate-300 font-medium whitespace-nowrap">
              <tr>
                <th className="px-4 py-4 text-center">序号</th>
                <th className="px-4 py-4">工号</th>
                <th className="px-4 py-4">姓名</th>
                <th className="px-4 py-4">部门</th>
                <th className="px-4 py-4">节目名称</th>
                <th className="px-4 py-4 text-center">人数</th>
                <th className="px-4 py-4">表演类型</th>
                <th className="px-4 py-4">建议</th>
                <th className="px-4 py-4">最后更新</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredData.length > 0 ? (
                filteredData.map((reg, index) => (
                  <tr key={reg.employeeId} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-4 text-slate-500 font-mono text-center">{index + 1}</td>
                    <td className="px-4 py-4 text-slate-400 font-mono">{reg.employeeId}</td>
                    <td className="px-4 py-4 font-medium text-white">{reg.name}</td>
                    <td className="px-4 py-4 text-slate-300">{reg.department}</td>
                    <td className="px-4 py-4">
                      <div className="text-indigo-200 font-medium">{reg.programName}</div>
                      {reg.participantCount === '多人' && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]" title={reg.participantList}>
                          名单: {reg.participantList}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${reg.participantCount === '单人' ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                        {reg.participantCount}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 rounded bg-slate-800 text-xs text-indigo-300 border border-slate-700">{reg.programType}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-400 max-w-[150px]">
                      <div className="truncate text-xs italic" title={reg.recommendedProgram}>
                        {reg.recommendedProgram || '-'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-[10px] text-slate-500 font-mono">{reg.timestamp}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500 italic">
                    暂无报名记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

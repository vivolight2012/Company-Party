
import React, { useState, useMemo } from 'react';
import { getRegistrations, exportToCSV } from '../services/storage';

export const AdminView: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const registrations = useMemo(() => getRegistrations(), []);

  const filteredData = registrations.filter(
    r => r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         r.employeeId.includes(searchTerm) ||
         r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto mt-8 p-6 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-indigo-400">管理控制台</h2>
          <p className="text-slate-400 text-sm mt-1">当前已报名总人数：<span className="text-white font-semibold">{registrations.length}</span></p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="搜索姓名、工号或部门..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full md:w-64"
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

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800/80 text-slate-300 font-medium">
            <tr>
              <th className="px-6 py-4">姓名</th>
              <th className="px-6 py-4">工号/部门</th>
              <th className="px-6 py-4">节目名称</th>
              <th className="px-6 py-4">类型/人数</th>
              <th className="px-6 py-4">节目推荐</th>
              <th className="px-6 py-4">报名时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {filteredData.length > 0 ? (
              filteredData.map((reg) => (
                <tr key={reg.employeeId} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{reg.name}</td>
                  <td className="px-6 py-4">
                    <div className="text-slate-400">{reg.employeeId}</div>
                    <div className="text-xs text-slate-500">{reg.department}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <div>{reg.programName}</div>
                    {reg.participantCount === '多人' && (
                       <div className="text-xs text-slate-500 italic mt-1 max-w-[150px] truncate" title={reg.participantList}>
                         成员: {reg.participantList}
                       </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-300">
                    <span className="px-2 py-1 rounded bg-slate-800 text-xs mr-1">{reg.programType}</span>
                    <span className="text-xs text-slate-500">{reg.participantCount}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 max-w-[150px] truncate">{reg.recommendedProgram || '-'}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{reg.timestamp}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                  未找到匹配的报名记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
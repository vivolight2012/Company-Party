
import React, { useState, useEffect } from 'react';
import { RegistrationData } from '../types';
import { saveRegistration, getRegistrationByEmployeeId } from '../services/storage';

interface EmployeeViewProps {
  initialId: string;
  onLogout: () => void;
}

const DEPARTMENTS = ['研发', '生产', '质量', '客服', '销售', '市场', '人资', '财务'];

export const EmployeeView: React.FC<EmployeeViewProps> = ({ initialId, onLogout }) => {
  const [formData, setFormData] = useState<Omit<RegistrationData, 'timestamp' | 'id'>>({
    name: '',
    employeeId: initialId,
    department: '',
    recommendedProgram: '',
    programName: '',
    programType: '唱歌',
    participantCount: '单人',
    participantList: '',
  });
  const [isViewMode, setIsViewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning', text: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const checkExisting = async () => {
      setIsLoading(true);
      try {
        const existing = await getRegistrationByEmployeeId(initialId);
        if (existing) {
          setFormData({
            name: existing.name,
            employeeId: existing.employeeId,
            department: existing.department || '',
            recommendedProgram: existing.recommendedProgram,
            programName: existing.programName,
            programType: existing.programType,
            participantCount: existing.participantCount,
            participantList: existing.participantList || '',
          });
          setLastUpdated(existing.timestamp);
          setIsViewMode(true);
        }
      } catch (e) {
        console.error("加载数据失败:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkExisting();
  }, [initialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employeeId.trim() || !formData.department) {
      setMessage({ type: 'error', text: '请填写姓名、工号和部门' });
      return;
    }

    setIsSubmitting(true);
    const timestamp = new Date().toLocaleString();
    
    const result = await saveRegistration({
      ...formData,
      id: formData.employeeId,
      timestamp: timestamp,
    } as RegistrationData);

    setIsSubmitting(false);

    if (result.success) {
      setLastUpdated(timestamp);
      
      if (result.mode === 'cloud') {
        setMessage({ type: 'success', text: '✨ 报名成功！云端已实时同步' });
      } else if (!result.reason) {
        setMessage({ type: 'success', text: '✅ 保存成功！(已存至本地缓存)' });
      } else if (result.reason === 'network_error') {
        setMessage({ type: 'warning', text: '📡 网络不稳定，数据已暂存本地' });
      } else {
        setMessage({ type: 'warning', text: '⚠️ 云端同步异常，已为您保存至本地' });
      }
      
      setTimeout(() => {
        setMessage(null);
        setIsViewMode(true);
      }, 2500);
    } else {
      setMessage({ type: 'error', text: '❌ 提交失败，请重试' });
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-12 glass rounded-2xl flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase">Fetching Data...</p>
      </div>
    );
  }

  if (isViewMode) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
          <div>
            <h2 className="text-2xl font-black text-green-400 flex items-center gap-2">
              <span className="text-xl">✅</span> 报名信息已确认
            </h2>
            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-mono">Last Update: {lastUpdated}</p>
          </div>
          <button 
            onClick={() => setIsViewMode(false)}
            className="text-[10px] font-bold text-blue-400 hover:text-blue-300 transition-all bg-blue-400/10 px-3 py-1.5 rounded-lg border border-blue-400/20 uppercase"
          >
            Edit Record
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Name / 姓名</span>
              <span className="text-lg text-white font-medium">{formData.name}</span>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Staff ID / 工号</span>
              <span className="text-lg text-white font-mono">{formData.employeeId}</span>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Dept. / 部门</span>
              <span className="text-lg text-white font-medium">{formData.department}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 text-blue-400">Program / 节目名称</span>
              <span className="text-md text-white font-medium">{formData.programName}</span>
            </div>
            <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
              <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Type / 表演类型</span>
              <span className="text-md text-indigo-300 font-medium">{formData.programType}</span>
            </div>
          </div>

          <div className="bg-slate-900/40 p-5 rounded-xl border border-white/5">
            <span className="block text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2">Suggestions / 建议</span>
            <p className="text-slate-300 text-sm leading-relaxed italic">"{formData.recommendedProgram || '暂无建议。'}"</p>
          </div>

          <div className="pt-6 border-t border-white/5">
            <button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-xl shadow-lg shadow-emerald-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase text-xs tracking-[0.2em]"
            >
              <span>Done</span>
              <span className="opacity-70 font-normal">/ 退出登录</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-8 glass rounded-[2rem] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">年会报名登记</h2>
          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-[0.3em] font-mono">Vivolight · 2026 Gala Registration</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Name / 姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-900/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-700"
              placeholder="请输入姓名"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Staff ID / 工号</label>
            <input
              type="text"
              value={formData.employeeId}
              disabled
              className="w-full bg-slate-800/20 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dept. / 部门</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full bg-slate-900/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white appearance-none"
              required
            >
              <option value="" disabled className="bg-slate-900">请选择部门</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept} className="bg-slate-900">{dept}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Participants / 人数</label>
            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="participantCount"
                  value="单人"
                  checked={formData.participantCount === '单人'}
                  onChange={() => setFormData(prev => ({ ...prev, participantCount: '单人' }))}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-white/10 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">单人</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="participantCount"
                  value="多人"
                  checked={formData.participantCount === '多人'}
                  onChange={() => setFormData(prev => ({ ...prev, participantCount: '多人' }))}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-white/10 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400 group-hover:text-white transition-colors">多人</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Program Name / 节目名称</label>
            <input
              type="text"
              value={formData.programName}
              onChange={(e) => setFormData(prev => ({ ...prev, programName: e.target.value }))}
              className="w-full bg-slate-900/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-700"
              placeholder="请输入节目名称"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Performance Type / 表演类型</label>
            <select
              value={formData.programType}
              onChange={(e) => setFormData(prev => ({ ...prev, programType: e.target.value as any }))}
              className="w-full bg-slate-900/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white appearance-none"
            >
              <option value="唱歌" className="bg-slate-900">唱歌</option>
              <option value="跳舞" className="bg-slate-900">跳舞</option>
              <option value="小品" className="bg-slate-900">小品</option>
              <option value="弹奏" className="bg-slate-900">弹奏</option>
              <option value="其他" className="bg-slate-900">其他</option>
            </select>
          </div>
        </div>

        {formData.participantCount === '多人' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Members / 合作名单</label>
            <textarea
              value={formData.participantList}
              onChange={(e) => setFormData(prev => ({ ...prev, participantList: e.target.value }))}
              className="w-full bg-slate-900/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none text-white text-sm"
              placeholder="请列出合作人的姓名和工号"
              required={formData.participantCount === '多人'}
            />
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
            <span>Suggestions / 建议</span>
            <span className="text-[8px] opacity-40 font-normal">Optional</span>
          </label>
          <textarea
            value={formData.recommendedProgram}
            onChange={(e) => setFormData(prev => ({ ...prev, recommendedProgram: e.target.value }))}
            className="w-full bg-slate-900/30 border border-white/10 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none text-white text-sm"
            placeholder="您期待看到什么样的节目？"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-xs flex items-center justify-center gap-3 animate-in fade-in zoom-in-95 duration-200 border ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
            message.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            <span className="text-lg">
              {message.type === 'success' ? '✨' : message.type === 'warning' ? '⚠️' : '❌'}
            </span>
            <span className="font-bold tracking-tight">{message.text}</span>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={isSubmitting}
            className="flex-1 bg-slate-800/40 hover:bg-slate-800/80 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] border border-white/5 disabled:opacity-50 uppercase text-[10px] tracking-widest"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 uppercase text-[10px] tracking-widest"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : 'Save & Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

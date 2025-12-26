
import React, { useState, useEffect } from 'react';
import { RegistrationData } from '../types';
import { saveRegistration, getRegistrationByEmployeeId } from '../services/storage';

interface EmployeeViewProps {
  initialId: string;
  onLogout: () => void;
}

export const EmployeeView: React.FC<EmployeeViewProps> = ({ initialId, onLogout }) => {
  const [formData, setFormData] = useState<Omit<RegistrationData, 'timestamp' | 'id'>>({
    name: '',
    employeeId: initialId,
    recommendedProgram: '',
    personalProgram: '',
  });
  const [isViewMode, setIsViewMode] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    const existing = getRegistrationByEmployeeId(initialId);
    if (existing) {
      setFormData({
        name: existing.name,
        employeeId: existing.employeeId,
        recommendedProgram: existing.recommendedProgram,
        personalProgram: existing.personalProgram,
      });
      setLastUpdated(existing.timestamp);
      setIsViewMode(true);
    }
  }, [initialId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employeeId.trim()) {
      setMessage({ type: 'error', text: '请填写完整的姓名和工号' });
      return;
    }

    if (!formData.personalProgram.trim()) {
      setMessage({ type: 'error', text: '请填写个人报名节目' });
      return;
    }

    const timestamp = new Date().toLocaleString();
    const isUpdate = !!getRegistrationByEmployeeId(formData.employeeId);
    
    saveRegistration({
      ...formData,
      id: formData.employeeId,
      timestamp: timestamp,
    });

    setLastUpdated(timestamp);
    setMessage({ 
      type: 'success', 
      text: isUpdate ? '更新成功！' : '报名成功！' 
    });

    // 延迟切换到预览模式，让用户看到成功提示
    setTimeout(() => {
      setMessage(null);
      setIsViewMode(true);
    }, 1500);
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...prev,
      recommendedProgram: '',
      personalProgram: '',
    }));
  };

  if (isViewMode) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <span className="text-xl">✅</span> 报名信息确认
            </h2>
            <p className="text-xs text-slate-500 mt-1 italic">最后更新: {lastUpdated}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsViewMode(false)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all bg-blue-400/10 px-4 py-2 rounded-lg border border-blue-400/20"
            >
              修改
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">员工姓名</span>
              <span className="text-lg text-white font-medium">{formData.name}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">工号</span>
              <span className="text-lg text-white font-medium">{formData.employeeId}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/50">
            <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">节目推荐</span>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{formData.recommendedProgram}</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/50">
            <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">个人报名节目</span>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
              {formData.personalProgram || <span className="text-slate-600 italic">暂未填写个人节目</span>}
            </p>
          </div>

          <div className="pt-6 border-t border-slate-800/50">
            <button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>确认</span>
              <span className="text-xs font-normal opacity-70">(返回主页面)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 glass rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-blue-400">年会报名登记</h2>
          <p className="text-xs text-slate-500 mt-1">请填写您的年会参与意向</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-600"
              placeholder="请输入真实姓名"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">工号</label>
            <input
              type="text"
              value={formData.employeeId}
              disabled
              className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300 flex justify-between">
            <span>节目推荐</span>
            <span className="text-xs text-slate-500 font-normal">(推荐别人演的节目)</span>
          </label>
          <textarea
            value={formData.recommendedProgram}
            onChange={(e) => setFormData(prev => ({ ...prev, recommendedProgram: e.target.value }))}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-28 resize-none text-white text-sm"
            placeholder="你希望在年会上看到什么样的节目？或者你觉得哪位同事很有才华？"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300 flex justify-between">
            <span>个人报名节目</span>
            <span className="text-xs text-slate-500 font-normal">(必填 - 自己想演的节目)</span>
          </label>
          <textarea
            value={formData.personalProgram}
            onChange={(e) => setFormData(prev => ({ ...prev, personalProgram: e.target.value }))}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-28 resize-none text-white text-sm"
            placeholder="如果您愿意一展歌喉或舞姿，请在此填写节目名称或描述"
            required
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm flex items-center justify-center gap-2 animate-pulse ${message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
            <span className="text-lg">{message.type === 'success' ? '✨' : '⚠️'}</span>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onLogout}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] border border-slate-700"
          >
            返回
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] border border-slate-700"
          >
            清除
          </button>
          <button
            type="submit"
            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-xl shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            保存并提交
          </button>
        </div>
      </form>
    </div>
  );
};

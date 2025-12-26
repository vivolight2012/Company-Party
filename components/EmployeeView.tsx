
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
      setIsLoading(false);
    };
    checkExisting();
  }, [initialId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.employeeId.trim() || !formData.department) {
      setMessage({ type: 'error', text: '请填写完整的姓名、工号和部门' });
      return;
    }

    if (!formData.programName.trim()) {
      setMessage({ type: 'error', text: '请填写节目名称' });
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
        setMessage({ type: 'success', text: '同步云端成功！' });
      } else {
        setMessage({ type: 'warning', text: '网络受限，已保存至本地缓存' });
      }
      
      setTimeout(() => {
        setMessage(null);
        setIsViewMode(true);
      }, 2000);
    } else {
      setMessage({ type: 'error', text: '提交失败，请检查网络后重试' });
    }
  };

  const handleClear = () => {
    setFormData(prev => ({
      ...prev,
      recommendedProgram: '',
      programName: '',
      programType: '唱歌',
      participantCount: '单人',
      participantList: '',
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-12 glass rounded-2xl flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
        <p className="text-slate-400 font-medium">正在同步数据...</p>
      </div>
    );
  }

  if (isViewMode) {
    return (
      <div className="max-w-2xl mx-auto mt-8 p-8 glass rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="flex justify-between items-start mb-8 border-b border-slate-700 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-green-400 flex items-center gap-2">
              <span className="text-xl">✅</span> 报名信息确认
            </h2>
            <p className="text-xs text-slate-500 mt-1 italic">最后保存: {lastUpdated}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsViewMode(false)}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-all bg-blue-400/10 px-4 py-2 rounded-lg border border-blue-400/20"
            >
              修改报名
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">员工姓名</span>
              <span className="text-lg text-white font-medium">{formData.name}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">工号</span>
              <span className="text-lg text-white font-medium">{formData.employeeId}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">部门</span>
              <span className="text-lg text-white font-medium">{formData.department}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">节目名称</span>
              <span className="text-md text-white font-medium">{formData.programName}</span>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/50">
              <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">节目类型</span>
              <span className="text-md text-white font-medium">{formData.programType}</span>
            </div>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/50">
            <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">参演人数</span>
            <span className="text-md text-white font-medium">{formData.participantCount}</span>
            {formData.participantCount === '多人' && (
              <div className="mt-3 pt-3 border-t border-slate-700/50">
                <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">人员名单</span>
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{formData.participantList}</p>
              </div>
            )}
          </div>

          <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800/50">
            <span className="block text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">节目推荐</span>
            <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">{formData.recommendedProgram || '无'}</p>
          </div>

          <div className="pt-6 border-t border-slate-800/50">
            <button
              onClick={onLogout}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>确认</span>
              <span className="text-xs font-normal opacity-70">(返回首页)</span>
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
          <p className="text-xs text-slate-500 mt-1">请填写您的年会参与意向，数据将自动同步</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">部门</label>
            <select
              value={formData.department}
              onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
              required
            >
              <option value="" disabled>请选择部门</option>
              {DEPARTMENTS.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-3 text-slate-300">参演人数</label>
            <div className="flex gap-6 h-[42px] items-center">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="participantCount"
                  value="单人"
                  checked={formData.participantCount === '单人'}
                  onChange={() => setFormData(prev => ({ ...prev, participantCount: '单人' }))}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">单人</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="participantCount"
                  value="多人"
                  checked={formData.participantCount === '多人'}
                  onChange={() => setFormData(prev => ({ ...prev, participantCount: '多人' }))}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                <span className="text-slate-300 group-hover:text-white transition-colors">多人</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">节目名称</label>
            <input
              type="text"
              value={formData.programName}
              onChange={(e) => setFormData(prev => ({ ...prev, programName: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-600"
              placeholder="请输入节目名称"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-slate-300">节目类型</label>
            <select
              value={formData.programType}
              onChange={(e) => setFormData(prev => ({ ...prev, programType: e.target.value as any }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white"
            >
              <option value="唱歌">唱歌</option>
              <option value="跳舞">跳舞</option>
              <option value="小品">小品</option>
              <option value="弹奏">弹奏</option>
              <option value="其他">其他</option>
            </select>
          </div>
        </div>

        {formData.participantCount === '多人' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-sm font-medium mb-2 text-slate-300">参演人员名单</label>
            <textarea
              value={formData.participantList}
              onChange={(e) => setFormData(prev => ({ ...prev, participantList: e.target.value }))}
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none text-white text-sm"
              placeholder="请填写所有参与者的姓名和工号"
              required={formData.participantCount === '多人'}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-slate-300 flex justify-between">
            <span>节目推荐</span>
            <span className="text-xs text-slate-500 font-normal">(推荐别人演的节目)</span>
          </label>
          <textarea
            value={formData.recommendedProgram}
            onChange={(e) => setFormData(prev => ({ ...prev, recommendedProgram: e.target.value }))}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none text-white text-sm"
            placeholder="你希望在年会上看到什么样的节目？或者你觉得哪位同事很有才华？"
          />
        </div>

        {message && (
          <div className={`p-4 rounded-xl text-sm flex items-center justify-center gap-2 animate-pulse ${
            message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 
            message.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' :
            'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}>
            <span className="text-lg">
              {message.type === 'success' ? '✨' : message.type === 'warning' ? '💾' : '⚠️'}
            </span>
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onLogout}
            disabled={isSubmitting}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] border border-slate-700 disabled:opacity-50"
          >
            返回
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={isSubmitting}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] border border-slate-700 disabled:opacity-50"
          >
            重置
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-[2] bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-900/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                保存中...
              </>
            ) : '保存并提交'}
          </button>
        </div>
      </form>
    </div>
  );
};

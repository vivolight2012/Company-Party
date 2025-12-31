
import React, { useState } from 'react';
import { ViewRole } from './types.ts';
import { EmployeeView } from './components/EmployeeView.tsx';
import { AdminView } from './components/AdminView.tsx';
import { AgendaView } from './components/AgendaView.tsx';

const App: React.FC = () => {
  const [view, setView] = useState<'login' | 'employee' | 'admin' | 'agenda'>('login');
  const [role, setRole] = useState<ViewRole>('employee');
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeIdInput.trim()) {
      setView('employee');
      setError(null);
    } else {
      setError('请输入工号');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === '12') {
      setView('admin');
      setError(null);
    } else {
      setError('密码错误');
    }
  };

  const handleLogout = () => {
    setView('login');
    setEmployeeIdInput('');
    setAdminPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center mb-8 flex flex-col items-center">
        <div className="flex flex-col items-center mb-8 group">
          <div className="space-y-2">
            <h2 className="text-sm md:text-base font-bold tracking-[0.5em] text-white/80 uppercase text-center">
              深圳市中科微光医疗器械技术有限公司
            </h2>
            <div className="h-px w-3/4 mx-auto bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent"></div>
          </div>
        </div>

        <h1 className="text-4xl md:text-7xl font-extrabold tech-title mb-6 text-center">
          2026年公司年会盛典
        </h1>
        
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 max-w-4xl mx-auto px-4 py-6 capsule mb-8 shadow-[0_0_30px_rgba(0,0,0,0.3)] border border-white/5">
          <div className="flex flex-col items-center px-4 md:px-6 border-r border-slate-700/50 last:border-0">
            <span className="text-xl md:text-3xl font-bold text-cyan-400 mb-2">进窄门</span>
            <span className="text-[9px] md:text-xs text-slate-500 text-center leading-relaxed">深耕激光医学技术<br/>做困难但有价值的事</span>
          </div>
          <div className="flex flex-col items-center px-4 md:px-6 border-r border-slate-700/50 last:border-0">
            <span className="text-xl md:text-3xl font-bold text-cyan-400 mb-2">走远路</span>
            <span className="text-[9px] md:text-xs text-slate-500 text-center leading-relaxed">坚持自主创新<br/>走难走却长远的路</span>
          </div>
          <div className="flex flex-col items-center px-4 md:px-6">
            <span className="text-xl md:text-3xl font-bold text-cyan-400 mb-2">见微光</span>
            <span className="text-[9px] md:text-xs text-slate-500 text-center leading-relaxed">赋能精准医疗<br/>过窄门而见宽途</span>
          </div>
        </div>
      </div>

      {view === 'login' && (
        <div className="w-full max-w-md p-8 glass rounded-[2.5rem] shadow-2xl border border-white/5">
          <div className="flex bg-slate-900/60 rounded-2xl p-1 mb-10 border border-slate-800/50">
            <button
              onClick={() => { setRole('employee'); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'employee' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(8,145,178,0.4)]' : 'text-slate-500 hover:text-white'}`}
            >
              员工通道
            </button>
            <button
              onClick={() => { setRole('admin'); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 ${role === 'admin' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-slate-500 hover:text-white'}`}
            >
              管理端
            </button>
          </div>

          {role === 'employee' ? (
            <form onSubmit={handleEmployeeLogin} className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">员工报名</h3>
                <p className="text-slate-500 text-sm">中科微光 · 2026 开启新章</p>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Work ID / 输入工号</label>
                <div className="relative group">
                  <input
                    type="text"
                    value={employeeIdInput}
                    onChange={(e) => setEmployeeIdInput(e.target.value)}
                    className="w-full bg-slate-900/30 border border-slate-700/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-700 font-mono text-lg"
                    placeholder="请输入工号"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
              
              <div className="space-y-4">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-cyan-900/40 active:scale-[0.98] flex items-center justify-center gap-3 group"
                >
                  年会报名 <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                </button>

                <button
                  type="button"
                  onClick={() => setView('agenda')}
                  className="w-full bg-slate-800/40 hover:bg-slate-800/80 text-cyan-400 font-bold py-4 rounded-2xl transition-all border border-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                  📅 年会流程详情
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-8">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">信息管理后台</h3>
                <p className="text-slate-500 text-sm">请输入管理密钥以进入后台系统</p>
              </div>
              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Access Key / 管理密码</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-900/30 border border-slate-700/50 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-white placeholder-slate-700 text-lg"
                  placeholder="请输入密码"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center font-medium">{error}</p>}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-5 rounded-2xl transition-all shadow-xl shadow-purple-900/40 active:scale-[0.98]"
              >
                授权进入管理系统
              </button>
            </form>
          )}
        </div>
      )}

      {view === 'employee' && <EmployeeView initialId={employeeIdInput} onLogout={handleLogout} />}
      {view === 'admin' && <AdminView onLogout={handleLogout} />}
      {view === 'agenda' && <AgendaView onBack={() => setView('login')} />}

      <div className="mt-16 text-slate-600 text-[10px] flex flex-col items-center gap-4">
        <div className="flex items-center gap-6">
          <span className="uppercase tracking-widest text-center">© 2026 Annual Gala Committee</span>
          <span className="h-4 w-px bg-slate-800"></span>
          <span className="uppercase tracking-widest text-center">Vivolight Medical Technology</span>
        </div>
      </div>
    </div>
  );
};

export default App;

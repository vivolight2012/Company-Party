
import React, { useState } from 'react';
import { ViewRole } from './types';
import { EmployeeView } from './components/EmployeeView';
import { AdminView } from './components/AdminView';

const App: React.FC = () => {
  const [role, setRole] = useState<ViewRole>('employee');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [employeeIdInput, setEmployeeIdInput] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleEmployeeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (employeeIdInput.trim()) {
      setIsLoggedIn(true);
      setError(null);
    } else {
      setError('请输入工号');
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 更新密码为 123
    if (adminPassword === '12') {
      setIsLoggedIn(true);
      setError(null);
    } else {
      setError('密码出现错误');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setEmployeeIdInput('');
    setAdminPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
          2026年公司年会盛典
        </h1>
        <p className="text-blue-400 font-medium tracking-widest uppercase text-sm">
          星辰大海 · 共创未来 · 报名系统
        </p>
      </div>

      {!isLoggedIn ? (
        <div className="w-full max-w-md p-8 glass rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="flex bg-slate-900/80 rounded-xl p-1 mb-8">
            <button
              onClick={() => { setRole('employee'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'employee' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              员工通道
            </button>
            <button
              onClick={() => { setRole('admin'); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${role === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              管理端
            </button>
          </div>

          {role === 'employee' ? (
            <form onSubmit={handleEmployeeLogin} className="space-y-6">
              <h3 className="text-xl font-semibold text-center text-white">员工登录</h3>
              <div>
                <label className="block text-sm text-slate-400 mb-2">输入工号进入</label>
                <input
                  type="text"
                  value={employeeIdInput}
                  onChange={(e) => setEmployeeIdInput(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-white placeholder-slate-600"
                  placeholder="例如: 1001"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                立即进入
              </button>
            </form>
          ) : (
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <h3 className="text-xl font-semibold text-center text-white">管理员认证</h3>
              <div>
                <label className="block text-sm text-slate-400 mb-2">管理密码</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-white placeholder-slate-600"
                  placeholder="请输入密码"
                  required
                />
              </div>
              {error && <p className="text-red-400 text-sm text-center font-medium animate-pulse">{error}</p>}
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                授权登录
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="w-full animate-in fade-in duration-500">
          {role === 'employee' ? (
            <EmployeeView initialId={employeeIdInput} onLogout={handleLogout} />
          ) : (
            <AdminView onLogout={handleLogout} />
          )}
        </div>
      )}

      {/* Footer Decoration */}
      <div className="mt-12 text-slate-500 text-xs flex items-center gap-4">
        <span>© 2026 公司年会组委会</span>
        <span className="h-3 w-px bg-slate-800"></span>
        <span>数字报名系统 v1.0</span>
      </div>
    </div>
  );
};

export default App;

import React, { useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useSyncStore } from '../../store/useSyncStore';
import { syncEngine } from '../../sync/syncEngine';
import { X, Server, User as UserIcon, LogIn, UserPlus, LogOut, RefreshCw } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { 
    user, 
    token, 
    serverUrl, 
    isAuthModalOpen, 
    setIsAuthModalOpen, 
    setAuth, 
    logout, 
    setServerUrl 
  } = useAuthStore();

  const { status, lastSyncedAt } = useSyncStore();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [customServer, setCustomServer] = useState(serverUrl);
  const [isServerSettingsOpen, setIsServerSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const payload = mode === 'register' ? { email, password, name } : { email, password };

    try {
      const res = await fetch(`${customServer}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Помилка запиту');
      }

      setAuth(data.user, data.token);
      setServerUrl(customServer);
      
      // Enqueue existing notes and trigger sync
      await syncEngine.enqueueAllLocalData();
      await syncEngine.sync();
    } catch (err: any) {
      setError(err.message || 'Не вдалося підключитися до сервера');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSync = async () => {
    await syncEngine.enqueueAllLocalData();
    await syncEngine.sync();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#131620] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#10121a]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/20 text-indigo-400 rounded-lg">
              <UserIcon className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">
              {token ? 'Акаунт та синхронізація' : (mode === 'login' ? 'Вхід в акаунт' : 'Реєстрація')}
            </h2>
          </div>
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {token && user ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Користувач</span>
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                    Підключено
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-100">{user.name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>

              <div className="p-4 bg-slate-800/30 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Статус синхронізації:</span>
                  <span className="font-medium text-slate-200 capitalize">
                    {status === 'synced' ? 'Усе синхронізовано' : status === 'syncing' ? 'Синхронізація...' : status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Остання синхронізація:</span>
                  <span>{lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Немає даних'}</span>
                </div>
                <div className="flex items-center justify-between truncate">
                  <span>Сервер:</span>
                  <span className="text-slate-300 font-mono text-[11px] truncate max-w-[200px]">{serverUrl}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleManualSync}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Синхронізувати зараз
                </button>
                <button
                  onClick={() => logout()}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Вийти
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-lg text-xs text-rose-300">
                  {error}
                </div>
              )}

              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400">Ім'я</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше ім'я"
                    className="w-full bg-[#181b26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#181b26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-400">Пароль</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Мінімум 6 символів"
                  className="w-full bg-[#181b26] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsServerSettingsOpen(!isServerSettingsOpen)}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 cursor-pointer"
                >
                  <Server className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{isServerSettingsOpen ? 'Приховати адресу сервера' : 'Налаштувати сервер (Self-Host)'}</span>
                </button>

                {isServerSettingsOpen && (
                  <div className="mt-2 space-y-1">
                    <input
                      type="url"
                      value={customServer}
                      onChange={(e) => setCustomServer(e.target.value)}
                      placeholder="http://192.168.0.245:3001"
                      className="w-full bg-[#181b26] border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none font-mono"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : mode === 'login' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    Увійти
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Зареєструватися
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode(mode === 'login' ? 'register' : 'login');
                    setError(null);
                  }}
                  className="text-xs text-indigo-400 hover:underline cursor-pointer"
                >
                  {mode === 'login'
                    ? 'Немає акаунта? Створити новий'
                    : 'Вже є акаунт? Увійти'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
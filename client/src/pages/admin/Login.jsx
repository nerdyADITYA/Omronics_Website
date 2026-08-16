import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Cpu, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F9FB] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white border border-[#87C0CD]/40 rounded-3xl p-8 shadow-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#87C0CD] p-0.5 mx-auto shadow-md">
            <div className="w-full h-full bg-[#113F67] rounded-[14px] flex items-center justify-center">
              <Cpu className="w-6 h-6 text-[#87C0CD]" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold font-display text-[#113F67]">OMRONICS</h1>
          <p className="text-xs text-slate-500 font-medium">Admin CMS Portal Authorization</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-600">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#226597]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@omronics.com"
                className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#113F67] mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#226597]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#F3F9FB] border border-[#87C0CD]/40 rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#113F67] focus:outline-none focus:border-[#226597] shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#226597] hover:bg-[#113F67] text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <span className="text-[10px] text-slate-400 font-medium">Omronics Industrial Corporate CMS v1.0</span>
        </div>
      </div>
    </div>
  );
}

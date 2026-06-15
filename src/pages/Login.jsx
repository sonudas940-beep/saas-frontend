import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, authError, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    await login(email, password);
  };

  return (
    <div className="min-h-screen bg-white flex select-none font-sans overflow-hidden">
      {/* Left Branding Panel (Hero Section) */}
      <div className="hidden lg:flex w-1/2 bg-[#0a1128] relative overflow-hidden flex-col justify-between p-16">
        
        {/* Dynamic animated geometric accents */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[100px] pointer-events-none animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/30 blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '6s' }}></div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        {/* Floating Abstract Badges (Uniquely Animated) */}
        <div className="absolute top-32 right-12 bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl animate-float shadow-2xl flex items-center space-x-3 delay-100 z-10">
          <div className="w-8 h-8 rounded-full bg-green-400/20 flex items-center justify-center text-green-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
          </div>
          <div>
            <p className="text-white text-xs font-bold">Sales Pipeline</p>
            <p className="text-green-300 text-[10px]">+24% Lead Conversion</p>
          </div>
        </div>

        <div className="absolute bottom-48 right-20 bg-white/10 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl animate-float shadow-2xl flex items-center space-x-3 delay-300 z-10" style={{ animationDelay: '1.5s' }}>
          <div className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <div>
            <p className="text-white text-xs font-bold">Service Tickets</p>
            <p className="text-amber-300 text-[10px]">Real-time Engineer Dispatch</p>
          </div>
        </div>

        {/* Top Logo */}
        <div className="relative z-10 animate-slide-right">
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/30">
              T
            </div>
            <span className="text-xl font-bold text-white tracking-wide">Tech IT World</span>
          </div>

          <div className="mt-16 animate-slide-right delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <h1 className="text-5xl font-extrabold text-white leading-[1.1] mb-6">
              Accelerate <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Sales</span>. <br/>
              Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Service</span>.
            </h1>
            <p className="text-slate-300 text-lg max-w-md leading-relaxed border-l-4 border-blue-500 pl-4 bg-white/5 py-2 pr-4 rounded-r-lg">
              Your complete enterprise ecosystem. Turn casual leads into loyal clients, and deliver lightning-fast AMC & RMA resolutions—all from one lag-free command center.
            </p>
          </div>
        </div>

        {/* Bottom Users Trust */}
        <div className="relative z-10 animate-slide-right delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
          <div className="flex -space-x-3 mb-4">
             {[1,2,3,4].map(i => (
               <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0a1128] bg-slate-700 flex items-center justify-center overflow-hidden shadow-lg">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}&backgroundColor=e2e8f0`} alt="user" className="w-full h-full object-cover" />
               </div>
             ))}
          </div>
          <p className="text-slate-400 text-sm font-medium">Empowering sales & service executives everywhere.</p>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#f8fafc] relative">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 border border-slate-100 animate-fade-in relative z-10">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Welcome Back</h2>
            <p className="text-slate-500 text-sm">Enter your credentials to access the workspace</p>
          </div>

          {authError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-medium flex items-center space-x-3 animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="animate-fade-in delay-100 opacity-0" style={{ animationFillMode: 'forwards' }}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@techitworld.com"
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 font-medium"
              />
            </div>

            <div className="animate-fade-in delay-200 opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none transition-all duration-200 font-medium font-sans tracking-widest pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors p-1"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0a1128] hover:bg-[#152042] disabled:bg-slate-400 text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-xl active:scale-[0.99] transition-all duration-200 mt-4 flex items-center justify-center space-x-2 animate-fade-in delay-300 opacity-0"
              style={{ animationFillMode: 'forwards' }}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Setup Tip */}
          <div className="mt-10 p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-start space-x-3 animate-fade-in delay-300 opacity-0" style={{ animationFillMode: 'forwards' }}>
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-600">
              💡
            </div>
            <div className="text-xs text-slate-600 leading-relaxed pt-1">
              <span className="font-semibold text-slate-800">Initial Setup:</span> If database is empty, logging in with <span className="font-semibold text-slate-800">admin@techitworld.com</span> (pw: admin123) creates the Master profile.
            </div>
          </div>

        </div>
        
        {/* Right side background blob */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}

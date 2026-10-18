import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Handshake, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  Building2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  'Frontend Engineering',
  'Backend & Core APIs',
  'Cloud Platform & DevOps',
  'QA Automation & Testing',
  'Security & Compliance',
  'Architecture & Systems',
  'Data & ML Engineering',
  'Product & UX Design'
];

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isAuthenticated, user } = useAuth();

  // Mode: 'register' (Sign Up) or 'login' (Sign In)
  // Default to 'register' or 'login' based on query param or standard flow
  const searchParams = new URLSearchParams(location.search);
  const initialMode = searchParams.get('mode') === 'signup' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Frontend Engineering');
  const [role, setRole] = useState('Senior Software Engineer');

  const [errorMessage, setErrorMessage] = useState('');

  const from = location.state?.from?.pathname || '/';

  // If already authenticated, redirect
  if (isAuthenticated && user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    // Strict corporate email validation: requires valid domain + minimum 2-letter alphabetic TLD (e.g. .com, .in, .org)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (mode === 'login') {
      if (!email.trim() && !password) {
        setErrorMessage('Please enter your email and password.');
        setIsSubmitting(false);
        return;
      }

      if (!email.trim()) {
        setErrorMessage('Please enter your email address.');
        setIsSubmitting(false);
        return;
      }

      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Invalid email address.');
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setErrorMessage('Please enter your password.');
        setIsSubmitting(false);
        return;
      }

      const res = await login(email.trim(), password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Login failed.');
      }
    } else {
      // Register Mode
      if (!name.trim()) {
        setErrorMessage('Please enter your full name.');
        setIsSubmitting(false);
        return;
      }

      if (!email.trim()) {
        setErrorMessage('Please enter your email address.');
        setIsSubmitting(false);
        return;
      }

      if (!emailRegex.test(email.trim())) {
        setErrorMessage('Invalid email address.');
        setIsSubmitting(false);
        return;
      }

      if (!password) {
        setErrorMessage('Please enter a password.');
        setIsSubmitting(false);
        return;
      }

      if (password.length < 8) {
        setErrorMessage('Password must be at least 8 characters long.');
        setIsSubmitting(false);
        return;
      }

      const res = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        department,
        role: role.trim(),
      });
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setErrorMessage(res.error || 'Registration failed.');
      }
    }

    setIsSubmitting(false);
  };

  const [lastAccount, setLastAccount] = useState(() => {
    try {
      const saved = localStorage.getItem('skillswap_last_account');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleClearLastAccount = () => {
    localStorage.removeItem('skillswap_last_account');
    setLastAccount(null);
  };

  const getInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 animate-in fade-in duration-200">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#f97316]/15 text-[#f97316] border border-[#f97316]/30 mb-3 shadow-sm hover:scale-105 transition-transform">
          <Handshake className="w-6 h-6 text-[#f97316]" />
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {mode === 'register' ? 'Create Your Account' : 'Welcome Back'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          {mode === 'register'
            ? 'Join your team on SkillSwap to share expertise and book pairing sessions.'
            : 'Sign in to access your mentorship sessions and tech talks.'}
        </p>
      </div>

      {/* Main Auth Card */}
      <div className="rounded-2xl bg-[#141b26] border border-[#1e293b] p-6 sm:p-8 shadow-xl">
        <form key={mode} onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Sign Up Specific Fields */}
          {mode === 'register' && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Mithun NS"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Department / Squad
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    name="department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white focus:outline-none focus:border-[#f97316] transition-colors appearance-none"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept} className="bg-[#141b26]">
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Job Title / Designation
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    name="organization-title"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Backend Engineer"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] transition-colors"
                  />
                </div>
              </div>
            </>
          )}

          {/* Corporate Email */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Work Corporate Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                key={`email-${mode}`}
                type="text"
                name="email"
                inputMode="email"
                autoComplete={mode === 'register' ? 'email' : 'username'}
                autoCapitalize="none"
                spellCheck="false"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Password</label>
              {mode === 'login' ? (
                <span className="text-[11px] text-slate-500">Corporate internal auth</span>
              ) : (
                <span className="text-[11px] text-slate-400">Min 8 characters</span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                key={`password-${mode}`}
                type={showPassword ? 'text' : 'password'}
                name={mode === 'register' ? 'new-password' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#f97316] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mode === 'register' && (
              <p className="text-[11px] text-slate-500 mt-1">Must be at least 8 characters</p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm bg-[#f97316] hover:bg-[#ea580c] text-white shadow-sm transition-all hover:translate-y-[-1px] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <span>Please wait...</span>
              ) : mode === 'register' ? (
                <>
                  <span>Create Account & Join Directory</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Sign In with Work Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Toggle Mode: "Already have an account? Log In" or "Don't have an account? Sign Up" */}
        <div className="mt-6 pt-5 border-t border-[#1e293b] text-center">
          {mode === 'register' ? (
            <p className="text-xs text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('login');
                }}
                className="text-[#f97316] font-semibold hover:underline transition-colors ml-1"
              >
                Log In
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('register');
                }}
                className="text-[#f97316] font-semibold hover:underline transition-colors ml-1"
              >
                Sign Up & Join Organization
              </button>
            </p>
          )}
        </div>

        {/* Recent Account on This Device (Only shows if a real user logged in previously on this browser) */}
        {lastAccount && (
          <div className="mt-5 pt-4 border-t border-[#1e293b]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Recent Account on this Device
              </span>
              <button
                type="button"
                onClick={handleClearLastAccount}
                className="text-[10px] text-slate-500 hover:text-slate-300"
              >
                Forget
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0e141d] border border-[#1e293b] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0">
                  {getInitials(lastAccount.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-white truncate">{lastAccount.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{lastAccount.email}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setMode('login');
                  setEmail(lastAccount.email);
                }}
                className="text-xs font-medium text-orange-400 hover:text-orange-300 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-colors shrink-0"
              >
                Use Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

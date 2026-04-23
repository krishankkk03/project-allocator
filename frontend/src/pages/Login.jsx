import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Key } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = credentials, 2 = OTP
  const [error, setError] = useState('');
  const { requestLogin, verifyLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await requestLogin(email, password);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const user = await verifyLogin(email, otp);
      navigate(`/${user.role}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 glass-panel p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome Back</h1>
        <p className="text-slate-500">{step === 1 ? 'Sign in to manage your projects' : 'Enter the OTP sent to your email'}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                required
                className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type="password"
                required
                className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
            Request OTP <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">6-Digit OTP</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Key className="h-5 w-5" />
              </div>
              <input
                type="text"
                required
                className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Check your email. (If not configured in .env, look at the backend terminal console for your code!)</p>
          </div>
          
          <button type="submit" className="w-full flex justify-center items-center gap-2 py-2.5 px-4 rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
            Verify & Sign In
          </button>
        </form>
      )}

      {step === 1 && (
        <p className="mt-6 text-center text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            Register here
          </Link>
        </p>
      )}
    </div>
  );
};

export default Login;

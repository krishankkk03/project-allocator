import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, Lock, Phone, Hash, Key } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    role: 'student',
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    contactNumber: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const { requestRegister, verifyRegister } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await requestRegister(formData);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      setError('');
      await verifyRegister(formData.email, otp);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP');
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 glass-panel p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
      
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Create Account</h1>
        <p className="text-slate-500">{step === 1 ? 'Join the Project Allocator system' : 'Verify your email address'}</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">
          {error}
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">I am a</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex justify-center cursor-pointer py-2 border rounded-lg transition-colors ${formData.role === 'student' ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="role" value="student" className="hidden" checked={formData.role === 'student'} onChange={handleChange} />
                Student
              </label>
              <label className={`flex-1 flex justify-center cursor-pointer py-2 border rounded-lg transition-colors ${formData.role === 'teacher' ? 'border-teal-500 bg-teal-50 text-teal-700 font-medium' : 'border-slate-200 hover:bg-slate-50'}`}>
                <input type="radio" name="role" value="teacher" className="hidden" checked={formData.role === 'teacher'} onChange={handleChange} />
                Teacher
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute inset-y-0 left-0 pl-3 h-5 w-5 mt-2.5 text-slate-400 pointer-events-none" />
                <input type="text" name="name" required className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="John Doe" onChange={handleChange} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute inset-y-0 left-0 pl-3 h-5 w-5 mt-2.5 text-slate-400 pointer-events-none" />
                <input type="email" name="email" required className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="you@example.com" onChange={handleChange} />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute inset-y-0 left-0 pl-3 h-5 w-5 mt-2.5 text-slate-400 pointer-events-none" />
                <input type="password" name="password" required className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="••••••••" onChange={handleChange} />
              </div>
            </div>

            {formData.role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <div className="relative">
                    <Hash className="absolute inset-y-0 left-0 pl-3 h-5 w-5 mt-2.5 text-slate-400 pointer-events-none" />
                    <input type="text" name="rollNumber" required className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="101" onChange={handleChange} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute inset-y-0 left-0 pl-3 h-5 w-5 mt-2.5 text-slate-400 pointer-events-none" />
                    <input type="text" name="contactNumber" required className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none" placeholder="9876543210" onChange={handleChange} />
                  </div>
                </div>
              </>
            )}
          </div>

          <button type="submit" className="w-full py-2.5 px-4 mt-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 transition-colors">
            Request Registration OTP
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
                className="pl-10 w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">Check your email. (If not configured in .env, look at the backend terminal console for your code!)</p>
          </div>
          
          <button type="submit" className="w-full py-2.5 px-4 mt-4 rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
            Verify & Create Account
          </button>
        </form>
      )}

      {step === 1 && (
        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-teal-600 hover:text-teal-500">
            Sign in here
          </Link>
        </p>
      )}
    </div>
  );
};

export default Register;

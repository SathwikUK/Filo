import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, User, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const Register = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData.username, formData.email, formData.password);
    
    if (!result.success) {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-pattern">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float delay-200"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl animate-pulse-glow delay-300"></div>
        <div className="absolute top-3/4 left-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-2xl animate-float delay-400"></div>
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-scale">
        {/* Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl mb-4 shadow-neon animate-pulse-glow hover-scale">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 text-glow">
            Neural<span className="text-gradient animate-gradient">Vault</span>
          </h1>
          <p className="text-gray-400 animate-shimmer">Advanced Image Management System</p>
        </div>

        {/* Register Form */}
        <div className="glass-strong rounded-3xl p-8 shadow-neon card-interactive animate-slide-up delay-200">
          <h2 className="text-2xl font-semibold text-white mb-6 text-center text-glow">Create Account</h2>
          
          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm glass animate-slide-up shadow-neon-pink">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up delay-300">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-glow">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-4 py-4 focus-ring"
                  placeholder="Choose a username"
                  required
                  minLength="3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-glow">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-4 py-4 focus-ring"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 text-glow">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field w-full pl-12 pr-12 py-4 focus-ring"
                  placeholder="Create a password"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-all duration-200 hover-scale"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-white py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner w-5 h-5 mr-2"></div>
                  Creating account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-all duration-200 hover-lift text-glow"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
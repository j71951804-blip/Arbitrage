import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import Button from '../ui/Button';
import Card from '../ui/Card';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!isLogin && password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err: any) {
      setError(err.message || `${isLogin ? 'Login' : 'Registration'} failed`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            {isLogin ? 'Login to Arbitrage Ace' : 'Create Account'}
          </h2>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-cyan-500 focus:border-cyan-500"
                  required
                />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full justify-center"
            >
              {isLoading ? `${isLogin ? 'Logging in' : 'Creating Account'}...` : (isLogin ? 'Login' : 'Create Account')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <span className="text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-cyan-400 hover:text-cyan-300 font-medium"
            >
              {isLogin ? 'Sign up' : 'Login'}
            </button>
          </div>

          {/* Guest mode option for testing */}
          <div className="mt-4 pt-4 border-t border-gray-700 text-center">
            <p className="text-sm text-gray-400 mb-2">For testing purposes:</p>
            <p className="text-xs text-gray-500">The app will automatically log you in as a guest</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

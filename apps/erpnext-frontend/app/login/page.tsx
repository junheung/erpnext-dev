'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Lock } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading while checking auth status
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F4F7]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F0F4F7]">
      <Card className="w-full max-w-md shadow-lg border-0 bg-white">
        <CardHeader className="text-center pb-8 pt-12 bg-white">
          <div className="mx-auto mb-4 w-16 h-16 bg-black rounded-lg flex items-center justify-center">
            <span className="text-white text-3xl font-bold">D</span>
          </div>
          <CardTitle className="text-2xl font-semibold text-gray-700">
            Login to DATCO ERP
          </CardTitle>
        </CardHeader>
        <CardContent className="px-12 pb-12 bg-white">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Mail className="w-4 h-4" />
              </div>
              <Input
                id="username"
                type="text"
                placeholder="jane@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 h-11 bg-[#F4F5F6] border-0 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
            </div>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock className="w-4 h-4" />
              </div>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="•••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="pl-10 pr-16 h-11 bg-[#F4F5F6] border-0 focus-visible:ring-1 focus-visible:ring-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showPassword ? '숨기기' : '보기'}
              </button>
            </div>
            
            <div className="text-right">
              <a href="#forgot" className="text-sm text-gray-600 hover:text-gray-800">
                비밀번호를 잊으셨나요?
              </a>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}
            
            <Button 
              type="submit" 
              className="w-full h-11 bg-black hover:bg-gray-800 text-white font-medium" 
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : '로그인'}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500 my-4">또는</p>
              <Button 
                type="button" 
                variant="outline" 
                className="w-full h-11 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                disabled
              >
                Login with Email Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

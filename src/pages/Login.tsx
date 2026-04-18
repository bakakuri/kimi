import { useState } from 'react';
import { Eye, EyeOff, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login = ({ onSwitchToRegister }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = login(username, password);
    
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#FF6B35] via-[#004E89] to-[#1A659E]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4">
            <BookOpen size={40} className="text-[#004E89]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">DeutschLernen</h1>
          <p className="text-white/80">ისწავლე გერმანული ადვილად</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            შესვლა
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-gray-700">
                მომხმარებლის სახელი ან ელფოსტა
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="შეიყვანეთ მომხმარებლის სახელი"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-700">
                პაროლი
              </Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="შეიყვანეთ პაროლი"
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#004E89] hover:bg-[#003d6e] text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? 'მიმდინარეობს...' : 'შესვლა'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              არ გაქვს ანგარიში?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-[#FF6B35] hover:underline font-medium"
              >
                დარეგისტრირდი
              </button>
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center text-white/80 text-sm">
          <div>
            <div className="text-2xl font-bold text-white mb-1">500+</div>
            <div>სიტყვა</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">4</div>
            <div>დონე</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mb-1">10</div>
            <div>თემა</div>
          </div>
        </div>
      </div>
    </div>
  );
};

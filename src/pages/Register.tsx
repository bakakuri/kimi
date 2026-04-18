import { useState } from 'react';
import { Eye, EyeOff, BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register = ({ onSwitchToLogin }: RegisterProps) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('პაროლები არ ემთხვევა');
      return;
    }
    
    if (password.length < 6) {
      toast.error('პაროლი უნდა იყოს მინიმუმ 6 სიმბოლო');
      return;
    }
    
    if (!agreed) {
      toast.error('გთხოვთ, დაეთანხმოთ წესებსა და პირობებს');
      return;
    }
    
    setIsLoading(true);

    const result = register(username, email, password);
    
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

        {/* Register Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            რეგისტრაცია
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="username" className="text-gray-700">
                მომხმარებლის სახელი
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
              <Label htmlFor="email" className="text-gray-700">
                ელფოსტა
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="შეიყვანეთ ელფოსტა"
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
                  placeholder="შეიყვანეთ პაროლი (მინ. 6 სიმბოლო)"
                  className="pr-10"
                  required
                  minLength={6}
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

            <div>
              <Label htmlFor="confirmPassword" className="text-gray-700">
                დაადასტურეთ პაროლი
              </Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="გაიმეორეთ პაროლი"
                className="mt-1"
                required
              />
            </div>

            <div className="flex items-start gap-2">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  agreed 
                    ? 'bg-[#004E89] border-[#004E89]' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                {agreed && <Check size={14} className="text-white" />}
              </button>
              <span className="text-sm text-gray-600">
                ვეთანხმები{' '}
                <button type="button" className="text-[#FF6B35] hover:underline">
                  წესებსა და პირობებს
                </button>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#004E89] hover:bg-[#003d6e] text-white py-3"
              disabled={isLoading}
            >
              {isLoading ? 'მიმდინარეობს...' : 'რეგისტრაცია'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              უკვე გაქვს ანგარიში?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-[#FF6B35] hover:underline font-medium"
              >
                შესვლა
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { Mail, Calendar, Trophy, Flame, Star, BookOpen, Target, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById, themes } from '@/data/themes';
import { words } from '@/data/words';
import { toast } from 'sonner';

export const Profile = () => {
  const { currentUser, updateUser, updateTheme } = useAuth();
  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || ''
  });

  if (!currentUser) return null;

  const { stats, learnedWords, favoriteWords, createdAt } = currentUser;
  
  const accuracy = stats.totalTestsTaken > 0 
    ? Math.round((stats.totalCorrectAnswers / stats.totalTestsTaken) * 100) 
    : 0;

  const learnedByLevel = {
    A1: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'A1').length,
    A2: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'A2').length,
    B1: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'B1').length,
    B2: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'B2').length,
  };

  const handleSaveProfile = () => {
    updateUser({ 
      username: editForm.username,
      email: editForm.email 
    });
    setIsEditing(false);
    toast.success('პროფილი განახლებულია!');
  };

  const handleThemeChange = (themeId: string) => {
    updateTheme(themeId);
    toast.success('თემა შეიცვალა!');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Avatar */}
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold"
              style={{ background: theme.gradient }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label>მომხმარებლის სახელი</Label>
                    <Input
                      value={editForm.username}
                      onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                      className="max-w-sm"
                    />
                  </div>
                  <div>
                    <Label>ელფოსტა</Label>
                    <Input
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="max-w-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} style={{ background: theme.colors.success }}>
                      <Check size={18} className="mr-2" />
                      შენახვა
                    </Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X size={18} className="mr-2" />
                      გაუქმება
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
                      {currentUser.username}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit2 size={16} />
                    </Button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: theme.colors.textMuted }}>
                    <span className="flex items-center gap-1">
                      <Mail size={16} />
                      {currentUser.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      რეგისტრაცია: {new Date(createdAt).toLocaleDateString('ka-GE')}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Level Badge */}
            <div 
              className="px-6 py-3 rounded-xl text-center"
              style={{ background: theme.gradient }}
            >
              <div className="text-white/80 text-sm">მიმდინარე დონე</div>
              <div className="text-white text-3xl font-bold">{stats.level}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <BookOpen size={24} className="mx-auto mb-2" style={{ color: theme.colors.primary }} />
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {stats.totalWordsLearned}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              ნასწავლი სიტყვა
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target size={24} className="mx-auto mb-2" style={{ color: theme.colors.secondary }} />
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {stats.totalTestsTaken}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              ტესტი
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy size={24} className="mx-auto mb-2" style={{ color: theme.colors.success }} />
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {accuracy}%
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              სიზუსტე
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame size={24} className="mx-auto mb-2" style={{ color: theme.colors.warning }} />
            <div className="text-2xl font-bold" style={{ color: theme.colors.text }}>
              {stats.currentStreak}
            </div>
            <div className="text-sm" style={{ color: theme.colors.textMuted }}>
              დღე წყვეტილად
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress by Level */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star size={20} style={{ color: theme.colors.primary }} />
            პროგრესი დონეების მიხედვით
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(['A1', 'A2', 'B1', 'B2'] as const).map((level) => {
              const totalWords = words.filter(w => w.level === level).length;
              const learned = learnedByLevel[level];
              const percent = Math.round((learned / totalWords) * 100);
              
              return (
                <div key={level}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium" style={{ color: theme.colors.text }}>
                      დონე {level}
                    </span>
                    <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                      {learned} / {totalWords} ({percent}%)
                    </span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden bg-gray-100">
                    <div 
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${percent}%`,
                        background: theme.colors.primary 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Theme Selection */}
      <Card>
        <CardHeader>
          <CardTitle>თემის არჩევა</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  currentUser.theme === t.id ? 'ring-2' : ''
                }`}
                style={{
                  background: t.gradient,
                  borderColor: currentUser.theme === t.id ? t.colors.primary : 'transparent',
                  boxShadow: currentUser.theme === t.id ? `0 0 0 2px ${t.colors.primary}` : 'none'
                }}
              >
                <div className="text-white text-sm font-medium">
                  {t.nameKa}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Favorite Words */}
      {favoriteWords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>ფავორიტი სიტყვები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {favoriteWords.slice(0, 20).map(wordId => {
                const word = words.find(w => w.id === wordId);
                if (!word) return null;
                return (
                  <Badge 
                    key={wordId} 
                    variant="outline"
                    className="px-3 py-1"
                  >
                    {word.german} - {word.georgian}
                  </Badge>
                );
              })}
              {favoriteWords.length > 20 && (
                <Badge variant="outline">+{favoriteWords.length - 20} სხვა</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

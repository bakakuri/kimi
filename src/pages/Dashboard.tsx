import { useEffect } from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  MessageSquare, 
  TrendingUp,
  Award,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById } from '@/data/themes';
import { words } from '@/data/words';

interface DashboardProps {
  onNavigate: (page: 'dashboard' | 'learn' | 'tests' | 'sentences' | 'profile' | 'settings') => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps) => {
  const { currentUser, recordStudySession } = useAuth();
  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');

  useEffect(() => {
    recordStudySession();
  }, [recordStudySession]);

  if (!currentUser) return null;

  const { stats, dailyProgress, settings, learnedWords } = currentUser;
  
  const progressPercent = Math.min(
    (dailyProgress.wordsLearned / settings.dailyGoal) * 100,
    100
  );

  const accuracy = stats.totalTestsTaken > 0 
    ? Math.round((stats.totalCorrectAnswers / stats.totalTestsTaken) * 100) 
    : 0;

  const wordsByLevel = {
    A1: words.filter(w => w.level === 'A1').length,
    A2: words.filter(w => w.level === 'A2').length,
    B1: words.filter(w => w.level === 'B1').length,
    B2: words.filter(w => w.level === 'B2').length,
  };

  const learnedByLevel = {
    A1: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'A1').length,
    A2: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'A2').length,
    B1: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'B1').length,
    B2: learnedWords.filter(id => words.find(w => w.id === id)?.level === 'B2').length,
  };

  const quickActions = [
    {
      id: 'learn',
      title: 'სწავლა',
      titleDe: 'Lernen',
      description: 'ისწავლე ახალი სიტყვები',
      icon: BookOpen,
      color: theme.colors.primary,
      onClick: () => onNavigate('learn')
    },
    {
      id: 'tests',
      title: 'ტესტები',
      titleDe: 'Tests',
      description: 'შეამოწმე ცოდნა',
      icon: ClipboardCheck,
      color: theme.colors.secondary,
      onClick: () => onNavigate('tests')
    },
    {
      id: 'sentences',
      title: 'წინადადებები',
      titleDe: 'Sätze',
      description: 'პრაქტიკა წინადადებებში',
      icon: MessageSquare,
      color: theme.colors.accent,
      onClick: () => onNavigate('sentences')
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div 
        className="rounded-2xl p-6 text-white"
        style={{ background: theme.gradient }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              კეთილი იყოს თქვენი მობრძანება, {currentUser.username}!
            </h2>
            <p className="text-white/80">
              დღეს {dailyProgress.wordsLearned} სიტყვა უკვე ვისწავლეთ. გააგრძეთ!
            </p>
          </div>
          <Button
            onClick={() => onNavigate('learn')}
            className="bg-white text-gray-900 hover:bg-white/90 px-6"
          >
            <BookOpen className="mr-2" size={18} />
            სწავლის დაწყება
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card 
              key={action.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={action.onClick}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${action.color}20` }}
                  >
                    <Icon size={24} style={{ color: action.color }} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: theme.colors.text }}>
                      {action.title}
                    </h3>
                    <p className="text-xs" style={{ color: theme.colors.textMuted }}>
                      {action.titleDe}
                    </p>
                    <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
                      {action.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} style={{ color: theme.colors.primary }} />
              პროგრესი
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Daily Goal */}
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                  დღიური მიზანი
                </span>
                <span className="text-sm font-medium" style={{ color: theme.colors.primary }}>
                  {dailyProgress.wordsLearned} / {settings.dailyGoal}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            {/* Level Progress */}
            {(['A1', 'A2', 'B1', 'B2'] as const).map((level) => (
              <div key={level}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm" style={{ color: theme.colors.textMuted }}>
                    დონე {level}
                  </span>
                  <span className="text-sm font-medium">
                    {learnedByLevel[level]} / {wordsByLevel[level]}
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${(learnedByLevel[level] / wordsByLevel[level]) * 100}%`,
                      background: theme.colors.primary 
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Achievement Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award size={20} style={{ color: theme.colors.success }} />
              მიღწევები
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className="p-4 rounded-xl text-center"
                style={{ background: `${theme.colors.primary}10` }}
              >
                <div className="text-3xl font-bold" style={{ color: theme.colors.primary }}>
                  {stats.totalWordsLearned}
                </div>
                <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                  ნასწავლი სიტყვა
                </div>
              </div>
              
              <div 
                className="p-4 rounded-xl text-center"
                style={{ background: `${theme.colors.secondary}10` }}
              >
                <div className="text-3xl font-bold" style={{ color: theme.colors.secondary }}>
                  {stats.totalTestsTaken}
                </div>
                <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                  ტესტი
                </div>
              </div>
              
              <div 
                className="p-4 rounded-xl text-center"
                style={{ background: `${theme.colors.success}10` }}
              >
                <div className="text-3xl font-bold" style={{ color: theme.colors.success }}>
                  {accuracy}%
                </div>
                <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                  სიზუსტე
                </div>
              </div>
              
              <div 
                className="p-4 rounded-xl text-center"
                style={{ background: `${theme.colors.warning}10` }}
              >
                <div className="text-3xl font-bold" style={{ color: theme.colors.warning }}>
                  {stats.currentStreak}
                </div>
                <div className="text-sm" style={{ color: theme.colors.textMuted }}>
                  დღე წყვეტილად
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Study Calendar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} style={{ color: theme.colors.accent }} />
            სწავლის კალენდარი
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 30 }, (_, i) => {
              const date = new Date();
              date.setDate(date.getDate() - 29 + i);
              const dateStr = date.toISOString().split('T')[0];
              const isStudyDay = stats.studyDays.includes(dateStr);
              const isToday = i === 29;
              
              return (
                <div
                  key={dateStr}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium ${
                    isToday ? 'ring-2' : ''
                  }`}
                  style={{
                    background: isStudyDay ? theme.colors.success : `${theme.colors.textMuted}20`,
                    color: isStudyDay ? '#fff' : theme.colors.textMuted,
                    boxShadow: isToday ? `0 0 0 2px ${theme.colors.primary}` : 'none'
                  }}
                  title={dateStr}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ background: theme.colors.success }}
              />
              <span style={{ color: theme.colors.textMuted }}>სწავლის დღე</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ background: `${theme.colors.textMuted}20` }}
              />
              <span style={{ color: theme.colors.textMuted }}>დასვენების დღე</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

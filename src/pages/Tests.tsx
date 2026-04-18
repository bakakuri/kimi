import { useState, useCallback } from 'react';
import { Check, X, Volume2, RotateCcw, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById } from '@/data/themes';
import { words, type Word } from '@/data/words';
import { toast } from 'sonner';

type TestType = 'multiple-choice' | 'writing' | 'listening';

interface TestState {
  currentWord: Word | null;
  options: string[];
  selectedAnswer: string | null;
  isCorrect: boolean | null;
  score: number;
  totalAnswered: number;
  streak: number;
}

const buildQuestion = (availableWords: Word[]) => {
  const randomIndex = Math.floor(Math.random() * availableWords.length);
  const currentWord = availableWords[randomIndex]!;

  const wrongOptions: string[] = [];
  while (wrongOptions.length < 3) {
    const randomWord = availableWords[Math.floor(Math.random() * availableWords.length)]!;
    if (randomWord.id !== currentWord.id && !wrongOptions.includes(randomWord.georgian)) {
      wrongOptions.push(randomWord.georgian);
    }
  }

  const options = [currentWord.georgian, ...wrongOptions].sort(() => Math.random() - 0.5);

  return { currentWord, options };
};

export const Tests = () => {
  const { currentUser, recordTestResult, updateDailyProgress } = useAuth();
  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');
  
  const learnedWords = words.filter(w => currentUser?.learnedWords.includes(w.id));
  const availableWords = learnedWords.length >= 4 ? learnedWords : words.slice(0, 50);

  const [testType, setTestType] = useState<TestType>('multiple-choice');
  const [testState, setTestState] = useState<TestState>(() => ({
    ...buildQuestion(availableWords),
    selectedAnswer: null,
    isCorrect: null,
    score: 0,
    totalAnswered: 0,
    streak: 0
  }));
  const [writingAnswer, setWritingAnswer] = useState('');
  const [listeningPlayed, setListeningPlayed] = useState(false);

  const generateQuestion = useCallback(() => {
    const { currentWord, options } = buildQuestion(availableWords);
    
    setTestState(prev => ({
      ...prev,
      currentWord,
      options,
      selectedAnswer: null,
      isCorrect: null
    }));
    setWritingAnswer('');
    setListeningPlayed(false);
  }, [availableWords]);

  const handleTestTypeChange = (value: string) => {
    setTestType(value as TestType);
    generateQuestion();
  };

  const handleAnswer = (answer: string) => {
    if (testState.isCorrect !== null) return;
    
    const isCorrect = answer === testState.currentWord?.georgian;
    
    setTestState(prev => ({
      ...prev,
      selectedAnswer: answer,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalAnswered: prev.totalAnswered + 1,
      streak: isCorrect ? prev.streak + 1 : 0
    }));

    if (testState.currentWord) {
      recordTestResult(testState.currentWord.id, isCorrect, testType);
    }

    if (isCorrect) {
      toast.success('სწორია! 🎉');
      
      // Update daily progress
      const today = new Date().toISOString().split('T')[0];
      if (currentUser?.dailyProgress.date === today) {
        updateDailyProgress({
          testsCompleted: currentUser.dailyProgress.testsCompleted + 1
        });
      }
    } else {
      toast.error('არასწორია. სცადეთ თავიდან!');
    }
  };

  const handleWritingSubmit = () => {
    if (!writingAnswer.trim() || testState.isCorrect !== null) return;
    
    const isCorrect = writingAnswer.trim().toLowerCase() === testState.currentWord?.georgian.toLowerCase();
    
    setTestState(prev => ({
      ...prev,
      isCorrect,
      score: isCorrect ? prev.score + 1 : prev.score,
      totalAnswered: prev.totalAnswered + 1,
      streak: isCorrect ? prev.streak + 1 : 0
    }));

    if (testState.currentWord) {
      recordTestResult(testState.currentWord.id, isCorrect, testType);
    }

    if (isCorrect) {
      toast.success('სწორია! 🎉');
    } else {
      toast.error(`არასწორია. სწორი პასუხია: ${testState.currentWord?.georgian}`);
    }
  };

  const playListening = () => {
    if (testState.currentWord && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(testState.currentWord.german);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
      setListeningPlayed(true);
    }
  };

  const accuracy = testState.totalAnswered > 0 
    ? Math.round((testState.score / testState.totalAnswered) * 100) 
    : 0;

  if (availableWords.length < 4) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={64} className="mx-auto mb-4" style={{ color: theme.colors.warning }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>
          სიტყვები არასაკმარისია
        </h3>
        <p className="mb-4" style={{ color: theme.colors.textMuted }}>
          ტესტების გასავლელად საჭიროა მინიმუმ 4 სიტყვის ცოდნა
        </p>
        <Button onClick={() => window.location.href = '#/learn'}>
          სწავლის დაწყება
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            ტესტები
          </h2>
          <p style={{ color: theme.colors.textMuted }}>
            შეამოწმე შენი ცოდნა
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: `${theme.colors.success}20` }}
          >
            <Trophy size={18} style={{ color: theme.colors.success }} />
            <span className="font-medium" style={{ color: theme.colors.success }}>
              {testState.score} / {testState.totalAnswered}
            </span>
          </div>
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{ background: `${theme.colors.primary}20` }}
          >
            <span className="font-medium" style={{ color: theme.colors.primary }}>
              {accuracy}% სიზუსტე
            </span>
          </div>
          {testState.streak > 0 && (
            <div 
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: `${theme.colors.warning}20` }}
            >
              <span className="font-medium" style={{ color: theme.colors.warning }}>
                🔥 {testState.streak}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Test Type Tabs */}
      <Tabs value={testType} onValueChange={handleTestTypeChange}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="multiple-choice">მრავალჯერადი არჩევანი</TabsTrigger>
          <TabsTrigger value="writing">წერა</TabsTrigger>
          <TabsTrigger value="listening">მოსმენა</TabsTrigger>
        </TabsList>

        <TabsContent value="multiple-choice" className="mt-6">
          {testState.currentWord && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Badge className="mb-4" style={{ background: theme.colors.primary }}>
                    {testState.currentWord.level}
                  </Badge>
                  <h3 
                    className="text-3xl font-bold mb-2"
                    style={{ color: theme.colors.text }}
                  >
                    {testState.currentWord.german}
                  </h3>
                  <p style={{ color: theme.colors.textMuted }}>
                    {testState.currentWord.phonetic}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testState.options.map((option, index) => {
                    const isSelected = testState.selectedAnswer === option;
                    const isCorrect = option === testState.currentWord?.georgian;
                    const showResult = testState.isCorrect !== null;
                    
                    let buttonStyle = {};
                    if (showResult) {
                      if (isCorrect) {
                        buttonStyle = { background: theme.colors.success, color: '#fff' };
                      } else if (isSelected && !isCorrect) {
                        buttonStyle = { background: theme.colors.error, color: '#fff' };
                      }
                    } else if (isSelected) {
                      buttonStyle = { background: theme.colors.primary, color: '#fff' };
                    }

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleAnswer(option)}
                        disabled={testState.isCorrect !== null}
                        className="h-auto py-4 text-lg"
                        style={buttonStyle}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>

                {testState.isCorrect !== null && (
                  <div className="mt-6 text-center">
                    <Button onClick={generateQuestion}>
                      <RotateCcw size={18} className="mr-2" />
                      შემდეგი კითხვა
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="writing" className="mt-6">
          {testState.currentWord && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Badge className="mb-4" style={{ background: theme.colors.primary }}>
                    {testState.currentWord.level}
                  </Badge>
                  <h3 
                    className="text-3xl font-bold mb-2"
                    style={{ color: theme.colors.text }}
                  >
                    {testState.currentWord.german}
                  </h3>
                  <p style={{ color: theme.colors.textMuted }}>
                    {testState.currentWord.phonetic}
                  </p>
                </div>

                <div className="space-y-4">
                  <Input
                    value={writingAnswer}
                    onChange={(e) => setWritingAnswer(e.target.value)}
                    placeholder="შეიყვანეთ თარგმანი..."
                    className="text-lg text-center"
                    disabled={testState.isCorrect !== null}
                    onKeyDown={(e) => e.key === 'Enter' && handleWritingSubmit()}
                  />

                  {testState.isCorrect === null ? (
                    <Button 
                      onClick={handleWritingSubmit}
                      className="w-full"
                      disabled={!writingAnswer.trim()}
                    >
                      შემოწმება
                    </Button>
                  ) : (
                    <div className="text-center">
                      <div 
                        className="p-4 rounded-lg mb-4"
                        style={{ 
                          background: testState.isCorrect 
                            ? `${theme.colors.success}20` 
                            : `${theme.colors.error}20` 
                        }}
                      >
                        {testState.isCorrect ? (
                          <div className="flex items-center justify-center gap-2" style={{ color: theme.colors.success }}>
                            <Check size={24} />
                            <span className="font-bold">სწორია!</span>
                          </div>
                        ) : (
                          <div style={{ color: theme.colors.error }}>
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <X size={24} />
                              <span className="font-bold">არასწორია</span>
                            </div>
                            <p>სწორი პასუხი: {testState.currentWord.georgian}</p>
                          </div>
                        )}
                      </div>
                      <Button onClick={generateQuestion}>
                        <RotateCcw size={18} className="mr-2" />
                        შემდეგი კითხვა
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="listening" className="mt-6">
          {testState.currentWord && (
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Badge className="mb-4" style={{ background: theme.colors.primary }}>
                    {testState.currentWord.level}
                  </Badge>
                  <p className="mb-4" style={{ color: theme.colors.textMuted }}>
                    მოუსმინეთ და აირჩიეთ სწორი თარგმანი
                  </p>
                  <Button
                    onClick={playListening}
                    size="lg"
                    className="w-20 h-20 rounded-full"
                  >
                    <Volume2 size={32} />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {testState.options.map((option, index) => {
                    const isSelected = testState.selectedAnswer === option;
                    const isCorrect = option === testState.currentWord?.georgian;
                    const showResult = testState.isCorrect !== null;
                    
                    let buttonStyle = {};
                    if (showResult) {
                      if (isCorrect) {
                        buttonStyle = { background: theme.colors.success, color: '#fff' };
                      } else if (isSelected && !isCorrect) {
                        buttonStyle = { background: theme.colors.error, color: '#fff' };
                      }
                    } else if (isSelected) {
                      buttonStyle = { background: theme.colors.primary, color: '#fff' };
                    }

                    return (
                      <Button
                        key={index}
                        variant="outline"
                        onClick={() => handleAnswer(option)}
                        disabled={testState.isCorrect !== null || !listeningPlayed}
                        className="h-auto py-4 text-lg"
                        style={buttonStyle}
                      >
                        {option}
                      </Button>
                    );
                  })}
                </div>

                {testState.isCorrect !== null && (
                  <div className="mt-6 text-center">
                    <p className="mb-4 text-lg" style={{ color: theme.colors.text }}>
                      {testState.currentWord.german} = {testState.currentWord.georgian}
                    </p>
                    <Button onClick={generateQuestion}>
                      <RotateCcw size={18} className="mr-2" />
                      შემდეგი კითხვა
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

import { useState, useMemo } from 'react';
import { Volume2, Check, X, RotateCcw, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById } from '@/data/themes';
import { words } from '@/data/words';
import { toast } from 'sonner';

interface SentenceExercise {
  sentence: string;
  translation: string;
  missingWord: string;
  options: string[];
}

const generateSentenceExercises = (learnedWords: number[]): SentenceExercise[] => {
  const exercises: SentenceExercise[] = [];
  const learnedWordObjects = words.filter(w => learnedWords.includes(w.id));
  
  if (learnedWordObjects.length < 5) {
    // Default exercises if not enough words learned
    return [
      {
        sentence: 'Ich ___ ein Buch.',
        translation: 'მე მაქვს წიგნი.',
        missingWord: 'habe',
        options: ['habe', 'bin', 'gehe', 'esse']
      },
      {
        sentence: 'Das Wetter ist ___.',
        translation: 'ამინდი კარგია.',
        missingWord: 'gut',
        options: ['gut', 'schlecht', 'kalt', 'warm']
      },
      {
        sentence: 'Ich ___ gern Schokolade.',
        translation: 'მე მიყვარს შოკოლადი.',
        missingWord: 'esse',
        options: ['esse', 'trinke', 'lese', 'schlafe']
      }
    ];
  }

  // Generate exercises from learned words
  const templates = [
    { sentence: 'Ich ___ gerne.', translation: 'მე მიყვარს {word}.' },
    { sentence: 'Das ist ein ___.', translation: 'ეს არის {word}.' },
    { sentence: 'Ich habe einen ___.', translation: 'მე მაქვს {word}.' },
    { sentence: 'Der ___ ist groß.', translation: '{word} დიდია.' },
    { sentence: 'Die ___ ist schön.', translation: '{word} ლამაზია.' }
  ];

  learnedWordObjects.slice(0, 10).forEach(word => {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const germanWord = word.german.replace(/^(der|die|das)\s+/i, '');
    
    // Generate wrong options
    const wrongOptions = learnedWordObjects
      .filter(w => w.id !== word.id)
      .map(w => w.german.replace(/^(der|die|das)\s+/i, ''))
      .filter((option, index, self) => self.indexOf(option) === index)
      .slice(0, 3);

    while (wrongOptions.length < 3) {
      wrongOptions.push(['gut', 'groß', 'schön', 'klein', 'neu'][wrongOptions.length % 5]);
    }

    exercises.push({
      sentence: template.sentence,
      translation: template.translation.replace('{word}', word.georgian),
      missingWord: germanWord,
      options: [germanWord, ...wrongOptions].sort(() => Math.random() - 0.5)
    });
  });

  return exercises.length > 0 ? exercises : [
    {
      sentence: 'Ich ___ Bücher.',
      translation: 'მე ვკითხულობ წიგნებს.',
      missingWord: 'lese',
      options: ['lese', 'schreibe', 'kaufe', 'finde']
    }
  ];
};

export const Sentences = () => {
  const { currentUser, recordStudySession } = useAuth();
  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');
  
  const exercises = useMemo(() => generateSentenceExercises(currentUser?.learnedWords || []), [currentUser?.learnedWords]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentExercise = exercises[currentIndex % exercises.length]!;

  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null) return;
    
    const correct = answer === currentExercise.missingWord;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    
    if (correct) {
      setScore(prev => prev + 1);
      toast.success('სწორია! 🎉');
    } else {
      toast.error('არასწორია. სცადე კიდევ ერთხელ!');
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowHint(false);
    setCurrentIndex(prev => (prev + 1) % exercises.length);
  };

  const playAudio = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentExercise.sentence.replace('___', currentExercise.missingWord));
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  };

  const hint = `სწორი სიტყვა იწყება "${currentExercise.missingWord[0]}"-ით`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            წინადადებების პრაქტიკა
          </h2>
          <p style={{ color: theme.colors.textMuted }}>
            შეავსე გამოტოვებული სიტყვები
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg" style={{ background: `${theme.colors.primary}20` }}>
            <span className="font-medium" style={{ color: theme.colors.primary }}>
              ქულა: {score}
            </span>
          </div>
        </div>
      </div>

      {/* Exercise Card */}
      <Card className="max-w-3xl mx-auto">
        <CardContent className="p-8">
          <div className="text-center mb-8">
            <div className="mb-4 text-sm" style={{ color: theme.colors.textMuted }}>
              სავარჯიშო {currentIndex + 1} / {exercises.length}
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: theme.colors.text }}>
              {currentExercise.sentence}
            </h3>
            <p style={{ color: theme.colors.textMuted }}>
              {currentExercise.translation}
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <Button variant="outline" onClick={playAudio}>
              <Volume2 size={18} className="mr-2" />
              მოსმენა
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentExercise.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const showResult = isCorrect !== null;
              const isRight = option === currentExercise.missingWord;

              let buttonStyle = {};
              if (showResult) {
                if (isRight) {
                  buttonStyle = { background: theme.colors.success, color: '#fff' };
                } else if (isSelected && !isRight) {
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
                  disabled={selectedAnswer !== null}
                  className="h-14 text-lg"
                  style={buttonStyle}
                >
                  {option}
                </Button>
              );
            })}
          </div>

          {isCorrect !== null && (
            <div className="mt-8 text-center space-y-4">
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                {isCorrect ? (
                  <div className="flex items-center justify-center gap-2" style={{ color: theme.colors.success }}>
                    <Check size={20} />
                    <span className="font-medium">სწორია!</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2" style={{ color: theme.colors.error }}>
                    <X size={20} />
                    <span className="font-medium">არასწორია</span>
                  </div>
                )}
              </div>

              {showHint && (
                <div className="p-4 rounded-lg" style={{ background: `${theme.colors.warning}15` }}>
                  <div className="flex items-center justify-center gap-2" style={{ color: theme.colors.warning }}>
                    <Lightbulb size={18} />
                    <span>{hint}</span>
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={() => setShowHint(true)}>
                  მინიშნება
                </Button>
                <Button onClick={handleNext}>
                  <RotateCcw size={18} className="mr-2" />
                  შემდეგი სავარჯიშო
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

import { useState, useEffect, useMemo } from 'react';
import { Volume2, Heart, ChevronLeft, ChevronRight, BookOpen, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById } from '@/data/themes';
import { words, categories, type Word } from '@/data/words';
import { toast } from 'sonner';

export const Learn = () => {
  const { currentUser, addLearnedWord, toggleFavoriteWord, updateDailyProgress, recordStudySession } = useAuth();
  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    recordStudySession();
  }, [recordStudySession]);

  const filteredWords = useMemo<Word[]>(() => {
    let filtered = words;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(w => w.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(w => w.level === selectedLevel);
    }

    return filtered;
  }, [selectedCategory, selectedLevel]);

  const currentWord = filteredWords[currentIndex]!;
  const isLearned = currentWord ? Boolean(currentUser?.learnedWords.includes(currentWord.id)) : false;
  const isFavorite = currentWord ? Boolean(currentUser?.favoriteWords.includes(currentWord.id)) : false;

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setCurrentIndex(0);
  };

  const handleLevelChange = (value: string) => {
    setSelectedLevel(value);
    setCurrentIndex(0);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : filteredWords.length - 1));
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex(prev => (prev < filteredWords.length - 1 ? prev + 1 : 0));
  };

  const handleMarkLearned = () => {
    if (currentWord && !isLearned) {
      addLearnedWord(currentWord.id);
      
      // Update daily progress
      const today = new Date().toISOString().split('T')[0];
      if (currentUser?.dailyProgress.date === today) {
        const newCount = currentUser.dailyProgress.wordsLearned + 1;
        updateDailyProgress({
          wordsLearned: newCount,
          goalReached: newCount >= currentUser.settings.dailyGoal
        });
      }
      
      toast.success('სიტყვა ნასწავლად მონიშნულია!');
    }
  };

  const handleToggleFavorite = () => {
    if (currentWord) {
      toggleFavoriteWord(currentWord.id);
      toast.success(isFavorite ? 'სიტყვა წაიშალა ფავორიტებიდან' : 'სიტყვა დაემატა ფავორიტებში');
    }
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('თქვენს ბრაუზერს არ აქვს აუდიოს მხარდაჭერა');
    }
  };

  if (filteredWords.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={64} className="mx-auto mb-4" style={{ color: theme.colors.textMuted }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: theme.colors.text }}>
          სიტყვები არ მოიძებნა
        </h3>
        <p style={{ color: theme.colors.textMuted }}>
          სცადეთ სხვა ფილტრები
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
            სიტყვების სწავლა
          </h2>
          <p style={{ color: theme.colors.textMuted }}>
            {filteredWords.length} სიტყვა ნაპოვნია
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-[200px]">
              <Filter size={16} className="mr-2" />
              <SelectValue placeholder="კატეგორია" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ყველა კატეგორია</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={handleLevelChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="დონე" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">ყველა დონე</SelectItem>
              <SelectItem value="A1">A1 - დამწყები</SelectItem>
              <SelectItem value="A2">A2 - ელემენტარული</SelectItem>
              <SelectItem value="B1">B1 - საშუალო</SelectItem>
              <SelectItem value="B2">B2 - ზემოთ საშუალო</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-4">
        <span className="text-sm" style={{ color: theme.colors.textMuted }}>
          {currentIndex + 1} / {filteredWords.length}
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-100">
          <div 
            className="h-full rounded-full transition-all"
            style={{ 
              width: `${((currentIndex + 1) / filteredWords.length) * 100}%`,
              background: theme.colors.primary 
            }}
          />
        </div>
      </div>

      {/* Word Card */}
      <div className="max-w-2xl mx-auto">
        <div 
          className="relative h-96 cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div 
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front */}
            <Card 
              className={`absolute inset-0 backface-hidden ${isFlipped ? 'invisible' : ''}`}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                <div className="flex items-center gap-2 mb-4">
                  <Badge style={{ background: theme.colors.primary }}>
                    {currentWord.level}
                  </Badge>
                  <Badge variant="outline">
                    {currentWord.category.split(' ')[0]}
                  </Badge>
                  {isLearned && (
                    <Badge style={{ background: theme.colors.success }}>
                      ნასწავლი
                    </Badge>
                  )}
                </div>

                <h3 
                  className="text-4xl lg:text-5xl font-bold mb-4 text-center"
                  style={{ color: theme.colors.text }}
                >
                  {currentWord.german}
                </h3>

                <p 
                  className="text-xl mb-6"
                  style={{ color: theme.colors.textMuted }}
                >
                  {currentWord.phonetic}
                </p>

                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(currentWord.german);
                  }}
                >
                  <Volume2 size={18} className="mr-2" />
                  მოსმენა
                </Button>

                <p className="mt-8 text-sm" style={{ color: theme.colors.textMuted }}>
                  დააჭირე თარგმანის სანახავად
                </p>
              </CardContent>
            </Card>

            {/* Back */}
            <Card 
              className={`absolute inset-0 backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : ''}`}
            >
              <CardContent className="h-full flex flex-col items-center justify-center p-8">
                <h3 
                  className="text-3xl lg:text-4xl font-bold mb-4 text-center"
                  style={{ color: theme.colors.text }}
                >
                  {currentWord.georgian}
                </h3>

                {currentUser?.settings.showExamples && currentWord.example && (
                  <div className="mt-6 p-4 rounded-lg w-full" style={{ background: `${theme.colors.primary}10` }}>
                    <p className="font-medium mb-2" style={{ color: theme.colors.text }}>
                      {currentWord.example}
                    </p>
                    <p style={{ color: theme.colors.textMuted }}>
                      {currentWord.exampleTranslation}
                    </p>
                  </div>
                )}

                <p className="mt-8 text-sm" style={{ color: theme.colors.textMuted }}>
                  დააჭირე სიტყვის სანახავად
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrev}
            className="flex items-center gap-2"
          >
            <ChevronLeft size={18} />
            წინა
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleToggleFavorite}
              className={isFavorite ? 'text-red-500' : ''}
            >
              <Heart size={18} className={isFavorite ? 'fill-current' : ''} />
            </Button>

            {!isLearned && (
              <Button
                onClick={handleMarkLearned}
                style={{ background: theme.colors.success }}
              >
                ნასწავლად მონიშვნა
              </Button>
            )}
          </div>

          <Button
            variant="outline"
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            შემდეგი
            <ChevronRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

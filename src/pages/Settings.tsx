import { useState } from 'react';
import { Volume2, Bell, BookOpen, Target, Check, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import { getThemeById } from '@/data/themes';
import type { TestType } from '@/types';
import { toast } from 'sonner';

const defaultTestTypes: TestType[] = ['multiple-choice', 'writing', 'listening', 'sentence'];

const getDefaultSettings = () => ({
  wordsPerSession: 10,
  dailyGoal: 20,
  notifications: true,
  soundEnabled: true,
  autoPlayAudio: false,
  showPhonetic: true,
  showExamples: true,
  testTypes: [...defaultTestTypes]
});

export const Settings = () => {
  const { currentUser, updateSettings } = useAuth();
  const theme = currentUser ? getThemeById(currentUser.theme) : getThemeById('default');
  
  const [settings, setSettings] = useState(currentUser?.settings || getDefaultSettings());

  const handleSave = () => {
    updateSettings(settings);
    toast.success('პარამეტრები შენახულია!');
  };

  const handleReset = () => {
    const defaults = getDefaultSettings();
    setSettings(defaults);
    updateSettings(defaults);
    toast.success('პარამეტრები დაბრუნდა ნაგულისხმევ მნიშვნელობებზე!');
  };

  const updateSetting = <K extends keyof typeof settings>(
    key: K, 
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold" style={{ color: theme.colors.text }}>
          პარამეტრები
        </h2>
        <p style={{ color: theme.colors.textMuted }}>
          მოირგე აპლიკაცია შენი საჭიროებების მიხედვით
        </p>
      </div>

      {/* Learning Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} style={{ color: theme.colors.primary }} />
            სწავლის პარამეტრები
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Words Per Session */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>სიტყვები სესიაზე</Label>
              <span className="font-medium" style={{ color: theme.colors.primary }}>
                {settings.wordsPerSession}
              </span>
            </div>
            <Slider
              value={[settings.wordsPerSession]}
              onValueChange={([value]) => updateSetting('wordsPerSession', value)}
              min={5}
              max={50}
              step={5}
            />
            <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
              რამდენი სიტყვა გსურს ერთ სწავლის სესიაში
            </p>
          </div>

          {/* Daily Goal */}
          <div>
            <div className="flex justify-between mb-2">
              <Label>დღიური მიზანი</Label>
              <span className="font-medium" style={{ color: theme.colors.primary }}>
                {settings.dailyGoal} სიტყვა
              </span>
            </div>
            <Slider
              value={[settings.dailyGoal]}
              onValueChange={([value]) => updateSetting('dailyGoal', value)}
              min={5}
              max={100}
              step={5}
            />
            <p className="text-sm mt-1" style={{ color: theme.colors.textMuted }}>
              რამდენი სიტყვის სწავლა გსურს ყოველდღიურად
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target size={20} style={{ color: theme.colors.secondary }} />
            ჩვენების პარამეტრები
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">ფონეტიკური ჩანაწერი</Label>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                აჩვენე ფონეტიკური ჩანაწერი სიტყვებისთვის
              </p>
            </div>
            <Switch
              checked={settings.showPhonetic}
              onCheckedChange={(checked) => updateSetting('showPhonetic', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="block">მაგალითები</Label>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                აჩვენე მაგალითი წინადადებები
              </p>
            </div>
            <Switch
              checked={settings.showExamples}
              onCheckedChange={(checked) => updateSetting('showExamples', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audio Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Volume2 size={20} style={{ color: theme.colors.accent }} />
            აუდიო პარამეტრები
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">ხმა</Label>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                ჩართე ხმოვანი ეფექტები
              </p>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => updateSetting('soundEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="block">ავტომატური გახმოვანება</Label>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                ავტომატურად გაახმოვანე სიტყვები
              </p>
            </div>
            <Switch
              checked={settings.autoPlayAudio}
              onCheckedChange={(checked) => updateSetting('autoPlayAudio', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={20} style={{ color: theme.colors.warning }} />
            შეტყობინებები
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">შეტყობინებები</Label>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                მიიღე შეტყობინებები დღიური მიზნის შესახებ
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(checked) => updateSetting('notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card style={{ borderColor: theme.colors.error }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: theme.colors.error }}>
            <AlertTriangle size={20} />
            საფრთხის ზონა
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label className="block" style={{ color: theme.colors.error }}>
                პარამეტრების გადატვირთვა
              </Label>
              <p className="text-sm" style={{ color: theme.colors.textMuted }}>
                ყველა პარამეტრი დაბრუნდება ნაგულისხმევ მნიშვნელობებზე
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={handleReset}
              style={{ borderColor: theme.colors.error, color: theme.colors.error }}
            >
              გადატვირთვა
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button 
          onClick={handleSave}
          size="lg"
          style={{ background: theme.colors.primary }}
        >
          <Check size={18} className="mr-2" />
          ცვლილებების შენახვა
        </Button>
      </div>
    </div>
  );
};

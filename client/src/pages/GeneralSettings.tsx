import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Clock, Keyboard, Accessibility, Monitor, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface GeneralSettings {
  language: string;
  timezone: string;
  fontSize: number;
  autoSave: boolean;
  keyboardShortcuts: boolean;
  animations: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  soundEffects: boolean;
  compactMode: boolean;
  showTips: boolean;
}

export default function GeneralSettings() {
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<GeneralSettings>({
    language: user?.language ?? 'en',
    timezone: user?.timezone ?? 'America/Los_Angeles',
    fontSize: 16,
    autoSave: true,
    keyboardShortcuts: true,
    animations: true,
    highContrast: false,
    reducedMotion: false,
    soundEffects: true,
    compactMode: false,
    showTips: true,
  });

  const handleToggle = (key: keyof GeneralSettings, value: boolean | string | number) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        language: settings.language,
        timezone: settings.timezone,
      });
      
      toast({
        title: "Settings saved",
        description: "Your preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings.",
        variant: "destructive",
      });
    }
  };

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'it', label: 'Italiano' },
    { value: 'pt', label: 'Português' },
    { value: 'ru', label: 'Русский' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
  ];

  const timezones = [
    { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
    { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
    { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
    { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
    { value: 'Europe/Paris', label: 'Central European Time (CET)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (JST)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (CST)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (IST)' },
    { value: 'Australia/Sydney', label: 'Australian Eastern Time (AET)' },
  ];

  const settingsCategories = [
    {
      title: "Localization",
      icon: Globe,
      description: "Language and regional preferences",
      settings: [
        {
          key: 'language',
          label: 'Language',
          description: 'Choose your preferred language',
          type: 'select',
          options: languages
        },
        {
          key: 'timezone',
          label: 'Timezone',
          description: 'Select your timezone for accurate scheduling',
          type: 'select',
          options: timezones
        }
      ]
    },
    {
      title: "Accessibility",
      icon: Accessibility,
      description: "Improve accessibility and usability",
      settings: [
        {
          key: 'highContrast',
          label: 'High contrast',
          description: 'Increase contrast for better visibility',
          type: 'toggle'
        },
        {
          key: 'reducedMotion',
          label: 'Reduced motion',
          description: 'Minimize animations and transitions',
          type: 'toggle'
        },
        {
          key: 'keyboardShortcuts',
          label: 'Keyboard shortcuts',
          description: 'Enable keyboard navigation shortcuts',
          type: 'toggle'
        }
      ]
    },
    {
      title: "Experience",
      icon: Monitor,
      description: "Customize your learning experience",
      settings: [
        {
          key: 'autoSave',
          label: 'Auto-save',
          description: 'Automatically save your work',
          type: 'toggle'
        },
        {
          key: 'soundEffects',
          label: 'Sound effects',
          description: 'Play sounds for interactions',
          type: 'toggle'
        },
        {
          key: 'showTips',
          label: 'Show tips',
          description: 'Display helpful tips and tutorials',
          type: 'toggle'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 pt-24 pb-12 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            General Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize your Coexist AI experience
          </p>
        </motion.div>

        <div className="space-y-6">
          {settingsCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.settings.map((setting, settingIndex) => (
                    <div key={setting.key}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <Label className="text-base font-medium">{setting.label}</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {setting.description}
                          </p>
                        </div>
                        
                        {setting.type === 'toggle' && (
                          <Switch
                            checked={settings[setting.key as keyof GeneralSettings] as boolean}
                            onCheckedChange={(checked) => 
                              handleToggle(setting.key as keyof GeneralSettings, checked)
                            }
                          />
                        )}
                        
                        {setting.type === 'select' && setting.options && (
                          <div className="w-48">
                            <Select
                              value={settings[setting.key as keyof GeneralSettings] as string}
                              onValueChange={(value) => 
                                handleToggle(setting.key as keyof GeneralSettings, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {setting.options.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                        
                        {setting.type === 'slider' && (
                          <div className="w-48">
                            <div className="flex items-center gap-3">
                              <Slider
                                value={[settings[setting.key as keyof GeneralSettings] as number]}
                                onValueChange={(value) => 
                                  handleToggle(setting.key as keyof GeneralSettings, value[0])
                                }
                                min={setting.min}
                                max={setting.max}
                                step={setting.step}
                                className="flex-1"
                              />
                              <span className="text-sm font-medium w-8 text-center">
                                {settings[setting.key as keyof GeneralSettings]}px
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {settingIndex < category.settings.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Data Export */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Data & Backup
                </CardTitle>
                <CardDescription>
                  Export your settings and learning data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Export settings</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Download your current preferences as a backup
                    </p>
                  </div>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Import settings</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Restore settings from a backup file
                    </p>
                  </div>
                  <Button variant="outline">
                    Import Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-end"
          >
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
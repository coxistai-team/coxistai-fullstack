import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, MessageSquare, Calendar, BookOpen, User, Shield, Volume2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/contexts/UserContext";

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  studyReminders: boolean;
  assignmentDeadlines: boolean;
  forumReplies: boolean;
  aiTutorSessions: boolean;
  weeklyDigest: boolean;
  marketingEmails: boolean;
  soundEnabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export default function NotificationSettings() {
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: user?.emailNotifications ?? true,
    pushNotifications: user?.pushNotifications ?? true,
    studyReminders: true,
    assignmentDeadlines: true,
    forumReplies: true,
    aiTutorSessions: true,
    weeklyDigest: user?.weeklyDigest ?? true,
    marketingEmails: user?.marketingEmails ?? false,
    soundEnabled: true,
    frequency: 'daily',
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  const handleToggle = (key: keyof NotificationSettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        emailNotifications: settings.emailNotifications,
        pushNotifications: settings.pushNotifications,
        weeklyDigest: settings.weeklyDigest,
        marketingEmails: settings.marketingEmails
      });
      
      toast({
        title: "Settings saved",
        description: "Your notification preferences have been updated.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notification settings.",
        variant: "destructive",
      });
    }
  };

  const notificationCategories = [
    {
      title: "Learning & Study",
      icon: BookOpen,
      notifications: [
        { key: 'studyReminders', label: 'Study session reminders', description: 'Get notified about scheduled study sessions' },
        { key: 'assignmentDeadlines', label: 'Assignment deadlines', description: 'Reminders for upcoming deadlines' },
        { key: 'aiTutorSessions', label: 'AI Tutor interactions', description: 'Updates from your SparkTutor sessions' },
      ]
    },
    {
      title: "Community & Social",
      icon: MessageSquare,
      notifications: [
        { key: 'forumReplies', label: 'Forum replies', description: 'When someone replies to your posts' },
      ]
    },
    {
      title: "Account & System",
      icon: User,
      notifications: [
        { key: 'emailNotifications', label: 'Email notifications', description: 'Receive notifications via email' },
        { key: 'pushNotifications', label: 'Push notifications', description: 'Browser and device notifications' },
        { key: 'weeklyDigest', label: 'Weekly digest', description: 'Summary of your learning progress' },
        { key: 'marketingEmails', label: 'Marketing emails', description: 'Updates about new features and offers' },
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
            Notification Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Customize how and when you receive notifications
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* General Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure your overall notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Sound notifications</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Play sounds for notifications</p>
                  </div>
                  <Switch
                    checked={settings.soundEnabled}
                    onCheckedChange={(checked) => handleToggle('soundEnabled', checked)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Notification frequency</Label>
                  <Select
                    value={settings.frequency}
                    onValueChange={(value: 'immediate' | 'daily' | 'weekly') => 
                      setSettings(prev => ({ ...prev, frequency: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="daily">Daily digest</SelectItem>
                      <SelectItem value="weekly">Weekly summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base font-medium">Quiet hours</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Disable notifications during specific hours</p>
                    </div>
                    <Switch
                      checked={settings.quietHours.enabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ 
                          ...prev, 
                          quietHours: { ...prev.quietHours, enabled: checked }
                        }))
                      }
                    />
                  </div>
                  
                  {settings.quietHours.enabled && (
                    <div className="grid grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label className="text-sm">From</Label>
                        <Select
                          value={settings.quietHours.start}
                          onValueChange={(value) => 
                            setSettings(prev => ({ 
                              ...prev, 
                              quietHours: { ...prev.quietHours, start: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-sm">To</Label>
                        <Select
                          value={settings.quietHours.end}
                          onValueChange={(value) => 
                            setSettings(prev => ({ 
                              ...prev, 
                              quietHours: { ...prev.quietHours, end: value }
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => {
                              const hour = i.toString().padStart(2, '0');
                              return (
                                <SelectItem key={hour} value={`${hour}:00`}>
                                  {hour}:00
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Categories */}
          {notificationCategories.map((category, index) => (
            <motion.div
              key={category.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-white/20 dark:border-gray-700/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5" />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {category.notifications.map((notification, notifIndex) => (
                    <div key={notification.key}>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-base font-medium">{notification.label}</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {notification.description}
                          </p>
                        </div>
                        <Switch
                          checked={settings[notification.key as keyof NotificationSettings] as boolean}
                          onCheckedChange={(checked) => 
                            handleToggle(notification.key as keyof NotificationSettings, checked)
                          }
                        />
                      </div>
                      {notifIndex < category.notifications.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}

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
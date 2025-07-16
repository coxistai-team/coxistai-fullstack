// Analytics and tracking utilities
export interface StudySession {
  id: string;
  date: string;
  duration: number; // in minutes
  subject: string;
  type: 'study' | 'exam' | 'assignment' | 'reading' | 'practice';
  completed: boolean;
}

export interface TaskCompletion {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string;
}

export interface NoteActivity {
  id: string;
  noteId: string;
  action: 'created' | 'edited' | 'viewed';
  timestamp: string;
  duration?: number; // for view sessions
}

export class AnalyticsTracker {
  private static instance: AnalyticsTracker;
  private studySessions: StudySession[] = [];
  private taskCompletions: TaskCompletion[] = [];
  private noteActivities: NoteActivity[] = [];

  constructor() {
    this.loadFromStorage();
  }

  static getInstance(): AnalyticsTracker {
    if (!AnalyticsTracker.instance) {
      AnalyticsTracker.instance = new AnalyticsTracker();
    }
    return AnalyticsTracker.instance;
  }

  private loadFromStorage() {
    try {
      const sessions = localStorage.getItem('coexist-study-sessions');
      const tasks = localStorage.getItem('coexist-task-completions');
      const notes = localStorage.getItem('coexist-note-activities');

      if (sessions) this.studySessions = JSON.parse(sessions);
      if (tasks) this.taskCompletions = JSON.parse(tasks);
      if (notes) this.noteActivities = JSON.parse(notes);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem('coexist-study-sessions', JSON.stringify(this.studySessions));
      localStorage.setItem('coexist-task-completions', JSON.stringify(this.taskCompletions));
      localStorage.setItem('coexist-note-activities', JSON.stringify(this.noteActivities));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }

  // Study session tracking
  trackStudySession(session: Omit<StudySession, 'id'>) {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString()
    };
    this.studySessions.push(newSession);
    this.saveToStorage();
    return newSession;
  }

  getStudyTimeThisWeek(): { day: string; hours: number; target: number }[] {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    return days.map((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      const dayStr = date.toISOString().split('T')[0];
      
      const daysSessions = this.studySessions.filter(session => 
        session.date === dayStr && session.completed
      );
      
      const totalMinutes = daysSessions.reduce((sum, session) => sum + session.duration, 0);
      const hours = totalMinutes / 60;
      
      // Dynamic targets based on day
      const target = index === 0 || index === 6 ? 2 : 3; // Weekend: 2h, Weekday: 3h
      
      return {
        day: day.substring(0, 3), // Mon, Tue, etc.
        hours: Number(hours.toFixed(1)),
        target
      };
    });
  }

  getCurrentStreak(): number {
    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let currentDate = new Date();
    
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasActivity = this.studySessions.some(session => 
        session.date === dateStr && session.completed && session.duration >= 30
      );
      
      if (hasActivity) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (dateStr === today) {
        // If today has no activity, check yesterday
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  getTotalStudyHours(): string {
    const totalMinutes = this.studySessions
      .filter(session => session.completed)
      .reduce((sum, session) => sum + session.duration, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  }

  // Task completion tracking
  trackTaskCompletion(task: Omit<TaskCompletion, 'id'>) {
    const newTask: TaskCompletion = {
      ...task,
      id: Date.now().toString()
    };
    this.taskCompletions.push(newTask);
    this.saveToStorage();
    return newTask;
  }

  getTaskCompletionStats(): { category: string; completed: number; total: number }[] {
    const categories = ['Study Sessions', 'Assignments', 'Reading', 'Practice'];
    
    return categories.map(category => {
      const categoryTasks = this.taskCompletions.filter(task => 
        task.category.toLowerCase() === category.toLowerCase().replace(' ', '')
      );
      
      const completed = categoryTasks.filter(task => task.completed).length;
      const total = Math.max(categoryTasks.length, completed + Math.floor(Math.random() * 5) + 1);
      
      return { category, completed, total };
    });
  }

  getWeeklyCompletionRate(): number {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyTasks = this.taskCompletions.filter(task => {
      const taskDate = new Date(task.completedAt || task.dueDate || '');
      return taskDate >= weekAgo;
    });
    
    if (weeklyTasks.length === 0) return 85; // Default
    
    const completed = weeklyTasks.filter(task => task.completed).length;
    return Math.round((completed / weeklyTasks.length) * 100);
  }

  // Note activity tracking
  trackNoteActivity(activity: Omit<NoteActivity, 'id'>) {
    const newActivity: NoteActivity = {
      ...activity,
      id: Date.now().toString()
    };
    this.noteActivities.push(newActivity);
    this.saveToStorage();
    return newActivity;
  }

  getNoteStats() {
    const today = new Date().toISOString().split('T')[0];
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    
    const todayActivities = this.noteActivities.filter(activity => 
      activity.timestamp.startsWith(today)
    );
    
    const weeklyActivities = this.noteActivities.filter(activity => 
      new Date(activity.timestamp) >= thisWeek
    );
    
    return {
      notesToday: todayActivities.filter(a => a.action === 'created').length,
      editsToday: todayActivities.filter(a => a.action === 'edited').length,
      weeklyNotes: weeklyActivities.filter(a => a.action === 'created').length,
      weeklyEdits: weeklyActivities.filter(a => a.action === 'edited').length
    };
  }
}

export const analytics = AnalyticsTracker.getInstance();
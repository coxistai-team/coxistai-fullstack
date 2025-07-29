"use client"
import React, { useState, useEffect, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Clock, 
  Users, 
  Calendar as CalendarIcon, 
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Trash2,
  ExternalLink,
  MapPin,
  Bell,
  X,
  Zap,
  Brain,
  Target,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Activity,
  BarChart3,
  Users2,
  Award,
  Star
} from "lucide-react";
import { analytics } from "@/utils/analytics";
import GlassmorphismButton from "@/components/ui/glassmorphism-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, getYear, getMonth, startOfWeek, endOfWeek } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuthLoading } from "@/contexts/AuthContext";
import { SkeletonLoader } from "@/components/ui/page-loader";
import ParticleField from "@/components/effects/ParticleField";
// Import new components
import CalendarSidebar from "@/components/noteshub/CalendarSidebar";
import CalendarHeader from "@/components/noteshub/CalendarHeader";
import CalendarGrid from "@/components/noteshub/CalendarGrid";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string; // <-- string, not Date
  time: string;
  duration: number; // in minutes
  location?: string;
  type: 'study' | 'exam' | 'assignment' | 'personal' | 'group';
  color: string;
  reminder?: number; // minutes before
  googleEventId?: string;
  attachments?: string[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: Date;
  priority: 'low' | 'medium' | 'high';
}

// ErrorBoundary for SmartCalendar
class CalendarErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error('SmartCalendar error:', error, info); }
  render() { if (this.state.hasError) return <div className="text-red-500 text-center py-8">Something went wrong in Calendar.</div>; return this.props.children; }
}

const SmartCalendar = () => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium' as 'low' | 'medium' | 'high' });
  const [taskDialogDate, setTaskDialogDate] = useState<Date | null>(null);
  
  // Real analytics data
  const [studyTimeData, setStudyTimeData] = useState(() => analytics.getStudyTimeThisWeek());
  const [currentStreak, setCurrentStreak] = useState(() => analytics.getCurrentStreak());
  const [totalStudyHours, setTotalStudyHours] = useState(() => analytics.getTotalStudyHours());
  const [taskStats, setTaskStats] = useState(() => analytics.getTaskCompletionStats());
  const [completionRate, setCompletionRate] = useState(() => analytics.getWeeklyCompletionRate());
  
  // Event and task storage
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  
  const [tasks, setTasks] = useState<Task[]>(() => {
    return [];
  });

  // Define typeDefaults at the top of the component
  const typeDefaults = {
    study: { title: 'Study Session', duration: 60 },
    exam: { title: 'Exam', duration: 120 },
    assignment: { title: 'Assignment Due', duration: 30 },
    group: { title: 'Group Study', duration: 90 },
    personal: { title: 'Personal Event', duration: 60 }
  };

  // 1. Add date to newEvent state and bind to input
  // newEvent.date is always a string (yyyy-mm-dd)
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent> & { date: string }>({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    duration: 60,
    type: 'study',
    color: '#3B82F6',
    reminder: 15
  });

  // Add state for event attachments
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  // Add a loading state for tasks
  const [isSavingTask, setIsSavingTask] = useState(false);

  const isAuthLoading = useAuthLoading();
  const [isEventsLoading, setIsEventsLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch events from backend on mount
  useEffect(() => {
    if (isAuthLoading) return;
    setIsEventsLoading(true);
    const token = localStorage.getItem('authToken');
    fetch(`${API_URL}/api/calendar`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        setEvents(data.map((e: any) => ({ ...e, date: typeof e.date === 'string' ? e.date : (new Date(e.date)).toISOString().split('T')[0] })));
      })
      .catch(() => setEvents([]))
      .finally(() => setIsEventsLoading(false));
  }, [isAuthLoading]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await fetch(`${API_URL}/api/calendar/tasks`, { method: 'GET', headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch tasks");
        const data: Task[] = await res.json();
        setTasks(data);
      } catch (e: any) {
        toast({ title: "Failed to load tasks", description: e.message, variant: "destructive" });
      }
    };
    fetchTasks();
  }, [toast]);

  // Refresh analytics data
  const refreshAnalytics = () => {
    setStudyTimeData(analytics.getStudyTimeThisWeek());
    setCurrentStreak(analytics.getCurrentStreak());
    setTotalStudyHours(analytics.getTotalStudyHours());
    setTaskStats(analytics.getTaskCompletionStats());
    setCompletionRate(analytics.getWeeklyCompletionRate());
  };

  // Event type colors
  const eventColors = {
    study: '#3B82F6',
    exam: '#EF4444',
    assignment: '#F59E0B',
    personal: '#10B981',
    group: '#8B5CF6'
  };

  // Navigation functions
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const navigateToToday = () => {
    setCurrentDate(new Date());
  };

  // Get calendar days for current view
  const getCalendarDays = () => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => isSameDay(task.date, date));
  };

  // Add a helper to get local date string in 'yyyy-MM-dd' format
  function getLocalDateString(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // --- Optimistic Add Task ---
  const addTask = async (title: string, date: Date, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const optimisticTask = {
      id: 'optimistic-' + Date.now(),
      title,
      completed: false,
      priority,
      date,
    };
    setTasks(prev => [...prev, optimisticTask]);
    setShowTaskDialog(false);
    setNewTask({ title: '', priority: 'medium' });
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/calendar/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, date: getLocalDateString(date), priority })
      });
      if (!res.ok) throw new Error("Failed to add task");
      const newTask = await res.json();
      setTasks(prev => prev.map(t => t.id === optimisticTask.id ? newTask : t));
      toast({ title: "Task Added", description: `Task "${newTask.title}" added.` });
    } catch (e: any) {
      setTasks(prev => prev.filter(t => t.id !== optimisticTask.id));
      toast({ title: "Add Failed", description: e.message, variant: "destructive" });
    }
  };

  // --- Optimistic Toggle Task ---
  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const optimisticTasks = tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
    setTasks(optimisticTasks);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/calendar/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ completed: !task.completed })
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      toast({ title: "Task Updated", description: `Task "${updatedTask.title}" updated.` });
    } catch (e: any) {
      setTasks(tasks); // rollback
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  // --- Optimistic Edit Task ---
  const saveEditTask = async () => {
    if (!editingTask) return;
    setIsSavingTask(true);
    const prevTasks = [...tasks];
    const optimisticTasks = tasks.map(t => t.id === editingTask.id ? { ...t, title: editTaskData.title, priority: editTaskData.priority } : t);
    setTasks(optimisticTasks);
    setEditingTask(null);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/calendar/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editTaskData.title, priority: editTaskData.priority })
      });
      if (!res.ok) throw new Error("Failed to update task");
      const updatedTask = await res.json();
      setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
      toast({ title: "Task Updated", description: `Task "${updatedTask.title}" updated.` });
    } catch (e: any) {
      setTasks(prevTasks); // rollback
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSavingTask(false);
    }
  };

  // --- Optimistic Delete Task ---
  const deleteTask = async (taskId: string) => {
    const prevTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/calendar/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete task");
      toast({ title: "Task Deleted", description: "Task has been removed." });
    } catch (e: any) {
      setTasks(prevTasks); // rollback
      toast({ title: "Delete Failed", description: e.message, variant: "destructive" });
    }
  };

  // --- Optimistic Save Event (Add/Edit) ---
  const saveEvent = async () => {
    setIsSavingEvent(true);
    if (!newEvent.title || !newEvent.date) return;
    const eventData: any = {
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      time: newEvent.time,
      duration: newEvent.duration,
      location: newEvent.location,
      type: newEvent.type,
      color: eventColors[newEvent.type!],
      reminder: newEvent.reminder,
    };
    let prevEvents = [...events];
    let optimisticEvent: CalendarEvent | null = null;
    if (!editingEvent) {
      optimisticEvent = {
        ...eventData,
        id: 'optimistic-' + Date.now() + '-' + Math.random(),
        googleEventId: '',
        attachments: [],
      };
      setEvents(prev => [...prev, optimisticEvent!]);
    } else {
      setEvents(prev => prev.map(e => e.id === editingEvent!.id ? { ...e, ...eventData } : e));
    }
    setShowEventDialog(false);
    setEditingEvent(null);
    setNewEvent({ title: '', description: '', date: '', time: '09:00', duration: 60, type: 'study', color: '#3B82F6', reminder: 15 });
    try {
      let res, saved;
      const token = localStorage.getItem('authToken');
      if (editingEvent) {
        res = await fetch(`${API_URL}/api/calendar/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...eventData })
        });
      } else {
        res = await fetch(`${API_URL}/api/calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...eventData })
        });
      }
      if (!res.ok) throw new Error("Failed to save event");
      saved = await res.json();
      setEvents(prev => {
        if (editingEvent) {
          return prev.map(e => e.id === editingEvent!.id ? saved : e);
        } else {
          return prev.map(e => e.id === optimisticEvent!.id ? saved : e);
        }
      });
      toast({ title: editingEvent ? "Event Updated" : "Event Created", description: `Event ${editingEvent ? "updated" : "created"} successfully.` });
    } catch (e: any) {
      setEvents(prevEvents); // rollback
      toast({ title: "Save Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSavingEvent(false);
    }
  };

  // --- Optimistic Delete Event ---
  const deleteEvent = async (eventId: string) => {
    const prevEvents = [...events];
    setEvents(prev => prev.filter(e => e.id !== eventId));
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/calendar/${eventId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to delete event");
      toast({ title: "Event Deleted", description: "Event has been removed." });
    } catch (e: any) {
      setEvents(prevEvents); // rollback
      toast({ title: "Delete Failed", description: e.message, variant: "destructive" });
    }
  };

  // Reset event dialog
  const resetEventDialog = () => {
    setShowEventDialog(false);
    setEditingEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: '', // <-- reset date
      time: '09:00',
      duration: 60,
      type: 'study',
      color: '#3B82F6',
      reminder: 15
    });
    setSelectedDate(null);
  };

  // Open event dialog for specific date with optional event type preset
  const openEventDialog = (date: Date, event?: CalendarEvent, eventType?: 'study' | 'exam' | 'assignment' | 'personal' | 'group') => {
    if (event) {
      setEditingEvent(event);
      setNewEvent({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        duration: event.duration,
        location: event.location,
        type: event.type,
        color: event.color,
        reminder: event.reminder,
      });
      // Do not setSelectedDate to a string
    } else {
      const dateStr = date.toISOString().split('T')[0];
      setNewEvent({
        title: eventType ? typeDefaults[eventType].title : '',
        description: '',
        date: dateStr,
        time: '09:00',
        duration: eventType ? typeDefaults[eventType].duration : 60,
        type: eventType || 'study',
        color: eventType ? eventColors[eventType] : '#3B82F6',
        reminder: 15,
      });
      // Do not setSelectedDate to a string
    }
    setShowEventDialog(true);
  };

  // Year and month navigation
  const navigateToYear = (year: number) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(year);
    setCurrentDate(newDate);
    setShowYearSelector(false);
  };

  const navigateToMonth = (month: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month);
    setCurrentDate(newDate);
    setShowMonthSelector(false);
  };

  // Generate year range for selector
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i);
    }
    return years;
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // --- Add edit and delete task functionality, edit dialog, and UI icons ---
  // 1. Add state for editing a task
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTaskData, setEditTaskData] = useState({ title: '', priority: 'medium' as 'low' | 'medium' | 'high' });

  // 2. Edit task handler
  const openEditTaskDialog = (task: Task) => {
    setEditingTask(task);
    setEditTaskData({ title: task.title, priority: task.priority });
    setShowTaskDialog(false);
  };

  // Handle task dialog
  const openTaskDialog = (date?: Date) => {
    setTaskDialogDate(date || selectedDate || new Date());
    setNewTask({ title: '', priority: 'medium' });
    setShowTaskDialog(true);
  };

  // Update saveTask to set loading state
  const saveTask = async () => {
    if (!newTask.title.trim()) return;
    setIsSavingTask(true);
    await addTask(newTask.title, taskDialogDate || new Date(), newTask.priority);
    setShowTaskDialog(false);
    setNewTask({ title: '', priority: 'medium' });
    setIsSavingTask(false);
    setTaskDialogDate(null);
  };

  // Generate Google Calendar link
  const generateGoogleCalendarLink = (event: CalendarEvent) => {
    const startDate = new Date(event.date);
    const [hours, minutes] = event.time.split(':').map(Number);
    startDate.setHours(hours, minutes);
    
    const endDate = new Date(startDate.getTime() + event.duration * 60000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
      details: event.description || '',
      location: event.location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  // AI suggestions based on current schedule
  const getAISuggestions = () => {
    const today = new Date();
    const todaysEvents = getEventsForDate(today);
    const upcomingExams = events.filter(e => e.type === 'exam' && new Date(e.date) > today).length;
    
    const suggestions = [];
    
    if (todaysEvents.length === 0) {
      suggestions.push("📚 Your schedule is free today - perfect time for focused study!");
    }
    
    if (upcomingExams > 0) {
      suggestions.push(`⚡ You have ${upcomingExams} upcoming exam${upcomingExams > 1 ? 's' : ''} - schedule review sessions`);
    }
    
    if (todaysEvents.length > 3) {
      suggestions.push("⏰ Busy day ahead - consider scheduling short breaks between sessions");
    }
    
    suggestions.push("🎯 Set up study reminders 15 minutes before each session");
    
    return suggestions;
  };

  const calendarDays = getCalendarDays();
  const allEvents = [...events].sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime());
  const todaysTasks = getTasksForDate(new Date());
  const aiSuggestions = getAISuggestions();

  // Defensive helpers
  const safeArray = <T,>(val: T[] | undefined): T[] => Array.isArray(val) ? val : [];
  const safeEvent = (event: any = {}): CalendarEvent => ({
    id: event.id?.toString() || Date.now().toString(),
    title: event.title || 'Untitled',
    description: event.description || '',
    date: typeof event.date === 'string' ? event.date : (new Date(event.date)).toISOString().split('T')[0],
    time: event.time || '',
    duration: typeof event.duration === 'number' ? event.duration : 60,
    location: event.location || '',
    type: event.type || 'personal',
    color: event.color || '#3b82f6',
    reminder: typeof event.reminder === 'number' ? event.reminder : 10,
    googleEventId: event.googleEventId || '',
    attachments: safeArray(event.attachments),
  });

  // Map events to ensure 'type' is the correct union type
  const allEventsForSidebar = allEvents.map(e => ({
    ...e,
    type: (['study', 'exam', 'assignment', 'personal', 'group'].includes(e.type) ? e.type : 'personal') as 'study' | 'exam' | 'assignment' | 'personal' | 'group',
  }));
  // Compute the date to show tasks for
  const sidebarTaskDate = selectedDate || new Date();
  const sidebarTasks = getTasksForDate(sidebarTaskDate);
  const sidebarTaskLabel = isToday(sidebarTaskDate)
    ? "Today's Tasks"
    : `Tasks for ${format(sidebarTaskDate, 'EEEE, d MMMM yyyy')}`;
  // Map tasks to ensure 'date' property exists and is a Date
  const sidebarTasksForSidebar = sidebarTasks.map(t => ({ ...t, date: t.date ? new Date(t.date) : new Date() }));

  const [dayContextMenu, setDayContextMenu] = useState<{ x: number; y: number; date: Date | null; show: boolean }>({ x: 0, y: 0, date: null, show: false });
  const dayContextMenuRef = useRef<HTMLDivElement>(null);

  // Handler for right-click on a day
  const handleDayContextMenu = (date: Date) => {
    setSelectedDate(date);
    setDayContextMenu({ x: window.event ? (window.event as MouseEvent).clientX : 0, y: window.event ? (window.event as MouseEvent).clientY : 0, date, show: true });
  };

  // Handler for closing the custom context menu
  const closeDayContextMenu = () => setDayContextMenu({ ...dayContextMenu, show: false });

  // Handler for Add Event from context menu
  const handleAddEventFromMenu = () => {
    if (dayContextMenu.date) {
      setSelectedDate(dayContextMenu.date);
      openEventDialog(dayContextMenu.date);
    }
    closeDayContextMenu();
  };
  // Handler for Add Task from context menu
  const handleAddTaskFromMenu = () => {
    if (dayContextMenu.date) {
      setSelectedDate(dayContextMenu.date);
      openTaskDialog(dayContextMenu.date);
    }
    closeDayContextMenu();
  };
  // Handler for Edit Event from context menu
  const handleEditEventFromMenu = () => {
    if (dayContextMenu.date) {
      const eventsForDay = getEventsForDate(dayContextMenu.date);
      if (eventsForDay.length > 0) openEventDialog(dayContextMenu.date, eventsForDay[0]);
    }
    closeDayContextMenu();
  };

  // Handler for right-click on an event
  const handleEventContextMenu = (event: CalendarEvent, date: Date) => {
    setSelectedDate(date);
    openEventDialog(date, event);
  };

  // Handler for right-click on a task
  const handleTaskContextMenu = (task: Task, date: Date) => {
    setSelectedDate(date);
    openEditTaskDialog(task);
  };

  // Close context menu on outside click, scroll, or blur
  useEffect(() => {
    if (!dayContextMenu.show) return;
    function handleClick(e: MouseEvent) {
      if (dayContextMenuRef.current && !dayContextMenuRef.current.contains(e.target as Node)) {
        closeDayContextMenu();
      }
    }
    function handleScrollOrBlur() {
      closeDayContextMenu();
    }
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScrollOrBlur, true);
    window.addEventListener('blur', handleScrollOrBlur);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScrollOrBlur, true);
      window.removeEventListener('blur', handleScrollOrBlur);
    };
  }, [dayContextMenu.show]);

  if (isEventsLoading) {
    return (
      <main className="relative z-10 pt-16 bg-black text-white overflow-hidden">
        {/* Particle Field Background */}
        <ParticleField />
        
        {/* Creative Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl floating-element"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl floating-element"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-2xl floating-element"></div>
          
          {/* Creative Shapes */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl creative-shape"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-lg creative-shape"></div>
          <div className="absolute top-1/3 right-1/3 w-16 h-16 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-md creative-shape"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="mb-6 w-1/2 h-10 bg-gray-800 rounded animate-pulse"></div>
          <div className="grid grid-cols-7 gap-2 mb-8">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-8 rounded bg-gray-800 animate-pulse"></div>
            ))}
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-20 rounded-lg bg-gray-800 animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-800 animate-pulse"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <CalendarErrorBoundary>
      <main className="flex min-h-screen bg-black text-white overflow-hidden">
        {/* Sidebar: Events and Tasks */}
        <CalendarSidebar
          events={allEventsForSidebar}
          tasks={sidebarTasksForSidebar}
          onEventClick={event => openEventDialog(new Date(event.date), event)}
          onTaskClick={task => toggleTask(task.id)}
          onAddEvent={() => openEventDialog(selectedDate || new Date())}
          onAddTask={() => openTaskDialog(selectedDate || new Date())}
          onEditEvent={event => openEventDialog(new Date(event.date), event)}
          onDeleteEvent={event => deleteEvent(event.id)}
          onEditTask={task => openEditTaskDialog(task)}
          onDeleteTask={task => deleteTask(task.id)}
          onToggleTaskComplete={task => toggleTask(task.id)}
          taskHeaderLabel={sidebarTaskLabel}
        />
        {/* Main content: Calendar fills the rest */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-black">
          <div className="px-4 pt-8 pb-4 bg-slate-900 border-b border-slate-800">
            <CalendarHeader
              currentDate={currentDate}
              onPrevMonth={() => setCurrentDate(subMonths(currentDate, 1))}
              onNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
              onToday={() => setCurrentDate(new Date())}
              isMobile={false}
              onAddEvent={() => openEventDialog(selectedDate || new Date())}
                          />
                        </div>
          <div className="flex-1 flex flex-col justify-stretch">
            <CalendarGrid
              currentDate={currentDate}
              isMobile={false}
              getEventsForDate={getEventsForDate}
              getTasksForDate={getTasksForDate}
              onDayClick={setSelectedDate}
              onDayDoubleClick={openEventDialog}
              selectedDate={selectedDate}
              onDayContextMenu={date => {
                handleDayContextMenu(date);
              }}
              onEventContextMenu={handleEventContextMenu}
              onTaskContextMenu={handleTaskContextMenu}
              loading={isSavingEvent || isSavingTask || isAuthLoading}
            />
        <div className="mt-12">
              {/* Analytics and AI suggestions here */}
                      </div>
                </div>
          {/* Dialogs and overlays (keep as before) */}
          {dayContextMenu.show && (
            <div
              ref={dayContextMenuRef}
              style={{ position: 'fixed', top: dayContextMenu.y, left: dayContextMenu.x, zIndex: 9999 }}
              className="bg-slate-900 border border-slate-700 rounded-lg shadow-lg py-2 w-44 text-white"
              onContextMenu={e => e.preventDefault()}
              onClick={closeDayContextMenu}
            >
              <button className="w-full text-left px-4 py-2 hover:bg-slate-800" onClick={handleAddEventFromMenu}>Add Event</button>
              <button className="w-full text-left px-4 py-2 hover:bg-slate-800" onClick={handleAddTaskFromMenu}>Add Task</button>
              {dayContextMenu.date && getEventsForDate(dayContextMenu.date).length > 0 && (
                <button className="w-full text-left px-4 py-2 hover:bg-slate-800" onClick={handleEditEventFromMenu}>Edit Event</button>
              )}
                </div>
          )}
        {/* Year Selector Dialog */}
        <Dialog open={showYearSelector} onOpenChange={setShowYearSelector}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Select Year</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-2 mt-4 max-h-60 overflow-y-auto">
              {getYearRange().map((year) => (
                <button
                  key={year}
                  onClick={() => navigateToYear(year)}
                  className={`p-2 rounded-lg text-sm transition-colors ${
                    year === getYear(currentDate)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Month Selector Dialog */}
        <Dialog open={showMonthSelector} onOpenChange={setShowMonthSelector}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-white/20">
            <DialogHeader>
              <DialogTitle className="text-slate-900 dark:text-white">Select Month</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => navigateToMonth(index)}
                  className={`p-3 rounded-lg text-sm transition-colors ${
                    index === getMonth(currentDate)
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {month}
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Task Dialog */}
        <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
            <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
                <DialogTitle className="text-white">Add New Task</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              {/* Show selected date */}
              <div className="flex items-center gap-2 mb-2">
                <CalendarIcon className="w-5 h-5 text-blue-400" />
                <span className="text-base font-semibold text-blue-200">
                  {taskDialogDate ? format(taskDialogDate, 'EEEE, d MMMM yyyy') : format(new Date(), 'EEEE, d MMMM yyyy')}
                </span>
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                  Task Title
                </label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter task title..."
                    className="bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-blue-500 transition-all duration-150"
                />
              </div>
              
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                  Priority
                </label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask(prev => ({ ...prev, priority: value }))}
                >
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-blue-500 transition-all duration-150">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <GlassmorphismButton variant="outline" onClick={() => setShowTaskDialog(false)}>
                  Cancel
                </GlassmorphismButton>
                <GlassmorphismButton 
                  onClick={saveTask}
                    disabled={!newTask.title.trim() || isSavingTask}
                    className="bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center"
                >
                    {isSavingTask ? <span className="loader mr-2" /> : null}
                    {isSavingTask ? 'Saving...' : 'Add Task'}
                </GlassmorphismButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Event Dialog */}
        <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
                <DialogTitle className="text-white flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>{editingEvent ? 'Edit Event' : 'Add New Event'}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 mt-6">
              {/* Date Field */}
              <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                <Input
                  type="date"
                  value={newEvent.date || ''}
                  onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Event Title *</label>
                  <Input
                    value={newEvent.title || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter event title..."
                      className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                  <Textarea
                    value={newEvent.description || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Event description..."
                      className="bg-slate-800 border-slate-700 text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Time</label>
                    <Input
                      type="time"
                      value={newEvent.time || '09:00'}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                        className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Duration (minutes)</label>
                    <Input
                      type="number"
                      value={newEvent.duration || 60}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                        className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Location</label>
                  <Input
                    value={newEvent.location || ''}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Event location..."
                      className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Event Type</label>
                    <Select 
                      value={newEvent.type} 
                      onValueChange={(value: 'study' | 'exam' | 'assignment' | 'personal' | 'group') => setNewEvent(prev => ({ ...prev, type: value, color: eventColors[value as keyof typeof eventColors] }))}
                    >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="study">Study Session</SelectItem>
                        <SelectItem value="exam">Exam</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="group">Group Study</SelectItem>
                        <SelectItem value="personal">Personal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Reminder (minutes before)</label>
                    <Select 
                      value={newEvent.reminder?.toString()} 
                      onValueChange={(value) => setNewEvent(prev => ({ ...prev, reminder: parseInt(value) }))}
                    >
                        <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="0">No reminder</SelectItem>
                        <SelectItem value="5">5 minutes</SelectItem>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div className="flex space-x-2">
                    {editingEvent && (
                      <GlassmorphismButton
                        variant="outline"
                        onClick={() => {
                          deleteEvent(editingEvent.id);
                          resetEventDialog();
                        }}
                        className="text-red-400 border-red-400 hover:bg-red-500/20"
                        disabled={isAuthLoading}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </GlassmorphismButton>
                    )}
                    {editingEvent && (
                      <GlassmorphismButton
                        variant="outline"
                        onClick={() => window.open(generateGoogleCalendarLink(editingEvent), '_blank')}
                        disabled={isAuthLoading}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Add to Google
                      </GlassmorphismButton>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    <GlassmorphismButton variant="outline" onClick={resetEventDialog} disabled={isAuthLoading}>
                      Cancel
                    </GlassmorphismButton>
                    <GlassmorphismButton 
                      onClick={saveEvent}
                      disabled={!newEvent.title || isSavingEvent || isAuthLoading}
                        className="bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center"
                    >
                        {isSavingEvent ? <span className="loader mr-2" /> : null}
                      {isSavingEvent ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                    </GlassmorphismButton>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

        {/* Edit Task Dialog */}
        <Dialog open={!!editingTask} onOpenChange={open => { if (!open) setEditingTask(null); }}>
          <DialogContent className="max-w-md bg-slate-900 border-slate-700 text-white transition-all duration-200">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Task Title</label>
                <Input
                  value={editTaskData.title}
                  onChange={e => setEditTaskData({ ...editTaskData, title: e.target.value })}
                  placeholder="Enter task title..."
                  className="bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-blue-500 transition-all duration-150"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                <Select
                  value={editTaskData.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => setEditTaskData({ ...editTaskData, priority: value })}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700 text-white focus:ring-2 focus:ring-blue-500 transition-all duration-150">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-white">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <GlassmorphismButton variant="outline" onClick={() => setEditingTask(null)}>
                  Cancel
                </GlassmorphismButton>
                <GlassmorphismButton
                  onClick={saveEditTask}
                  disabled={!editTaskData.title.trim() || isSavingTask}
                  className="bg-gradient-to-r from-blue-500 to-green-500 flex items-center justify-center"
                >
                  {isSavingTask ? <span className="loader mr-2" /> : null}
                  {isSavingTask ? 'Saving...' : 'Save'}
                </GlassmorphismButton>
              </div>
            </div>
          </DialogContent>
        </Dialog>
            {/* Any other overlays/dialogs here */}
          </div> {/* <-- This closes the main content area, after all overlays */}
      </main>
    </CalendarErrorBoundary>
  );
};

export default SmartCalendar;

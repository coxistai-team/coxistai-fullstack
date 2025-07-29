import React from 'react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';

interface CalendarEvent {
  id: string;
  title: string;
  time: string;
  color: string;
  type: 'study' | 'exam' | 'assignment' | 'personal' | 'group';
  duration: number;
  description?: string;
  date: string;
  location?: string;
  reminder?: number;
  googleEventId?: string;
  attachments?: string[];
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  date: Date;
}

interface CalendarGridProps {
  currentDate: Date;
  isMobile: boolean;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getTasksForDate: (date: Date) => Task[];
  onDayClick: (date: Date) => void;
  onDayDoubleClick: (date: Date) => void;
  selectedDate?: Date | null;
  onDayContextMenu?: (date: Date) => void;
  onEventContextMenu?: (event: CalendarEvent, date: Date) => void;
  onTaskContextMenu?: (task: Task, date: Date) => void;
  loading?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  isMobile,
  getEventsForDate,
  getTasksForDate,
  onDayClick,
  onDayDoubleClick,
  selectedDate,
  onDayContextMenu,
  onEventContextMenu,
  onTaskContextMenu,
  loading = false
}) => {
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Calculate start and end of grid
  const firstDay = new Date(currentYear, currentMonth, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - startDate.getDay());

  const days: Date[] = [];
  const current = new Date(startDate);
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isCurrentMonth = (date: Date) => date.getMonth() === currentMonth;
  const isSelected = (date: Date) => selectedDate && date.toDateString() === selectedDate.toDateString();

  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="relative bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-800">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-2 sm:p-4 text-center">
            <span className="text-xs sm:text-sm font-medium text-slate-300">{day}</span>
          </div>
        ))}
      </div>
      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.slice(0, 35).map((date, index) => {
          const dayEvents = getEventsForDate(date);
          const dayTasks = getTasksForDate(date);
          const visibleEvents = isMobile ? dayEvents.slice(0, 2) : dayEvents.slice(0, 3);
          const hasMore = isMobile ? dayEvents.length > 2 : dayEvents.length > 3;
          const selected = isSelected(date);
          return (
            <ContextMenu key={date.toISOString()}>
              <ContextMenuTrigger asChild>
                <div
                  className={`
                    relative p-2 sm:p-3 min-h-[80px] sm:min-h-[120px] border-r border-b border-slate-800 transition-all duration-200 cursor-pointer
                    ${!isCurrentMonth(date) ? 'text-slate-600 bg-slate-800' : ''}
                    ${isToday(date) ? 'border-blue-500 bg-blue-900/10' : ''}
                    ${selected ? 'bg-slate-800/80 ring-2 ring-blue-400' : 'hover:bg-slate-800/60'}
                    ${index % 7 === 6 ? 'border-r-0' : ''}
                  `}
                  tabIndex={0}
                  aria-label={`Day ${date.getDate()}`}
                  onClick={() => !loading && onDayClick(date)}
                  onDoubleClick={() => !loading && onDayDoubleClick(date)}
                  onContextMenu={e => { e.preventDefault(); if (!loading) onDayContextMenu?.(date); }}
                  style={{ outline: 'none' }}
                >
                  <div className={`text-xs sm:text-sm font-semibold mb-1 flex items-center justify-between ${isToday(date) ? 'text-blue-400' : selected ? 'text-white' : isCurrentMonth(date) ? 'text-white' : 'text-slate-500'}`}>
                    <span>{date.getDate()}</span>
                    {isToday(date) && <span className="ml-1 px-1 py-0.5 rounded-full bg-blue-500/20 text-xs text-blue-300">Today</span>}
                  </div>
                  {/* Events */}
                  <div className="space-y-1">
                    {visibleEvents.map((event) => (
                      <ContextMenu key={event.id}>
                        <ContextMenuTrigger asChild>
                          <div
                            className="px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium truncate text-white bg-opacity-80"
                            style={{ backgroundColor: event.color }}
                            onClick={e => { e.stopPropagation(); if (!loading) onDayClick(date); }}
                            onContextMenu={e => { e.preventDefault(); if (!loading) onEventContextMenu?.(event, date); }}
                          >
                            <span className="font-medium">{event.title}</span>
                            {!isMobile && <span className="ml-1 opacity-75">{event.time}</span>}
                          </div>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="bg-slate-900 border-slate-700">
                          <ContextMenuItem onClick={() => onEventContextMenu?.(event, date)}>Edit Event</ContextMenuItem>
                          <ContextMenuItem onClick={() => onEventContextMenu?.(event, date)} className="text-red-400">Delete Event</ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    ))}
                    {hasMore && (
                      <div className="text-xs text-slate-400">
                        {dayEvents.length - (isMobile ? 2 : 3)} more...
                      </div>
                    )}
                  </div>
                  {/* Tasks indicator */}
                  {dayTasks.length > 0 && (
                    <div className="mt-1 flex flex-col gap-1">
                      {dayTasks.slice(0, isMobile ? 1 : 2).map(task => (
                        <ContextMenu key={task.id}>
                          <ContextMenuTrigger asChild>
                            <div
                              className="flex items-center gap-1 text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded bg-slate-700/60 text-white cursor-pointer"
                              onClick={e => { e.stopPropagation(); if (!loading) onTaskContextMenu?.(task, date); }}
                              onContextMenu={e => { e.preventDefault(); if (!loading) onTaskContextMenu?.(task, date); }}
                            >
                              <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1 ${getPriorityColor(task.priority)}`}></span>
                              <span className={`${task.completed ? 'line-through text-slate-400' : ''} truncate`}>{task.title}</span>
                            </div>
                          </ContextMenuTrigger>
                          <ContextMenuContent className="bg-slate-900 border-slate-700">
                            <ContextMenuItem onClick={() => onTaskContextMenu?.(task, date)}>Edit Task</ContextMenuItem>
                            <ContextMenuItem onClick={() => onTaskContextMenu?.(task, date)}>{task.completed ? 'Mark Incomplete' : 'Mark Complete'}</ContextMenuItem>
                            <ContextMenuItem onClick={() => onTaskContextMenu?.(task, date)} className="text-red-400">Delete Task</ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                      {dayTasks.length > (isMobile ? 1 : 2) && (
                        <div className="text-xs text-slate-400">
                          {dayTasks.length - (isMobile ? 1 : 2)} more tasks...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent className="bg-slate-900 border-slate-700">
                <ContextMenuItem onClick={() => onDayContextMenu?.(date)}>Add Event</ContextMenuItem>
                <ContextMenuItem onClick={() => onDayContextMenu?.(date)}>Add Task</ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid; 
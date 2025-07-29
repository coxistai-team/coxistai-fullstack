import React from 'react';
import { CheckCircle2, Circle, Calendar as CalendarIcon, ListTodo, Plus, Edit3, Trash2 } from 'lucide-react';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu';
import GlassmorphismButton from '@/components/ui/glassmorphism-button';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  color: string;
  type: 'study' | 'exam' | 'assignment' | 'personal' | 'group';
  duration: number;
  description?: string;
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

interface CalendarSidebarProps {
  events: CalendarEvent[];
  tasks: Task[];
  onEventClick?: (event: CalendarEvent) => void;
  onTaskClick?: (task: Task) => void;
  onAddEvent?: () => void;
  onAddTask?: () => void;
  onEditEvent?: (event: CalendarEvent) => void;
  onDeleteEvent?: (event: CalendarEvent) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
  onToggleTaskComplete?: (task: Task) => void;
  taskHeaderLabel?: string;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  events, tasks, onEventClick, onTaskClick, onAddEvent, onAddTask, onEditEvent, onDeleteEvent, onEditTask, onDeleteTask, onToggleTaskComplete, taskHeaderLabel
}) => {
  const getPriorityColor = (priority: string) => {
    if (priority === 'high') return 'bg-red-500';
    if (priority === 'medium') return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <aside className="w-72 bg-slate-900/70 backdrop-blur-xl border-r border-slate-800/60 p-4 space-y-8 flex-shrink-0 overflow-y-auto h-full">
      {/* Add buttons */}
      <div className="flex gap-2 mb-4">
        <GlassmorphismButton className="flex-1" onClick={onAddEvent}>
          <Plus className="w-4 h-4 mr-1" /> Add Event
        </GlassmorphismButton>
        <GlassmorphismButton className="flex-1" onClick={onAddTask}>
          <Plus className="w-4 h-4 mr-1" /> Add Task
        </GlassmorphismButton>
      </div>
      {/* Events Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Events</h3>
        </div>
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="text-slate-400 text-sm">No events</div>
          ) : (
            events.map(event => (
              <ContextMenu key={event.id}>
                <ContextMenuTrigger asChild>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors text-left"
                    style={{ borderLeft: `4px solid ${event.color}` }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <span className="flex-1 text-white text-sm truncate">{event.title}</span>
                    <span className="text-xs text-slate-400">{event.time}</span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="bg-slate-900 border-slate-700">
                  <ContextMenuItem onClick={() => onEditEvent?.(event)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onDeleteEvent?.(event)} className="text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ListTodo className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-semibold text-white">{taskHeaderLabel || "Today's Tasks"}</h3>
        </div>
        <div className="space-y-2">
          {tasks.length === 0 ? (
            <div className="text-slate-400 text-sm">No tasks for today</div>
          ) : (
            tasks.map(task => (
              <ContextMenu key={task.id}>
                <ContextMenuTrigger asChild>
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-colors text-left"
                    onClick={() => onTaskClick?.(task)}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500" />
                    )}
                    <span className={`flex-1 text-sm truncate ${task.completed ? 'line-through text-slate-400' : 'text-white'}`}>{task.title}</span>
                    <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}></span>
                  </button>
                </ContextMenuTrigger>
                <ContextMenuContent className="bg-slate-900 border-slate-700">
                  <ContextMenuItem onClick={() => onEditTask?.(task)}>
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onToggleTaskComplete?.(task)}>
                    {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </ContextMenuItem>
                  <ContextMenuItem onClick={() => onDeleteTask?.(task)} className="text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};

export default CalendarSidebar; 
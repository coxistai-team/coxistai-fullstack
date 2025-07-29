import React from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  Plus
} from 'lucide-react';

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  isMobile: boolean;
  onAddEvent: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  isMobile,
  onAddEvent
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 border border-slate-700 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">⌘K</span>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-slate-400">
              {monthNames[currentDate.getMonth()].substring(0, 3)} 1, {currentDate.getFullYear()} — {monthNames[currentDate.getMonth()].substring(0, 3)} 31, {currentDate.getFullYear()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg">
            <button
              onClick={onPrevMonth}
              className="p-2 hover:bg-slate-700 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium border-x border-slate-700 hover:bg-slate-700 text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-slate-700 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-white transition-colors">
            <span className="text-sm font-medium">Month view</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button onClick={onAddEvent} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add event</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold text-white">Calendar</h1>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Date Display */}
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">
              {monthNames[currentDate.getMonth()].substring(0, 3).toUpperCase()}
            </div>
            <div className="text-2xl font-bold text-white">
              {currentDate.getDate()}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <p className="text-sm text-slate-400">
              {monthNames[currentDate.getMonth()].substring(0, 3)} 1, {currentDate.getFullYear()} — {monthNames[currentDate.getMonth()].substring(0, 3)} 31, {currentDate.getFullYear()}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-12 py-2 w-64 border border-slate-700 rounded-lg bg-slate-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">⌘K</span>
          </div>

          {/* Navigation */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg">
            <button
              onClick={onPrevMonth}
              className="p-2 hover:bg-slate-700 rounded-l-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={onToday}
              className="px-4 py-2 text-sm font-medium border-x border-slate-700 hover:bg-slate-700 text-white transition-colors"
            >
              Today
            </button>
            <button
              onClick={onNextMonth}
              className="p-2 hover:bg-slate-700 rounded-r-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* View Selector */}
          <button className="flex items-center space-x-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 text-white transition-colors">
            <span className="text-sm font-medium">Month view</span>
            <ChevronDown className="w-4 h-4" />
          </button>

          {/* Add Event Button */}
          <button onClick={onAddEvent} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">Add event</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarHeader; 
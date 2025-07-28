import React from 'react';

interface Event {
  id: string;
  title: string;
  time: string;
  color: string;
  type: 'meeting' | 'personal' | 'work' | 'social';
}

interface CalendarGridProps {
  currentDate: Date;
  isMobile: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ currentDate, isMobile }) => {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  // Sample events data
  const events: { [key: string]: Event[] } = {
    '6': [
      { id: '1', title: 'Monday standup', time: '9:00 AM', color: 'bg-blue-100 text-blue-800', type: 'meeting' },
      { id: '2', title: 'Coffee with Alina', time: '11:30 AM', color: 'bg-green-100 text-green-800', type: 'social' },
    ],
    '7': [
      { id: '3', title: 'Monday standup', time: '9:00 AM', color: 'bg-blue-100 text-blue-800', type: 'meeting' },
      { id: '4', title: 'Content planning', time: '11:00 AM', color: 'bg-purple-100 text-purple-800', type: 'work' },
    ],
    '8': [
      { id: '5', title: 'One-on-one with…', time: '10:30 AM', color: 'bg-pink-100 text-pink-800', type: 'meeting' },
      { id: '6', title: 'Design sync', time: '3:00 PM', color: 'bg-orange-100 text-orange-800', type: 'work' },
      { id: '7', title: 'SEO planning', time: '1:30 PM', color: 'bg-blue-100 text-blue-800', type: 'work' },
    ],
    '9': [
      { id: '8', title: 'Lunch with team', time: '12:30 PM', color: 'bg-green-100 text-green-800', type: 'social' },
      { id: '9', title: 'Friday standup', time: '9:00 AM', color: 'bg-blue-100 text-blue-800', type: 'meeting' },
    ],
    '10': [
      { id: '10', title: 'Friday standup', time: '9:00 AM', color: 'bg-blue-100 text-blue-800', type: 'meeting' },
      { id: '11', title: 'House things', time: '10:30 AM', color: 'bg-yellow-100 text-yellow-800', type: 'personal' },
      { id: '12', title: 'Product demo', time: '1:30 PM', color: 'bg-purple-100 text-purple-800', type: 'work' },
    ],
    '15': [
      { id: '13', title: 'Product planning', time: '2:30 AM', color: 'bg-blue-100 text-blue-800', type: 'work' },
    ],
    '16': [
      { id: '14', title: 'Auditor first…', time: '10:30 AM', color: 'bg-red-100 text-red-800', type: 'work' },
      { id: '15', title: 'All hands meet…', time: '4:00 PM', color: 'bg-green-100 text-green-800', type: 'meeting' },
    ],
    '21': [
      { id: '16', title: 'Drop work', time: '9:30 AM', color: 'bg-blue-100 text-blue-800', type: 'work' },
      { id: '17', title: 'Lunch with Zara', time: '1:00 PM', color: 'bg-green-100 text-green-800', type: 'social' },
      { id: '18', title: 'Dinner with C…', time: '7:00 PM', color: 'bg-orange-100 text-orange-800', type: 'social' },
    ],
  };

  // Get first day of month and number of days
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - ((firstDay.getDay() + 6) % 7));

  const days: Date[] = [];
  const current = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  const isToday = (date: Date) => {
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth;
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-500';
      case 'work': return 'bg-purple-500';
      case 'social': return 'bg-green-500';
      case 'personal': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isMobile) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {daysOfWeek.map((day) => (
            <div key={day} className="p-2 text-center">
              <span className="text-xs font-medium text-gray-500">{day.charAt(0)}</span>
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.slice(0, 35).map((date, index) => {
            const dayEvents = events[date.getDate().toString()] || [];
            const visibleEvents = dayEvents.slice(0, 3);
            const hasMore = dayEvents.length > 3;

            return (
              <div
                key={index}
                className={`
                  relative p-2 min-h-[60px] border-r border-b border-gray-100
                  ${!isCurrentMonth(date) ? 'text-gray-400 bg-gray-50' : ''}
                  ${index % 7 === 6 ? 'border-r-0' : ''}
                `}
              >
                <div className={`
                  text-sm font-medium mb-1
                  ${isToday(date) 
                    ? 'w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs' 
                    : ''
                  }
                `}>
                  {date.getDate()}
                </div>
                
                {/* Event dots */}
                <div className="flex flex-wrap gap-1">
                  {visibleEvents.map((event, eventIndex) => (
                    <div
                      key={event.id}
                      className={`w-2 h-2 rounded-full ${getEventColor(event.type)}`}
                    />
                  ))}
                  {hasMore && (
                    <span className="text-xs text-gray-500">
                      {dayEvents.length - 3} mo...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Days of week header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {daysOfWeek.map((day) => (
          <div key={day} className="p-4 text-center">
            <span className="text-sm font-medium text-gray-700">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7">
        {days.slice(0, 35).map((date, index) => {
          const dayEvents = events[date.getDate().toString()] || [];
          const visibleEvents = dayEvents.slice(0, 3);
          const hasMore = dayEvents.length > 3;

          return (
            <div
              key={index}
              className={`
                relative p-3 min-h-[120px] border-r border-b border-gray-100 hover:bg-gray-50 transition-colors
                ${!isCurrentMonth(date) ? 'text-gray-400 bg-gray-50' : ''}
                ${index % 7 === 6 ? 'border-r-0' : ''}
              `}
            >
              <div className={`
                text-sm font-medium mb-2
                ${isToday(date) 
                  ? 'w-7 h-7 bg-gray-900 text-white rounded-full flex items-center justify-center' 
                  : ''
                }
              `}>
                {date.getDate()}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {visibleEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`
                      px-2 py-1 rounded text-xs font-medium truncate
                      ${event.color}
                    `}
                  >
                    <span className="font-medium">{event.title}</span>
                    <span className="ml-1 opacity-75">{event.time}</span>
                  </div>
                ))}
                {hasMore && (
                  <button className="text-xs text-gray-500 hover:text-gray-700">
                    {dayEvents.length - 3} more...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;

import React, { useState } from 'react';
import { AttendanceLog } from '../types';

interface CalendarViewProps {
  logs: AttendanceLog[];
  staffId: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ logs, staffId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const totalDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const staffLogs = logs.filter(l => l.staffId === staffId);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const renderDays = () => {
    const days = [];
    const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

    // Header labels
    dayLabels.forEach(label => {
      days.push(
        <div key={`label-${label}`} className="text-center text-[10px] font-bold text-slate-400 py-2 uppercase tracking-tighter">
          {label}
        </div>
      );
    });

    // Padding for first day
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayLogs = staffLogs.filter(l => l.timestamp.toISOString().startsWith(dateStr));
      const hasIn = dayLogs.some(l => l.type === 'clock_in');
      const hasOut = dayLogs.some(l => l.type === 'clock_out');

      days.push(
        <div key={d} className="aspect-square flex flex-col items-center justify-center border border-slate-50 p-1">
          <span className="text-xs font-semibold text-slate-600 mb-1">{d}</span>
          <div className="flex gap-0.5">
            {hasIn && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
            {hasOut && <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-800">{year}年 {month + 1}月</h3>
        <div className="flex gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {renderDays()}
      </div>
      <div className="mt-6 flex justify-center gap-4 text-[10px] font-bold text-slate-400 tracking-widest uppercase">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>出勤済</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>退勤済</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;

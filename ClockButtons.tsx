
import React from 'react';
import { LogType } from '../types';

interface ClockButtonsProps {
  onAction: (type: LogType) => void;
  disabled: boolean;
}

const ClockButtons: React.FC<ClockButtonsProps> = ({ onAction, disabled }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <button
        onClick={() => onAction('clock_in')}
        disabled={disabled}
        className={`group relative h-32 w-full rounded-[2rem] flex items-center justify-between px-10 transition-all duration-300 ${
          disabled 
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
          : 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 active:scale-95 hover:bg-emerald-600'
        }`}
      >
        <div className="text-left">
          <span className="block text-3xl font-black tracking-tight">出勤</span>
          <span className="text-sm font-medium opacity-80">Clock In</span>
        </div>
        <div className={`text-5xl transition-transform duration-300 ${disabled ? '' : 'group-hover:scale-110'}`}>
          🟢
        </div>
      </button>

      <button
        onClick={() => onAction('clock_out')}
        disabled={disabled}
        className={`group relative h-32 w-full rounded-[2rem] flex items-center justify-between px-10 transition-all duration-300 ${
          disabled 
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
          : 'bg-rose-500 text-white shadow-lg shadow-rose-200 active:scale-95 hover:bg-rose-600'
        }`}
      >
        <div className="text-left">
          <span className="block text-3xl font-black tracking-tight">退勤</span>
          <span className="text-sm font-medium opacity-80">Clock Out</span>
        </div>
        <div className={`text-5xl transition-transform duration-300 ${disabled ? '' : 'group-hover:scale-110'}`}>
          🔴
        </div>
      </button>
    </div>
  );
};

export default ClockButtons;

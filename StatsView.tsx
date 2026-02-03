
import React from 'react';
import { AttendanceLog, DayStats } from '../types';

interface StatsViewProps {
  logs: AttendanceLog[];
  staffId: string;
  onDeleteDay: (dateStr: string) => void;
}

const StatsView: React.FC<StatsViewProps> = ({ logs, staffId, onDeleteDay }) => {
  const staffLogs = logs.filter(l => l.staffId === staffId).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  
  // Aggregate logs by day
  const dailyStats: Record<string, DayStats> = {};
  
  staffLogs.forEach(log => {
    const d = log.timestamp.toISOString().split('T')[0];
    if (!dailyStats[d]) {
      dailyStats[d] = { date: d };
    }
    
    if (log.type === 'clock_in' && !dailyStats[d].clockIn) {
      dailyStats[d].clockIn = log.timestamp;
    } else if (log.type === 'clock_out') {
      dailyStats[d].clockOut = log.timestamp;
    }
    
    if (dailyStats[d].clockIn && dailyStats[d].clockOut) {
      dailyStats[d].duration = dailyStats[d].clockOut!.getTime() - dailyStats[d].clockIn!.getTime();
    }
  });

  const statsArray = Object.values(dailyStats).reverse();
  const totalDurationMs = statsArray.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  const totalHours = Math.floor(totalDurationMs / (1000 * 60 * 60));
  const totalMinutes = Math.floor((totalDurationMs % (1000 * 60 * 60)) / (1000 * 60));

  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    return `(${days[date.getDay()]})`;
  };

  const handleExportCSV = () => {
    if (statsArray.length === 0) return;

    const headers = ['日付', '曜日', '出勤時間', '退勤時間', '合計時間(分)'];
    const rows = statsArray.map(stat => {
      const durationMin = stat.duration ? Math.floor(stat.duration / (1000 * 60)) : '';
      return [
        stat.date,
        getDayOfWeek(stat.date),
        stat.clockIn?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
        stat.clockOut?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '',
        durationMin
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Use BOM for Excel compatibility with Japanese text
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_history_${staffId}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-lg flex flex-col items-center">
        <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-1">今月の合計勤務時間</p>
        <div className="flex items-baseline">
          <span className="text-5xl font-black">{totalHours}</span>
          <span className="text-xl font-bold ml-1 text-slate-400">h</span>
          <span className="text-5xl font-black ml-4">{totalMinutes}</span>
          <span className="text-xl font-bold ml-1 text-slate-400">m</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">勤務履歴</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              title="CSVエクスポート"
              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <span className="text-xs font-bold text-slate-400 flex items-center">{statsArray.length}日分</span>
          </div>
        </div>
        <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
          {statsArray.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm italic">履歴がありません</div>
          ) : (
            statsArray.map(stat => (
              <div key={stat.date} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                <div className="flex-1">
                  <div className="text-sm font-bold text-slate-800">
                    {stat.date} <span className="text-slate-500 font-medium">{getDayOfWeek(stat.date)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium space-x-2">
                    <span>IN: {stat.clockIn?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--'}</span>
                    <span>OUT: {stat.clockOut?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '--:--'}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {stat.duration && (
                    <div className="bg-slate-50 px-3 py-1.5 rounded-xl">
                      <span className="text-sm font-black text-slate-700">
                        {Math.floor(stat.duration / (1000 * 60 * 60))}h {Math.floor((stat.duration % (1000 * 60 * 60)) / (1000 * 60))}m
                      </span>
                    </div>
                  )}
                  <button 
                    onClick={() => onDeleteDay(stat.date)}
                    className="p-2 text-rose-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsView;

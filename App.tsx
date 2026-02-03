
import React, { useState, useEffect } from 'react';
import { Staff, AttendanceLog, LogType } from './types';
import StaffSelector from './components/StaffSelector';
import ClockButtons from './components/ClockButtons';
import CalendarView from './components/CalendarView';
import StatsView from './components/StatsView';
import AddStaffModal from './components/AddStaffModal';

const STORAGE_KEY_STAFF = 'attendance_app_staff_v1';
const STORAGE_KEY_LOGS = 'attendance_app_logs_v1';
const STORAGE_KEY_SELECTED_STAFF = 'attendance_app_selected_staff_v1';

const App: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lastAction, setLastAction] = useState<{ type: LogType; time: Date } | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // 1. Initial Data Loading
  useEffect(() => {
    try {
      const savedStaff = localStorage.getItem(STORAGE_KEY_STAFF);
      const savedLogs = localStorage.getItem(STORAGE_KEY_LOGS);
      const savedSelectedId = localStorage.getItem(STORAGE_KEY_SELECTED_STAFF);

      if (savedStaff) {
        setStaffList(JSON.parse(savedStaff));
      } else {
        const defaultStaff = [{ id: '1', name: '管理者' }];
        setStaffList(defaultStaff);
      }

      if (savedLogs) {
        const parsedLogs = JSON.parse(savedLogs).map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
        setLogs(parsedLogs);
      }

      if (savedSelectedId) {
        setSelectedStaffId(savedSelectedId);
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // 2. Data Persistence Hooks
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_STAFF, JSON.stringify(staffList));
    }
  }, [staffList, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
    }
  }, [logs, isInitialized]);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY_SELECTED_STAFF, selectedStaffId);
    }
  }, [selectedStaffId, isInitialized]);

  const handleAddStaff = (name: string) => {
    const newStaff: Staff = {
      id: Date.now().toString(),
      name: name
    };
    setStaffList(prev => [...prev, newStaff]);
    setIsAddModalOpen(false);
  };

  const handleClockAction = (type: LogType) => {
    if (!selectedStaffId) {
      alert('スタッフを選択してください');
      return;
    }

    const now = new Date();
    const newLog: AttendanceLog = {
      id: Math.random().toString(36).substr(2, 9),
      staffId: selectedStaffId,
      type: type,
      timestamp: now
    };

    setLogs(prev => [...prev, newLog]);
    setLastAction({ type, time: now });
    setTimeout(() => setLastAction(null), 3000);
  };

  const handleDeleteLogsForDay = (dateStr: string) => {
    if (!window.confirm(`${dateStr}の記録を削除しますか？`)) return;
    
    setLogs(prev => prev.filter(log => {
      const logDate = log.timestamp.toISOString().split('T')[0];
      return !(log.staffId === selectedStaffId && logDate === dateStr);
    }));
  };

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  return (
    <div className="min-h-screen pb-20 md:pb-8 flex flex-col items-center">
      <header className="w-full bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none">Smart Attendance</h1>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Device Sync Active</span>
            </div>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="text-sm font-semibold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-100 transition-colors"
          >
            + 追加
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl px-4 py-6 space-y-6">
        <section className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            スタッフ選択
          </label>
          <StaffSelector 
            staffList={staffList} 
            selectedStaffId={selectedStaffId} 
            onSelect={setSelectedStaffId} 
          />
        </section>

        {selectedStaff && (
          <div className="text-center animate-in fade-in slide-in-from-top-4 duration-500">
             <p className="text-slate-500 text-sm">現在の操作対象:</p>
             <p className="text-2xl font-bold text-slate-800">{selectedStaff.name}</p>
          </div>
        )}

        <section className="space-y-4">
          <ClockButtons onAction={handleClockAction} disabled={!selectedStaffId} />
          
          {lastAction && (
            <div className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-center font-medium animate-bounce border border-emerald-100">
              {lastAction.type === 'clock_in' ? '出勤' : '退勤'}を記録しました ({lastAction.time.toLocaleTimeString()})
            </div>
          )}
        </section>

        <div className="grid grid-cols-2 gap-4 pt-4">
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
              setShowStats(false);
            }}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all active:scale-95 ${
              showCalendar 
              ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="text-2xl mb-1">📅</span>
            <span className="text-sm font-bold">カレンダー</span>
          </button>
          
          <button
            onClick={() => {
              setShowStats(!showStats);
              setShowCalendar(false);
            }}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all active:scale-95 ${
              showStats 
              ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="text-2xl mb-1">📊</span>
            <span className="text-sm font-bold">勤務時間</span>
          </button>
        </div>

        {showCalendar && selectedStaffId && (
          <div className="mt-8 animate-in slide-in-from-bottom-8 duration-500">
            <CalendarView logs={logs} staffId={selectedStaffId} />
          </div>
        )}

        {showStats && selectedStaffId && (
          <div className="mt-8 animate-in slide-in-from-bottom-8 duration-500">
            <StatsView logs={logs} staffId={selectedStaffId} onDeleteDay={handleDeleteLogsForDay} />
          </div>
        )}

        {!selectedStaffId && (showCalendar || showStats) && (
          <div className="text-center p-12 bg-slate-100 rounded-3xl border border-dashed border-slate-300">
            <p className="text-slate-400 font-medium">スタッフを選択すると<br/>表示されます</p>
          </div>
        )}

        <div className="pt-8 pb-4 text-center">
            <p className="text-[10px] text-slate-300 font-medium">
                iPhoneでご利用の場合は「ホーム画面に追加」すると<br/>より安定してデータが保存されます。
            </p>
        </div>
      </main>

      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddStaff} 
      />
    </div>
  );
};

export default App;


export interface Staff {
  id: string;
  name: string;
}

export type LogType = 'clock_in' | 'clock_out';

export interface AttendanceLog {
  id: string;
  staffId: string;
  type: LogType;
  timestamp: Date;
}

export interface DayStats {
  date: string;
  clockIn?: Date;
  clockOut?: Date;
  duration?: number; // in milliseconds
}

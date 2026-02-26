export interface Task {
  id: string;
  title: string;
  link?: string;
  date: string; // ISO string (YYYY-MM-DD)
  time?: string; // HH:mm
  completed: boolean;
  createdAt: number;
}

export interface DailySchedule {
  wakeUpTime: string; // HH:mm
  sleepTime: string; // HH:mm
}
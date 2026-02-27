
export interface TaskLink {
  title: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  links?: TaskLink[];
  date: string; // ISO string (YYYY-MM-DD)
  time?: string; // HH:mm
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
}

export interface DailySchedule {
  wakeUpTime: string; // HH:mm
  sleepTime: string; // HH:mm
}

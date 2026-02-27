export interface Task {
  id: number;
  name: string;
  createdAt: string;  // "YYYY-MM-DDTHH:mm" (ローカル日時)
  deadline: string;   // "YYYY-MM-DD" or "YYYY-MM-DDTHH:mm"
  priority: 1 | 2 | 3 | 4 | 5;
  isCompleted: boolean;
  completedAt: string | null;
}

export interface Schedule {
  id: number;
  name: string;
  startAt: string;  // "YYYY-MM-DDTHH:mm"
  endAt: string;    // "YYYY-MM-DDTHH:mm"
}

export enum TaskPriority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  CRITICAL = "Critical",
  SOMEDAY = "Someday",
}

export enum TaskStatus {
  TODO = "Todo",
  IN_PROGRESS = "In Progress",
  WAITING = "Waiting",
  BLOCKED = "Blocked",
  REVIEW = "Review",
  COMPLETED = "Completed",
  ARCHIVED = "Archived",
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  status: TaskStatus;
  labels: string[];
  tags: string[];
  subtasks: SubTask[];
  difficulty: number; // 1-5
  estimatedMinutes: number;
  actualMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  streak: number;
  frequency: "daily" | "weekly";
  completedDates: string[]; // ISO Strings
  createdAt: string;
}

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  duration: number; // minutes
  type: "pomodoro" | "flow";
  completedAt: string;
}

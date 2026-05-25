import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { useAuth } from "./AuthContext";
import { Task, Habit, Note, FocusSession, TaskPriority, TaskStatus, SubTask } from "../types";
import { toast } from "sonner";

interface TaskContextType {
  tasks: Task[];
  habits: Habit[];
  notes: Note[];
  focusSessions: FocusSession[];
  loading: boolean;
  
  // Task operations
  addTask: (title: string, description?: string, dueDate?: string, priority?: TaskPriority, difficulty?: number, estimatedMinutes?: number, labels?: string[], tags?: string[]) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;
  addSubtask: (taskId: string, title: string) => Promise<void>;
  generateAiSubtasks: (taskId: string) => Promise<void>;
  
  // Habit operations
  addHabit: (title: string, frequency: "daily" | "weekly") => Promise<void>;
  toggleHabitDate: (habitId: string, dateStr: string) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  
  // Note operations
  addNote: (title: string, content: string, tags?: string[]) => Promise<void>;
  updateNote: (noteId: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (noteId: string) => Promise<void>;
  
  // Focus operations
  logFocusSession: (type: "pomodoro" | "flow", duration: number, taskId?: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within a TaskProvider");
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, addXp } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Set up subscribers when user UID changes
  useEffect(() => {
    if (!user) {
      setTasks([]);
      setHabits([]);
      setNotes([]);
      setFocusSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // 1. Task collection listener
    const tasksCollection = collection(db, "users", user.uid, "tasks");
    const tasksQuery = query(tasksCollection, orderBy("createdAt", "desc"));
    const unsubTasks = onSnapshot(tasksQuery, (snapshot) => {
      const items: Task[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Task);
      });
      setTasks(items);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/tasks`));

    // 2. Habits collection listener
    const habitsCollection = collection(db, "users", user.uid, "habits");
    const habitsQuery = query(habitsCollection, orderBy("createdAt", "desc"));
    const unsubHabits = onSnapshot(habitsQuery, (snapshot) => {
      const items: Habit[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Habit);
      });
      setHabits(items);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/habits`));

    // 3. Notes collection listener
    const notesCollection = collection(db, "users", user.uid, "notes");
    const notesQuery = query(notesCollection, orderBy("createdAt", "desc"));
    const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
      const items: Note[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Note);
      });
      setNotes(items);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/notes`));

    // 4. Focus Sessions collection listener
    const focusCollection = collection(db, "users", user.uid, "focus_sessions");
    const focusQuery = query(focusCollection, orderBy("completedAt", "desc"));
    const unsubFocus = onSnapshot(focusQuery, (snapshot) => {
      const items: FocusSession[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as FocusSession);
      });
      setFocusSessions(items);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/focus_sessions`));

    return () => {
      unsubTasks();
      unsubHabits();
      unsubNotes();
      unsubFocus();
    };
  }, [user]);

  // =========================================================================
  // TASK ACTIONS
  // =========================================================================

  const addTask = async (
    title: string, 
    description = "", 
    dueDate = "", 
    priority = TaskPriority.MEDIUM,
    difficulty = 2,
    estimatedMinutes = 25,
    labels: string[] = [],
    tags: string[] = []
  ) => {
    if (!user) return;
    const taskId = crypto.randomUUID();
    const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
    
    const newTask: Task = {
      id: taskId,
      userId: user.uid,
      title,
      description,
      dueDate: dueDate || new Date().toISOString().split("T")[0],
      priority,
      status: TaskStatus.TODO,
      labels,
      tags,
      subtasks: [],
      difficulty,
      estimatedMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(taskDoc, newTask);
      await addXp(15); // Task Addition Multiplier
      toast.success("Task added to Flow!", { description: "+15 XP gained." });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;
    const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
    try {
      const finalUpdates = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(taskDoc, finalUpdates);

      // Award XP when task status swaps to Completed
      if (updates.status === TaskStatus.COMPLETED) {
        await addXp(50);
        toast.success("Task completed! Incredible execution! 🎉", { description: "+50 XP earned." });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;
    const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
    try {
      await deleteDoc(taskDoc);
      toast.info("Task removed successfully.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const toggleSubtask = async (taskId: string, subtaskId: string) => {
    if (!user) return;
    const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const updatedSubtasks = task.subtasks.map((sub) => {
      if (sub.id === subtaskId) {
        const nextState = !sub.completed;
        if (nextState) {
          addXp(5); // Small subtask completion bonus
          toast.success("Subtask finished! 🎯", { description: "+5 XP" });
        }
        return { ...sub, completed: nextState };
      }
      return sub;
    });

    try {
      await updateDoc(taskDoc, {
        subtasks: updatedSubtasks,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  const addSubtask = async (taskId: string, title: string) => {
    if (!user) return;
    const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const newSub: SubTask = {
      id: crypto.randomUUID(),
      title,
      completed: false
    };

    try {
      await updateDoc(taskDoc, {
        subtasks: [...task.subtasks, newSub],
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/tasks/${taskId}`);
    }
  };

  // call the generative AI route proxy to break down our task
  const generateAiSubtasks = async (taskId: string) => {
    if (!user) return;
    const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const promise = async () => {
      const response = await fetch("/api/ai/breakdown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: task.title,
          taskDescription: task.description || ""
        })
      });

      if (!response.ok) {
        throw new Error("Unable to contact AI breakdown service");
      }

      const result = await response.json();
      
      const newSubs: SubTask[] = result.subtasks.map((s: any) => ({
        id: crypto.randomUUID(),
        title: s.title,
        completed: false
      }));

      await updateDoc(taskDoc, {
        subtasks: [...task.subtasks, ...newSubs],
        difficulty: result.suggestedDifficulty || task.difficulty,
        estimatedMinutes: result.estimatedTotalMinutes || task.estimatedMinutes,
        updatedAt: new Date().toISOString()
      });

      await addXp(20); // AI setup bonus
    };

    toast.promise(promise(), {
      loading: "Thinking... Breaking down task with Gemini AI 🔮",
      success: "Gemini AI created actionable subtasks! +20 XP 🚀",
      error: "Error: AI pipeline failed to compile subtasks."
    });
  };

  // =========================================================================
  // HABIT ACTIONS
  // =========================================================================

  const addHabit = async (title: string, frequency: "daily" | "weekly") => {
    if (!user) return;
    const habitId = crypto.randomUUID();
    const habitDoc = doc(db, "users", user.uid, "habits", habitId);

    const newHabit: Habit = {
      id: habitId,
      userId: user.uid,
      title,
      streak: 0,
      frequency,
      completedDates: [],
      createdAt: new Date().toISOString()
    };

    try {
      await setDoc(habitDoc, newHabit);
      await addXp(20);
      toast.success("New Habit track registered! Keep the momentum! 🌱", { description: "+20 XP added." });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const toggleHabitDate = async (habitId: string, dateStr: string) => {
    if (!user) return;
    const habitDoc = doc(db, "users", user.uid, "habits", habitId);
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    let updatedDates = [...habit.completedDates];
    let isCompleting = false;

    if (updatedDates.includes(dateStr)) {
      updatedDates = updatedDates.filter(d => d !== dateStr);
    } else {
      updatedDates.push(dateStr);
      isCompleting = true;
    }

    // Calculate dynamic streaks (Loyalty engine counts absolute contiguous matches)
    updatedDates.sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    let currentStreak = 0;
    
    if (updatedDates.length > 0) {
      currentStreak = 1;
      for (let i = updatedDates.length - 1; i > 0; i--) {
        const curr = new Date(updatedDates[i]);
        const prev = new Date(updatedDates[i - 1]);
        const diffDays = (curr.getTime() - prev.getTime()) / (1000 * 300 * 288 * 10); // accurate ms calculation for 1 day
        if (Math.round(diffDays) === 1) {
          currentStreak++;
        } else if (Math.round(diffDays) > 1) {
          break; // Stop at first gap
        }
      }
    } else {
      currentStreak = 0;
    }

    try {
      await updateDoc(habitDoc, {
        completedDates: updatedDates,
        streak: currentStreak
      });

      if (isCompleting) {
        await addXp(25);
        toast.success(`Habit checked off! Daily streak: ${currentStreak} 🔥`, { description: "+25 XP added." });
      } else {
        toast.info("Habit checklist reverted.");
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  const deleteHabit = async (habitId: string) => {
    if (!user) return;
    const habitDoc = doc(db, "users", user.uid, "habits", habitId);
    try {
      await deleteDoc(habitDoc);
      toast.info("Habit removed.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/habits/${habitId}`);
    }
  };

  // =========================================================================
  // NOTE ACTIONS
  // =========================================================================

  const addNote = async (title: string, content: string, tags: string[] = []) => {
    if (!user) return;
    const noteId = crypto.randomUUID();
    const noteDoc = doc(db, "users", user.uid, "notes", noteId);

    const newNote: Note = {
      id: noteId,
      userId: user.uid,
      title,
      content,
      tags,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(noteDoc, newNote);
      await addXp(15);
      toast.success("Note saved to your second brain vault! 💾", { description: "+15 XP added." });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  const updateNote = async (noteId: string, updates: Partial<Note>) => {
    if (!user) return;
    const noteDoc = doc(db, "users", user.uid, "notes", noteId);
    try {
      await updateDoc(noteDoc, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) return;
    const noteDoc = doc(db, "users", user.uid, "notes", noteId);
    try {
      await deleteDoc(noteDoc);
      toast.info("Note deleted.");
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${user.uid}/notes/${noteId}`);
    }
  };

  // =========================================================================
  // FOCUS ACTIONS
  // =========================================================================

  const logFocusSession = async (type: "pomodoro" | "flow", duration: number, taskId?: string) => {
    if (!user) return;
    const sessionId = crypto.randomUUID();
    const sessionDoc = doc(db, "users", user.uid, "focus_sessions", sessionId);

    const newSession: FocusSession = {
      id: sessionId,
      userId: user.uid,
      duration,
      type,
      taskId,
      completedAt: new Date().toISOString()
    };

    try {
      await setDoc(sessionDoc, newSession);
      const earnedXp = duration * 2; // 2 XP per focus minute
      await addXp(earnedXp);

      // If taskId is linked, increment actualMinutes of that task
      if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          const taskDoc = doc(db, "users", user.uid, "tasks", taskId);
          await updateDoc(taskDoc, {
            actualMinutes: (task.actualMinutes || 0) + duration,
            updatedAt: new Date().toISOString()
          });
        }
      }

      toast.success(`Deep work session finalized! Completed ${duration} mins of ${type} sync! 🪐`, {
        description: `+${earnedXp} XP gained.`
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}/focus_sessions/${sessionId}`);
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks, habits, notes, focusSessions, loading,
      addTask, updateTask, deleteTask, toggleSubtask, addSubtask, generateAiSubtasks,
      addHabit, toggleHabitDate, deleteHabit,
      addNote, updateNote, deleteNote,
      logFocusSession
    }}>
      {children}
    </TaskContext.Provider>
  );
};

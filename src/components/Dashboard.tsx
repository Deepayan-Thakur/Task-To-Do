import React, { useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useTasks } from "../context/TaskContext";
import { TaskStatus, TaskPriority } from "../types";
import { 
  Flame, 
  Award, 
  Clock, 
  CheckCircle2, 
  Brain, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { motion } from "motion/react";

export default function Dashboard() {
  const { profile } = useAuth();
  const { tasks, habits, focusSessions, toggleHabitDate, updateTask } = useTasks();

  // 1. Time-of-day greeting & motivational advice
  const greeting = useMemo(() => {
    const hrs = new Date().getHours();
    if (hrs < 12) return "Good morning, Commander";
    if (hrs < 18) return "Good afternoon, Archon";
    return "Good evening, Explorer";
  }, []);

  const motivationalQuote = useMemo(() => {
    const quotes = [
      "Your focus determines your reality. Sync your mind, dominate your flow.",
      "Consistency triggers momentum. Small victories accumulate into giant leaps.",
      "Deep work changes the synapses of your second brain. Enter state zero.",
      "The best way to predict your efficiency is to automate your focus.",
      "No distractions. Just pure execution. Flow from one node to the next."
    ];
    // Simple deterministic picker based on day of week
    const idx = new Date().getDay() % quotes.length;
    return quotes[idx];
  }, []);

  // 2. Metrics calculator
  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    
    // Tasks completed today
    const completedToday = tasks.filter(
      (t) => t.status === TaskStatus.COMPLETED && t.updatedAt.startsWith(todayStr)
    ).length;

    // Total tasks completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Total focus sessions logged minutes
    const totalFocusMinutes = focusSessions.reduce((sum, s) => sum + s.duration, 0);
    const focusHours = (totalFocusMinutes / 60).toFixed(1);

    // Active subtasks outstanding
    const todoTasks = tasks.filter((t) => t.status !== TaskStatus.COMPLETED);

    return {
      completedToday,
      completionRate,
      focusHours,
      todoCount: todoTasks.length
    };
  }, [tasks, focusSessions]);

  // 3. Analytics Chart Data (Last 7 Days Completion mapping)
  const chartData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const results = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateKey = d.toISOString().split("T")[0];

      // Find tasks completed on this day
      const count = tasks.filter(
        (t) => t.status === TaskStatus.COMPLETED && t.updatedAt.startsWith(dateKey)
      ).length;

      // Find focus minutes on this day
      const focusMins = focusSessions
        .filter((s) => s.completedAt.startsWith(dateKey))
        .reduce((sum, s) => sum + s.duration, 0);

      results.push({
        name: dayName,
        Completions: count,
        "Focus (m)": focusMins
      });
    }
    return results;
  }, [tasks, focusSessions]);

  // 4. Filter lists for "Today's Agenda"
  const todaysAgenda = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    return tasks
      .filter((t) => {
        if (t.status === TaskStatus.COMPLETED) {
          // Keep completed today
          return t.updatedAt.startsWith(todayStr);
        }
        // Keep active items set for today or past due
        return !t.dueDate || t.dueDate <= todayStr;
      })
      .slice(0, 5); // top 5
  }, [tasks]);

  // Today habits checklist status
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-8 p-1 sm:p-2">
      {/* 1. Header Greeting Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950 p-6 md:p-8"
      >
        <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400 animate-pulse" />
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest">Momentum Engine Active</span>
            </div>
            <h1 className="font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">{profile?.displayName || "Explorer"}</span>
            </h1>
            <p className="max-w-2xl text-zinc-400 text-sm leading-relaxed font-sans">
              "{motivationalQuote}"
            </p>
          </div>

          {/* Gamification Level Display Card */}
          <div className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shrink-0 shadow-lg shadow-black/30 backdrop-blur-md">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-600 shadow-md shadow-indigo-500/20">
              <Award className="h-6 w-6 text-white" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-baseline gap-8">
                <span className="font-sans font-medium text-white text-sm">Level {profile?.level || 1}</span>
                <span className="font-mono text-xs text-zinc-400">{profile?.xp || 0} / {(profile?.level || 1) * 100} XP</span>
              </div>
              <div className="h-1.5 w-44 overflow-hidden rounded-full bg-zinc-800">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((profile?.xp || 0) / ((profile?.level || 1) * 100)) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. Bento Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak Metric */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex items-center gap-4 relative group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 group-hover:bg-orange-500/20 transition-all duration-300">
            <Flame className="h-6 w-6 fill-current" />
          </div>
          <div>
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Active Streak</p>
            <p className="font-sans text-2xl font-semibold text-white mt-0.5">{profile?.streak || 1} Days</p>
          </div>
          <div className="absolute top-2 right-2 flex items-center gap-1 font-mono text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
            <Zap className="h-3 w-3 fill-current" /> Multiplier
          </div>
        </motion.div>

        {/* Focus Hours Metric */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex items-center gap-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/20 transition-all duration-300">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Focus Time</p>
            <p className="font-sans text-2xl font-semibold text-white mt-0.5">{stats.focusHours} Hours</p>
          </div>
        </motion.div>

        {/* Completion Rate Metric */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex items-center gap-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500/20 transition-all duration-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Completion Rate</p>
            <p className="font-sans text-2xl font-semibold text-white mt-0.5">{stats.completionRate}%</p>
          </div>
        </motion.div>

        {/* Pending Items Metric */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 flex items-center gap-4 group"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:bg-rose-500/20 transition-all duration-300">
            <Brain className="h-6 w-6" />
          </div>
          <div>
            <p className="font-mono text-xs text-zinc-400 uppercase tracking-wider">Remaining Queues</p>
            <p className="font-sans text-2xl font-semibold text-white mt-0.5">{stats.todoCount} Tasks</p>
          </div>
        </motion.div>
      </div>

      {/* 3. Graph + Agenda Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Analytics Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2 rounded-xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4"
        >
          <div className="flex justify-between items-center">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white font-sans flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
                Flow Analytics
              </h2>
              <p className="text-xs text-zinc-400">Analysis logs comparing daily task execution and focus volumes</p>
            </div>
            <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest border border-zinc-800 rounded-full px-2 py-0.5">Real-time sync</span>
          </div>

          <div className="h-64 pricing-panel font-mono text-xs">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" strokeWidth={1} tickLine={false} />
                  <YAxis stroke="#52525b" strokeWidth={1} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#09090b", 
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                      fontFamily: "var(--font-mono)"
                    }} 
                  />
                  <Area type="monotone" dataKey="Completions" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorCompletions)" />
                  <Area type="monotone" dataKey="Focus (m)" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorFocus)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-500">
                Log a task or focus block to construct analytics heatmap
              </div>
            )}
          </div>
        </motion.div>

        {/* Compact Right Agenda */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-5 space-y-4"
        >
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-white font-sans flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              Focus Agenda
            </h2>
            <p className="text-xs text-zinc-400">Today's schedule & high-priority triggers</p>
          </div>

          <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
            {todaysAgenda.length > 0 ? (
              todaysAgenda.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/40 border border-zinc-900 hover:bg-zinc-900/60 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={task.status === TaskStatus.COMPLETED}
                      onChange={() => updateTask(task.id, { 
                        status: task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED 
                      })}
                      className="h-4 w-4 rounded border-zinc-800 bg-zinc-950 text-indigo-500 focus:ring-offset-zinc-950 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="space-y-0.5">
                      <p className={`text-sm font-medium transition-all duration-200 ${
                        task.status === TaskStatus.COMPLETED 
                          ? "text-zinc-500 line-through" 
                          : "text-zinc-200 group-hover:text-white"
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${
                          task.priority === TaskPriority.CRITICAL ? "bg-red-500/10 text-red-400" :
                          task.priority === TaskPriority.HIGH ? "bg-orange-500/10 text-orange-400" :
                          "bg-zinc-800 text-zinc-400"
                        }`}>
                          {task.priority}
                        </span>
                        {task.dueDate && (
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {task.dueDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-zinc-500 font-sans space-y-2">
                <Brain className="h-8 w-8 text-zinc-700 animate-pulse" />
                <p className="text-xs">No active items scheduled for today! Enjoy the balance or queue up tasks.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 4. Habits Quick Checks */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="rounded-xl border border-zinc-800/80 bg-zinc-950 p-6 space-y-4"
      >
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white font-sans flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            Habit Catalyst
          </h2>
          <p className="text-xs text-zinc-400 font-sans">Check off routine nodes to protect your multiplier flow</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {habits.slice(0, 3).map((habit) => {
            const completedToday = habit.completedDates.includes(todayStr);
            return (
              <div 
                key={habit.id}
                onClick={() => toggleHabitDate(habit.id, todayStr)}
                className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
                  completedToday
                    ? "bg-indigo-950/20 border-indigo-500/30 text-white shadow-md shadow-indigo-500/5"
                    : "bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-900/30"
                }`}
              >
                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">{habit.frequency} habit</span>
                  <p className={`text-sm font-medium ${completedToday ? "text-indigo-200" : ""}`}>{habit.title}</p>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="text-right">
                    <p className="font-mono text-xs">{habit.streak} 🔥</p>
                    <p className="text-[9px] text-zinc-500 font-mono">streak</p>
                  </div>
                  <div className={`h-7 w-7 rounded-full border flex items-center justify-center transition-all ${
                    completedToday 
                      ? "bg-indigo-500 border-indigo-400 text-white" 
                      : "border-zinc-700 bg-zinc-900"
                  }`}>
                    {completedToday && <CheckCircle2 className="h-4 w-4" />}
                  </div>
                </div>
              </div>
            );
          })}
          {habits.length === 0 && (
            <div className="col-span-3 py-6 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
              No habits created yet. Slide over to the Habit tracker to initiate consistency nodes.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

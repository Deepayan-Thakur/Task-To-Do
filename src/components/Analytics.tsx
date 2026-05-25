import React, { useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { TaskStatus, TaskPriority } from "../types";
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from "recharts";
import { TrendingUp, PieChart as PieIcon, BarChart2, Star, Clock, CheckSquare, Zap, Activity } from "lucide-react";
import { motion } from "motion/react";

export default function Analytics() {
  const { tasks, habits, focusSessions } = useTasks();

  // 1. Task Status Distribution
  const statusData = useMemo(() => {
    const counts = {
      Todo: 0,
      "In Progress": 0,
      Review: 0,
      Completed: 0
    };

    tasks.forEach((t) => {
      if (t.status === TaskStatus.TODO) counts.Todo++;
      else if (t.status === TaskStatus.IN_PROGRESS) counts["In Progress"]++;
      else if (t.status === TaskStatus.REVIEW) counts.Review++;
      else if (t.status === TaskStatus.COMPLETED) counts.Completed++;
    });

    return [
      { name: "To Do", value: counts.Todo },
      { name: "In Progress", value: counts["In Progress"] },
      { name: "Review", value: counts.Review },
      { name: "Completed", value: counts.Completed }
    ].filter(item => item.value > 0);
  }, [tasks]);

  const COLORS_STATUS = ["#6366f1", "#f59e0b", "#a855f7", "#10b981"];

  // 2. Priority Distribution Graph
  const priorityData = useMemo(() => {
    const counts = { Low: 0, Medium: 0, High: 0, Critical: 0, Someday: 0 };
    tasks.forEach((t) => {
      if (t.priority === TaskPriority.LOW) counts.Low++;
      else if (t.priority === TaskPriority.MEDIUM) counts.Medium++;
      else if (t.priority === TaskPriority.HIGH) counts.High++;
      else if (t.priority === TaskPriority.CRITICAL) counts.Critical++;
      else if (t.priority === TaskPriority.SOMEDAY) counts.Someday++;
    });

    return [
      { name: "Low", count: counts.Low },
      { name: "Medium", count: counts.Medium },
      { name: "High", count: counts.High },
      { name: "Critical", count: counts.Critical },
      { name: "Someday", count: counts.Someday }
    ];
  }, [tasks]);

  // 3. Focus hours trend logs
  const focusHistoricalData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const results = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateKey = d.toISOString().split("T")[0];

      // Sum focus minutes completed
      const totalMinutesInput = focusSessions
        .filter((s) => s.completedAt.startsWith(dateKey))
        .reduce((sum, s) => sum + s.duration, 0);

      results.push({
        dayName,
        "Focus Duration (m)": totalMinutesInput
      });
    }
    return results;
  }, [focusSessions]);

  // Summary Metrics calculations
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const activeFocusMinsTotal = focusSessions.reduce((sum, s) => sum + s.duration, 0);
  const aggregateActiveDaysHabit = habits.reduce((sum, h) => sum + h.completedDates.length, 0);

  return (
    <div className="space-y-8 font-sans">
      
      {/* 1. Insights Greeting Banner */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Synaptic Insights Dashboard</h1>
        <p className="text-sm text-zinc-400">Review metrics on cognitive performance and system integrity loops.</p>
      </div>

      {/* 2. Core Stats Bar Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Aggregate Tasks</p>
            <p className="text-xl font-bold text-white mt-0.5">{completedTasksCount}/{totalTasksCount}</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Focus Duration</p>
            <p className="text-xl font-bold text-white mt-0.5">{activeFocusMinsTotal} Mins</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Zap className="h-5 w-5 fill-current" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Habit Accumulations</p>
            <p className="text-xl font-bold text-white mt-0.5">{aggregateActiveDaysHabit} Triggers</p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-xl flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">Cognitive Multipliers</p>
            <p className="text-xl font-bold text-white mt-0.5">{(totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) : 1).toFixed(2)}x</p>
          </div>
        </div>
      </div>

      {/* 3. Recharts Visualizations Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Status pie chart */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <PieIcon className="h-4.5 w-4.5 text-indigo-400" />
              Node Status Distribution
            </h3>
            <p className="text-xs text-zinc-400">Percentage distribution of register tasks across active pipelines</p>
          </div>

          <div className="h-60 flex items-center justify-center relative font-mono text-xs">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_STATUS[index % COLORS_STATUS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#09090b", 
                      borderColor: "#27272a", 
                      borderRadius: "8px", 
                      fontSize: "12px",
                      color: "#fff",
                      fontFamily: "var(--font-mono)"
                    }} 
                  />
                  <Legend iconSize={8} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-zinc-650 italic text-zinc-500">Add tasks and start modifying their progress to construct stats.</p>
            )}
          </div>
        </div>

        {/* Priority distribution bar chart */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <BarChart2 className="h-4.5 w-4.5 text-cyan-400" />
              Criticality Mapping
            </h3>
            <p className="text-xs text-zinc-400">Total volume of tasks divided by priority weight values</p>
          </div>

          <div className="h-60 font-mono text-xs pr-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#09090b", 
                    borderColor: "#27272a", 
                    borderRadius: "8px", 
                    fontSize: "12px",
                    color: "#fff",
                    fontFamily: "var(--font-mono)"
                  }} 
                />
                <Bar dataKey="count" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Historical focus hours line chart */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-900 rounded-xl p-5 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
              <TrendingUp className="h-4.5 w-4.5 text-orange-400 animate-pulse" />
              Weekly Deep Focus Heatmap
            </h3>
            <p className="text-xs text-zinc-400">Daily focus minutes completed over the last 7 days</p>
          </div>

          <div className="h-60 font-mono text-xs pr-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={focusHistoricalData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="dayName" stroke="#52525b" tickLine={false} />
                <YAxis stroke="#52525b" tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#09090b", 
                    borderColor: "#27272a", 
                    borderRadius: "8px", 
                    fontSize: "12px",
                    color: "#white",
                    fontFamily: "var(--font-mono)"
                  }} 
                />
                <Line type="monotone" dataKey="Focus Duration (m)" stroke="#38bdf8" strokeWidth={3} dot={{ fill: "#38bdf8", r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}

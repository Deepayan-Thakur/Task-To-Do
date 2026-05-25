import React, { useState, useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { Habit } from "../types";
import { Plus, Trash2, Flame, Calendar, Sparkles, CheckCircle2, Award, Zap, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export default function Habits() {
  const { habits, addHabit, toggleHabitDate, deleteHabit } = useTasks();

  const [newHabitTitle, setNewHabitTitle] = useState("");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  const todayStr = new Date().toISOString().split("T")[0];

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    await addHabit(newHabitTitle, frequency);
    setNewHabitTitle("");
  };

  // Generate last 30 days of keys to represent our contribution grid Map
  const last30Days = useMemo(() => {
    const dates = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }, []);

  // Compute active weekly averages
  const overallCompletionsCount = useMemo(() => {
    const totalComps = habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    return totalComps;
  }, [habits]);

  return (
    <div className="space-y-6 font-sans">
      
      {/* 1. Add Habit Card & Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Creation Input Block */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4 md:col-span-1">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Engrave Daily Habit
            </h3>
            <p className="text-xs text-zinc-400">Initialize continuous loop milestones</p>
          </div>

          <form onSubmit={handleCreateHabit} className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">Habit Node Label</label>
              <input
                type="text"
                required
                placeholder="e.g. Code 45 minutes, Meditate..."
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-800 rounded bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">Iteration Frequency</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFrequency("daily")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                    frequency === "daily" 
                      ? "bg-indigo-600/20 border border-indigo-500/30 text-white" 
                      : "bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800"
                  }`}
                >
                  Daily
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency("weekly")}
                  className={`px-3 py-1.5 rounded text-xs font-semibold cursor-pointer ${
                    frequency === "weekly" 
                      ? "bg-indigo-600/20 border border-indigo-500/30 text-white" 
                      : "bg-zinc-900 text-zinc-400 border border-transparent hover:bg-zinc-800"
                  }`}
                >
                  Weekly
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded text-xs font-semibold text-white shadow shadow-indigo-500/10 cursor-pointer hover:bg-indigo-600 active:scale-97 transition-all"
            >
              Initialize Habit Loop
            </button>
          </form>
        </div>

        {/* Dynamic Achievements Display Header */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-44 w-44 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none" />
          
          <div className="space-y-3 z-10">
            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
              <Award className="h-4 w-4 text-cyan-400" />
              Momentum Loyalty Engine
            </div>
            <h3 className="text-xl font-bold text-white leading-snug">Consistency generates Neuroplasticity.</h3>
            <p className="text-xs text-zinc-400 max-w-lg leading-relaxed">
              Checking off habits multiplies your daily XP yield, unlocking premium profile badges. Gaps in completion will cause your flame streak multipliers to reset to day zero. Protect your streak! ⚡
            </p>
          </div>

          <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 shrink-0 text-center space-y-1 shadow shadow-black">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">Cumulative Checks</span>
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
              {overallCompletionsCount} Nodes
            </p>
            <p className="text-[10px] font-mono text-zinc-500">synapses compiled</p>
          </div>
        </div>
      </div>

      {/* 2. Habits Listing with beautiful 30-Day Grid maps and flame counters */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase font-mono tracking-widest text-zinc-400">Habit Catalysts List</h3>

        {habits.length > 0 ? (
          habits.map((habit) => (
            <div 
              key={habit.id}
              className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 hover:border-zinc-800/80 transition-all font-sans relative flex flex-col lg:flex-row gap-6 lg:items-center justify-between"
            >
              
              {/* Habit Details section */}
              <div className="space-y-2 lg:max-w-xs flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 text-zinc-400 rounded px-1.5 py-0.5 uppercase tracking-wider">
                    {habit.frequency}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                    <Flame className="h-3.5 w-3.5 fill-current" />
                    <span>{habit.streak} Day Streak</span>
                  </div>
                </div>
                
                <h4 className="text-sm font-bold text-white">{habit.title}</h4>
              </div>

              {/* 30 Days Grid Section (GitHub contribution grid lookalike!) */}
              <div className="space-y-2 flex-1">
                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                  <span>30 Days Heatmap</span>
                  <span>Completed {habit.completedDates.length} days</span>
                </div>

                {/* Minimal grid */}
                <div className="flex flex-wrap gap-1 bg-zinc-900/40 p-2 border border-zinc-900 rounded-lg">
                  {last30Days.map((dateStr) => {
                    const isCompleted = habit.completedDates.includes(dateStr);
                    const isTarget = dateStr === todayStr;
                    return (
                      <div 
                        key={dateStr}
                        onClick={() => toggleHabitDate(habit.id, dateStr)}
                        title={`${dateStr} ${isCompleted ? "- Done" : "- Pending"}`}
                        className={`h-4.5 w-4.5 rounded cursor-pointer transition-all ${
                          isCompleted
                            ? "bg-indigo-500 ring-1 ring-indigo-400"
                            : isTarget
                            ? "bg-zinc-900 border border-zinc-400"
                            : "bg-zinc-950 border border-zinc-900 hover:border-zinc-800"
                        }`}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-between font-mono text-[9px] text-zinc-500 px-1">
                  <span>30 days ago</span>
                  <span>Today</span>
                </div>
              </div>

              {/* Action buttons list */}
              <div className="flex items-center gap-3 shrink-0 lg:border-l border-zinc-900 lg:pl-6">
                <button
                  onClick={() => toggleHabitDate(habit.id, todayStr)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    habit.completedDates.includes(todayStr)
                      ? "bg-indigo-600/20 border border-indigo-400/50 text-indigo-300"
                      : "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 hover:text-white text-zinc-400"
                  }`}
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Checked Today
                </button>
                
                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded cursor-pointer"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center space-y-2">
            <HelpCircle className="h-8 w-8 text-zinc-700 animate-pulse" />
            <p className="text-sm font-medium">No routine catalyst habit loops discovered yet</p>
            <p className="text-xs text-zinc-630">Synthesize a new daily habit above to build consistent synapses</p>
          </div>
        )}
      </div>

    </div>
  );
}

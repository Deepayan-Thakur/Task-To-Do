import React, { useState, useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { TaskStatus, TaskPriority } from "../types";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, Clock, Edit } from "lucide-react";
import { motion } from "motion/react";

export default function CalendarView() {
  const { tasks } = useTasks();
  
  // Track currently viewing Calendar Year and Month
  const [currentDate, setCurrentDate] = useState(() => new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Days calculations
  const daysInMonth = useMemo(() => {
    return new Date(year, month + 1, 0).getDate();
  }, [year, month]);

  const firstDayIndex = useMemo(() => {
    // Get which week day the month starts at (0 = Sun, 1 = Mon, etc.)
    return new Date(year, month, 1).getDay();
  }, [year, month]);

  // Construct grid metrics
  const calendarDays = useMemo(() => {
    const daysArr = [];
    
    // Fill previous month offsets
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      daysArr.push({
        dayNum: prevMonthDays - i,
        isCurrentMonth: false,
        dateKey: "" // disabled
      });
    }

    // Fill current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const dayStr = String(i).padStart(2, "0");
      const monthStr = String(month + 1).padStart(2, "0");
      const dateKey = `${year}-${monthStr}-${dayStr}`;

      daysArr.push({
        dayNum: i,
        isCurrentMonth: true,
        dateKey
      });
    }

    // Pad end days to complete full 6 weeks (42 cells)
    const remaining = 42 - daysArr.length;
    for (let i = 1; i <= remaining; i++) {
      daysArr.push({
        dayNum: i,
        isCurrentMonth: false,
        dateKey: ""
      });
    }

    return daysArr;
  }, [year, month, daysInMonth, firstDayIndex]);

  // Aggregate Agenda due items chronologically
  const agendaTasks = useMemo(() => {
    return tasks
      .filter((t) => t.dueDate)
      .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Main Interactive Calendar Grid Column */}
      <div className="xl:col-span-2 rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4">
        
        {/* Navigation bar */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-indigo-400" />
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-zinc-400">Map focus workloads across calendar orbits</p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrevMonth}
              className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={handleNextMonth}
              className="p-2 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Calendar grid headers */}
        <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] text-zinc-500 uppercase tracking-wider font-semibold py-1">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days grid tiles */}
        <div className="grid grid-cols-7 gap-1.5 min-h-[380px]">
          {calendarDays.map((cell, idx) => {
            const dateTasks = cell.dateKey 
              ? tasks.filter((t) => t.dueDate === cell.dateKey) 
              : [];
            const isToday = cell.dateKey === new Date().toISOString().split("T")[0];

            return (
              <div 
                key={idx}
                className={`p-1.5 rounded-lg border flex flex-col justify-between items-start cursor-pointer transition-all ${
                  !cell.isCurrentMonth 
                    ? "bg-zinc-950/20 border-transparent text-zinc-700 pointer-events-none" 
                    : isToday 
                    ? "border-indigo-500/80 bg-indigo-500/5 text-white shadow-lg shadow-indigo-500/5" 
                    : "border-zinc-900 bg-zinc-900/10 hover:border-zinc-800 text-zinc-300"
                }`}
              >
                {/* Day indicator number */}
                <span className={`text-[11px] font-mono font-medium rounded p-0.5 px-1 ${
                  isToday ? "bg-indigo-600 text-white" : ""
                }`}>
                  {cell.dayNum}
                </span>

                {/* Day tasks indicators list */}
                <div className="w-full space-y-1 mt-2.5">
                  {dateTasks.slice(0, 2).map((t) => (
                    <div 
                      key={t.id}
                      className={`text-[9px] truncate rounded px-1.5 py-0.5 font-sans flex items-center gap-1 leading-snug ${
                        t.status === TaskStatus.COMPLETED 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 line-through" 
                          : t.priority === TaskPriority.CRITICAL 
                          ? "bg-red-500/10 text-red-400 border border-red-500/10" 
                          : t.priority === TaskPriority.HIGH
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/10"
                          : "bg-zinc-800 text-zinc-300 border border-zinc-800"
                      }`}
                    >
                      {t.title}
                    </div>
                  ))}
                  {dateTasks.length > 2 && (
                    <div className="text-[8px] text-zinc-500 font-mono text-center">
                      + {dateTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Side Agenda Column View */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4 flex flex-col max-h-[480px]">
        <div className="space-y-0.5">
          <h3 className="text-base font-semibold text-white">Chronological Agenda</h3>
          <p className="text-xs text-zinc-400">All scheduled synapse milestone targets</p>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {agendaTasks.length > 0 ? (
            agendaTasks.map((task) => (
              <div 
                key={task.id}
                className="p-3.5 rounded-lg border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/60 transition-all flex justify-between items-start gap-4"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] text-zinc-500">{task.dueDate}</span>
                    <span className={`text-[8px] font-mono rounded px-1 py-0.5 uppercase ${
                      task.status === TaskStatus.COMPLETED ? "bg-emerald-500/10 text-emerald-400" : "bg-indigo-500/10 text-indigo-400"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <p className="text-sm font-sans font-medium text-white truncate">{task.title}</p>
                </div>

                <div className="flex items-center gap-1 shrink-0 font-mono text-xs text-zinc-500">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{task.estimatedMinutes}m</span>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-600 font-sans space-y-2">
              <CalendarIcon className="h-8 w-8 text-zinc-800 animate-pulse" />
              <p className="text-xs">No dates schedules. Map due dates inside your focus registers to generate roadmap logs.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

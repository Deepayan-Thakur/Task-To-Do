import React, { useState, useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { Task, TaskPriority, TaskStatus } from "../types";
import { 
  Plus, 
  Search, 
  Sparkles, 
  Trash2, 
  Calendar as CalendarIcon, 
  AlertCircle, 
  CheckCircle,
  HelpCircle,
  Clock,
  ListFilter,
  Columns,
  List,
  Edit2,
  ListChecks,
  Compass,
  ArrowRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "motion/react";

export default function Tasks() {
  const { 
    tasks, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleSubtask, 
    addSubtask, 
    generateAiSubtasks 
  } = useTasks();

  // Mode Selection: "list" vs "kanban"
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  
  // Search & Filters state
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Create Task states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDueDate, setNewDueDate] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [newDifficulty, setNewDifficulty] = useState(2);
  const [newEstMin, setNewEstMin] = useState(25);

  // Active Selected Task state (for side drawers / subtask lists edit)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // Filter computations
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || 
                          (t.description || "").toLowerCase().includes(search.toLowerCase());
      const matchPriority = priorityFilter === "All" || t.priority === priorityFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchSearch && matchPriority && matchStatus;
    });
  }, [tasks, search, priorityFilter, statusFilter]);

  const kanbanColumns = [
    { title: "To Do", status: TaskStatus.TODO, border: "border-indigo-500/20", bubble: "bg-indigo-505" },
    { title: "In Progress", status: TaskStatus.IN_PROGRESS, border: "border-amber-500/20", bubble: "bg-amber-505" },
    { title: "Review", status: TaskStatus.REVIEW, border: "border-purple-500/20", bubble: "bg-purple-505" },
    { title: "Completed", status: TaskStatus.COMPLETED, border: "border-emerald-500/20", bubble: "bg-emerald-505" }
  ];

  const handleAddNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await addTask(
      newTitle,
      newDesc,
      newDueDate,
      newPriority,
      newDifficulty,
      newEstMin
    );
    // Reset Form
    setNewTitle("");
    setNewDesc("");
    setNewDueDate("");
    setNewPriority(TaskPriority.MEDIUM);
    setNewDifficulty(2);
    setNewEstMin(25);
    setIsAddOpen(false);
  };

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newSubtaskTitle.trim()) return;
    await addSubtask(selectedTask.id, newSubtaskTitle);
    setNewSubtaskTitle("");
    
    // Refresh local drawer state reference
    const updated = tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const handleSubtoggle = async (taskId: string, subId: string) => {
    await toggleSubtask(taskId, subId);
    
    // Refresh local state reference
    if (selectedTask && selectedTask.id === taskId) {
      const updated = tasks.find(t => t.id === taskId);
      if (updated) setSelectedTask(updated);
    }
  };

  const triggerGeminiBreakdown = async (taskId: string) => {
    await generateAiSubtasks(taskId);
    
    // Refresh local selected state
    if (selectedTask && selectedTask.id === taskId) {
      const updated = tasks.find(t => t.id === taskId);
      if (updated) setSelectedTask(updated);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-sans tracking-tight">Focus Node Registry</h1>
          <p className="text-sm text-zinc-400">Map your actionable items, partition with AI, and execute goals.</p>
        </div>

        {/* View Toggle + Create Trigger */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-zinc-800 bg-zinc-950 p-1 shrink-0 font-sans">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                viewMode === "list" 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <List className="h-3.5 w-3.5" />
              List View
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-all ${
                viewMode === "kanban" 
                  ? "bg-zinc-800 text-white" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Columns className="h-3.5 w-3.5" />
              Kanban Board
            </button>
          </div>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 rounded-lg text-white text-xs font-sans font-semibold cursor-pointer shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 active:scale-95 transition-all">
                <Plus className="h-4 w-4" />
                Initialize Task
              </button>
            </DialogTrigger>
            
            {/* Elegant Creation Form */}
            <DialogContent className="bg-zinc-950 border border-zinc-900 text-zinc-200 max-w-lg rounded-xl">
              <DialogHeader>
                <DialogTitle className="text-white font-sans flex items-center gap-2">
                  <Compass className="h-5 w-5 text-indigo-400" />
                  Map Focus Target
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleAddNewTask} className="space-y-4 pt-2 font-sans">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Node Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architect API framework..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Context / Desc</label>
                  <textarea
                    placeholder="Describe core endpoints and credentials..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={(e) => setNewDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Priority Level</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value={TaskPriority.LOW}>Low</option>
                      <option value={TaskPriority.MEDIUM}>Medium</option>
                      <option value={TaskPriority.HIGH}>High</option>
                      <option value={TaskPriority.CRITICAL}>Critical</option>
                      <option value={TaskPriority.SOMEDAY}>Someday</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Synapse Difficulty (1-5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs uppercase font-mono tracking-widest text-zinc-400">Est. Duration (Mins)</label>
                    <input
                      type="number"
                      min={5}
                      value={newEstMin}
                      onChange={(e) => setNewEstMin(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3 text-xs font-semibold">
                  <button 
                    type="button" 
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                  >
                    Deploy Target
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* 2. Filters Row */}
      <div className="flex flex-wrap items-center gap-4 bg-zinc-950 p-4 rounded-xl border border-zinc-900 font-sans">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search index database..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-zinc-800 rounded-lg bg-zinc-900/60 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0 text-xs text-zinc-400">
            <ListFilter className="h-4 w-4" />
            Filters:
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 border border-zinc-800 bg-zinc-900 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Priorities</option>
            <option value={TaskPriority.LOW}>Low</option>
            <option value={TaskPriority.MEDIUM}>Medium</option>
            <option value={TaskPriority.HIGH}>High</option>
            <option value={TaskPriority.CRITICAL}>Critical</option>
            <option value={TaskPriority.SOMEDAY}>Someday</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 border border-zinc-800 bg-zinc-900 rounded-lg text-xs text-white focus:outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value={TaskStatus.TODO}>To Do</option>
            <option value={TaskStatus.IN_PROGRESS}>In Progress</option>
            <option value={TaskStatus.REVIEW}>Review</option>
            <option value={TaskStatus.COMPLETED}>Completed</option>
            <option value={TaskStatus.ARCHIVED}>Archived</option>
          </select>
        </div>
      </div>

      {/* 3. Main Views Grid */}
      <AnimatePresence mode="wait">
        
        {/* LIST VIEW LAYOUT */}
        {viewMode === "list" && (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div 
                  key={task.id}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 hover:bg-zinc-900/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group font-sans"
                >
                  <div className="flex items-center gap-3.5">
                    <input 
                      type="checkbox"
                      checked={task.status === TaskStatus.COMPLETED}
                      onChange={() => updateTask(task.id, { 
                        status: task.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED 
                      })}
                      className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-indigo-500 focus:ring-offset-zinc-950 focus:ring-indigo-500 cursor-pointer"
                    />
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => setSelectedTask(task)}
                          className={`text-sm font-medium cursor-pointer ${
                            task.status === TaskStatus.COMPLETED 
                              ? "text-zinc-500 line-through" 
                              : "text-zinc-100 hover:text-indigo-400 hover:underline transition-all"
                          }`}
                        >
                          {task.title}
                        </span>
                        
                        {/* Tags list */}
                        {task.difficulty && (
                          <span className="font-mono text-[9px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded px-1 py-0.5">
                            D{task.difficulty}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-xs text-zinc-400 line-clamp-1 max-w-xl">{task.description || "No context added."}</p>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-3.5 sm:justify-end">
                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                      <CalendarIcon className="h-3.5 w-3.5" />
                      <span>{task.dueDate || "unscheduled"}</span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs text-zinc-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{task.estimatedMinutes}m</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className="p-1 px-2 text-[10px] text-zinc-400 hover:text-white hover:bg-zinc-800 rounded font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <ListChecks className="h-3.5 w-3.5" />
                        Subtasks ({task.subtasks.filter(s => s.completed).length}/{task.subtasks.length})
                      </button>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-red-500/5 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center space-y-2">
                <HelpCircle className="h-8 w-8 text-zinc-700 animate-pulse" />
                <p className="text-sm font-sans font-medium">No tasks found matching your synapse configuration</p>
                <p className="text-xs text-zinc-600">Register a new target node above to get started</p>
              </div>
            )}
          </motion.div>
        )}

        {/* KANBAN BOARD VIEW LAYOUT */}
        {viewMode === "kanban" && (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            {kanbanColumns.map((col) => {
              const colTasks = tasks.filter(t => t.status === col.status);
              return (
                <div 
                  key={col.status}
                  className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-4 flex flex-col min-h-[450px]"
                >
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${
                        col.status === TaskStatus.TODO ? "bg-indigo-500" :
                        col.status === TaskStatus.IN_PROGRESS ? "bg-amber-400" :
                        col.status === TaskStatus.REVIEW ? "bg-purple-500" :
                        "bg-emerald-400"
                      }`} />
                      <h3 className="text-sm font-semibold font-sans text-white">{col.title}</h3>
                    </div>
                    <span className="font-mono text-xs text-zinc-500 bg-zinc-900 rounded-full px-2 py-0.5">{colTasks.length}</span>
                  </div>

                  <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                    {colTasks.map((task) => (
                      <div 
                        key={task.id}
                        className="p-3.5 rounded-lg border border-zinc-800/80 bg-zinc-950 hover:bg-zinc-900/30 hover:border-zinc-700 transition-all font-sans relative group cursor-pointer space-y-3"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-white group-hover:text-indigo-400 transition-all truncate">
                            {task.title}
                          </p>
                          <p className="text-xs text-zinc-400 line-clamp-2">{task.description || "No description provided."}</p>
                        </div>

                        {/* Card metadata attributes */}
                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono rounded px-1.5 py-0.5 ${
                              task.priority === TaskPriority.CRITICAL ? "bg-red-500/10 text-red-400" :
                              task.priority === TaskPriority.HIGH ? "bg-orange-500/10 text-orange-400" :
                              "bg-zinc-800 text-zinc-400"
                            }`}>
                              {task.priority}
                            </span>
                            
                            <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1 bg-zinc-900 px-1 py-0.5 rounded">
                              <ListChecks className="h-3 w-3" />
                              {task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const stepFlow = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.REVIEW, TaskStatus.COMPLETED];
                                const currIdx = stepFlow.indexOf(task.status);
                                if (currIdx < stepFlow.length - 1) {
                                  updateTask(task.id, { status: stepFlow[currIdx+1] });
                                }
                              }}
                              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-indigo-400 rounded cursor-pointer"
                            >
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {colTasks.length === 0 && (
                      <div className="h-32 text-zinc-650 flex items-center justify-center border border-dashed border-zinc-900 rounded-lg text-xs font-sans text-stone-600">
                        Column Empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. TASK DETAILS & SUBTASK LIST MODAL (DRAWER EXPANSION) */}
      <AnimatePresence>
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="bg-zinc-950 border border-zinc-900 text-zinc-200 max-w-xl rounded-xl">
              <DialogHeader>
                <div className="flex justify-between items-center pr-6">
                  <DialogTitle className="text-lg font-bold text-white font-sans flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-indigo-400" />
                    Focus Synapse Panel
                  </DialogTitle>
                  <span className="font-mono text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase tracking-widest">
                    Real-time data node
                  </span>
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-2 font-sans overflow-y-auto max-h-[480px] pr-1">
                
                {/* Core Header Stats */}
                <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-3">
                  <h3 className="text-base font-semibold text-white">{selectedTask.title}</h3>
                  <p className="text-sm text-zinc-400">{selectedTask.description || "No context description registered."}</p>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Priority</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{selectedTask.priority}</p>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Difficulty</p>
                      <p className="text-xs font-semibold text-white mt-0.5">D{selectedTask.difficulty}</p>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Duration</p>
                      <p className="text-xs font-semibold text-white mt-0.5">{selectedTask.estimatedMinutes} Mins</p>
                    </div>
                    <div className="bg-zinc-950 p-2 rounded-lg border border-zinc-900 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Status</p>
                      <p className="text-xs font-semibold text-indigo-400 mt-0.5">{selectedTask.status}</p>
                    </div>
                  </div>
                </div>

                {/* Gemini AI breakdown action */}
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-indigo-500/20 bg-indigo-950/10">
                  <div className="space-y-0.5">
                    <h4 className="text-sm text-indigo-200 font-sans font-semibold flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                      Gemini Auto-Breakdown Engine
                    </h4>
                    <p className="text-xs text-zinc-400 font-sans">Convert task context into granular subtasks via LLM reasoning</p>
                  </div>
                  <button
                    onClick={() => triggerGeminiBreakdown(selectedTask.id)}
                    className="flex items-center gap-1 shrink-0 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer shadow-md transition-all active:scale-95"
                  >
                    Generate Nodes
                  </button>
                </div>

                {/* Subtask listing with checklist */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs uppercase font-mono tracking-widest text-zinc-400">Execution Checklist</h4>
                    <span className="font-mono text-xs text-zinc-500 bg-zinc-90 */ pr-2">
                      {selectedTask.subtasks.filter(s => s.completed).length}/{selectedTask.subtasks.length} Done
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {selectedTask.subtasks.map((sub) => (
                      <div 
                        key={sub.id} 
                        className="flex items-center gap-3 p-2.5 rounded bg-zinc-900/30 border border-zinc-900"
                      >
                        <input 
                          type="checkbox"
                          checked={sub.completed}
                          onChange={() => handleSubtoggle(selectedTask.id, sub.id)}
                          className="h-3.5 w-3.5 rounded border-zinc-800 bg-zinc-900 text-indigo-500 focus:ring-offset-zinc-950 cursor-pointer"
                        />
                        <span className={`text-sm ${sub.completed ? "text-zinc-500 line-through" : "text-zinc-200"}`}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                    {selectedTask.subtasks.length === 0 && (
                      <p className="text-xs text-zinc-500 italic text-center py-4 bg-zinc-900/10 border border-dashed border-zinc-900 rounded">
                        No subtasks generated yet. Type below or run the Gemini auto-breakdown flow.
                      </p>
                    )}
                  </div>

                  {/* Add manual subtask */}
                  <form onSubmit={handleAddSub} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Add subtask manually..."
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-zinc-800 rounded bg-zinc-900 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                    />
                    <button 
                      type="submit"
                      className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold text-white cursor-pointer"
                    >
                      Append
                    </button>
                  </form>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => setSelectedTask(null)}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Close Synapse Panel
                  </button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}

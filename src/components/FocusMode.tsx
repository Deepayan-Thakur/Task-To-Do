import React, { useState, useEffect, useRef, useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { TaskStatus } from "../types";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Brain, 
  Check, 
  Clock, 
  TrendingUp,
  Target,
  Flame,
  Power,
  Dribbble
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function FocusMode() {
  const { tasks, focusSessions, logFocusSession } = useTasks();

  // Focus Modes: "pomodoro" (25 min) | "flow" (stopwatch or free flow)
  const [timerType, setTimerType] = useState<"pomodoro" | "flow">("pomodoro");
  const [sessionState, setSessionState] = useState<"idle" | "running" | "paused">("idle");
  
  // Timer numerical properties (Seconds)
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [estimatedDuration] = useState(25 * 60);

  // Stopwatch properties (Seconds accrued)
  const [secondsFlow, setSecondsFlow] = useState(0);

  // Linked task selection state
  const [linkedTaskId, setLinkedTaskId] = useState<string>("");

  // Synthesized Ambient Sound Controller using standard Web Audio API
  const [synthActive, setSynthActive] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const biquadFilterRef = useRef<BiquadFilterNode | null>(null);

  // Auto-decrement timer ticks
  useEffect(() => {
    let interval: any = null;

    if (sessionState === "running") {
      interval = setInterval(() => {
        if (timerType === "pomodoro") {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              handleTimerCompleted();
              return 0;
            }
            return prev - 1;
          });
        } else {
          setSecondsFlow((prev) => prev + 1);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [sessionState, timerType]);

  // Handle timer completions
  const handleTimerCompleted = () => {
    setSessionState("idle");
    const durationMins = 25;
    logFocusSession("pomodoro", durationMins, linkedTaskId || undefined);

    // Stop synth noise immediately upon session end
    stopZenSynth();
    setTimeLeft(25 * 60);
  };

  // Safe manual flow session finalize
  const handleFinalizeFlow = () => {
    if (secondsFlow < 10) {
      alert("Please focus for at least 10 seconds before logging session.");
      return;
    }
    setSessionState("idle");
    const minutesCompleted = Math.max(1, Math.round(secondsFlow / 60));
    logFocusSession("flow", minutesCompleted, linkedTaskId || undefined);
    
    // reset states
    setSecondsFlow(0);
    stopZenSynth();
  };

  // Interactive controls
  const handleTogglePlay = () => {
    if (sessionState === "running") {
      setSessionState("paused");
      // Mute synth temporarily if active
      if (synthActive && gainNodeRef.current) {
        gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current?.currentTime || 0);
      }
    } else {
      setSessionState("running");
      if (synthActive) {
        startZenSynth();
      }
    }
  };

  const handleReset = () => {
    setSessionState("idle");
    setTimeLeft(25 * 60);
    setSecondsFlow(0);
    stopZenSynth();
  };

  // Web Audio API Synthesizer (Generates deep immersive low-frequency state-zero Zen Drones!)
  const startZenSynth = () => {
    try {
      if (!audioCtxRef.current) {
        // Build web audio context
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Check if nodes are already active
      if (osc1Ref.current) return;

      // 1. Create Nodes
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const biquadFilter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      // 2. Synthesize deep alpha/theta focus drone frequencies (Oscillating waves)
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(85, ctx.currentTime); // Deep alpha bass resonance

      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(85.5, ctx.currentTime); // Slight frequency detune for binaural beat effects

      // 3. Configure Lowpass filter to block distracting high frequencies (underwater feeling)
      biquadFilter.type = "lowpass";
      biquadFilter.frequency.setValueAtTime(150, ctx.currentTime);
      biquadFilter.Q.setValueAtTime(1, ctx.currentTime);

      // 4. Smooth volume level gain (uncluttered quietness)
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 2.0); // 2 seconds fade in

      // 5. Build pipeline connections
      osc1.connect(biquadFilter);
      osc2.connect(biquadFilter);
      biquadFilter.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 6. Start oscillations
      osc1.start();
      osc2.start();

      // Store references
      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      biquadFilterRef.current = biquadFilter;
      gainNodeRef.current = gainNode;
      setSynthActive(true);

    } catch (e) {
      console.error("Web Audio Synth instantiation failed:", e);
    }
  };

  const stopZenSynth = () => {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.cancelScheduledValues(ctx.currentTime);
        gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, ctx.currentTime);
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0); // 1 second fade output
        
        const o1 = osc1Ref.current;
        const o2 = osc2Ref.current;
        
        setTimeout(() => {
          try { o1?.stop(); } catch(e){}
          try { o2?.stop(); } catch(e){}
        }, 1100);
      }

      osc1Ref.current = null;
      osc2Ref.current = null;
      gainNodeRef.current = null;
      biquadFilterRef.current = null;
      setSynthActive(false);
    } catch(err) {
      console.error("Mute zen loop fail:", err);
    }
  };

  const handleToggleSynth = () => {
    if (synthActive) {
      stopZenSynth();
    } else {
      startZenSynth();
    }
  };

  // Make sure we stop oscillator noise if components unmount
  useEffect(() => {
    return () => {
      stopZenSynth();
    };
  }, []);

  // Formatter utilities
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Today Focus Session Logs stats
  const todayFocusStats = useMemo(() => {
    const todayKey = new Date().toISOString().split("T")[0];
    const sessionsToday = focusSessions.filter(s => s.completedAt.startsWith(todayKey));
    const totalMins = sessionsToday.reduce((sum, s) => sum + s.duration, 0);
    return {
      count: sessionsToday.length,
      minutes: totalMins
    };
  }, [focusSessions]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Immersive Deep Work Timer Center (Two-column wide span) */}
      <div className="xl:col-span-2 rounded-xl border border-zinc-900 bg-zinc-950 p-6 flex flex-col items-center justify-center relative overflow-hidden min-h-[480px]">
        {/* Ambient grids */}
        <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 to-transparent pointer-events-none" />
        
        {/* Core Mode toggler tab bar */}
        <div className="flex bg-zinc-900/40 border border-zinc-900 p-1.5 rounded-lg z-10 space-x-2">
          <button
            onClick={() => {
              setTimerType("pomodoro");
              setSessionState("idle");
              setTimeLeft(25 * 60);
            }}
            className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
              timerType === "pomodoro"
                ? "bg-zinc-800 text-white shadow shadow-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Pomodoro (25m)
          </button>
          <button
            onClick={() => {
              setTimerType("flow");
              setSessionState("idle");
              setSecondsFlow(0);
            }}
            className={`px-4 py-1.5 rounded text-xs font-semibold cursor-pointer transition-all ${
              timerType === "flow"
                ? "bg-zinc-800 text-white shadow shadow-black"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Flow state (Stopwatch)
          </button>
        </div>

        {/* Big visual glowing watch countdown ring */}
        <div className="relative my-10 flex items-center justify-center z-10">
          <div className="h-60 w-60 rounded-full border-4 border-zinc-900 flex items-center justify-center relative shadow-2xl">
            {/* Visual pulsing border glow when running */}
            {sessionState === "running" && (
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-ping" />
            )}
            
            <div className="text-center space-y-1">
              {timerType === "pomodoro" ? (
                <div className="text-4xl font-extrabold tracking-mono text-white select-none">
                  {formatTime(timeLeft)}
                </div>
              ) : (
                <div className="text-4xl font-extrabold tracking-mono text-white select-none">
                  {formatTime(secondsFlow)}
                </div>
              )}
              <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
                {sessionState === "running" ? "Entering State Zero" : "Synthesizer Ready"}
              </span>
            </div>
          </div>
        </div>

        {/* Selection linked focuses */}
        <div className="w-full max-w-sm z-10 space-y-2 mt-4">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Attach Active Target</label>
            <span className="text-[9px] text-zinc-600 font-mono">adds time logging</span>
          </div>
          <select
            value={linkedTaskId}
            onChange={(e) => setLinkedTaskId(e.target.value)}
            disabled={sessionState !== "idle"}
            className="w-full px-3 py-2 border border-zinc-805 bg-zinc-900 rounded-lg text-xs text-white focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Unlinked free focus mode</option>
            {tasks
              .filter(t => t.status !== TaskStatus.COMPLETED)
              .map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} (Est: {t.estimatedMinutes}m)
                </option>
              ))}
          </select>
        </div>

        {/* Play control triggers */}
        <div className="flex items-center gap-4 z-10 mt-8">
          <button 
            onClick={handleReset}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-90 w border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          
          <button 
            onClick={handleTogglePlay}
            className="h-16 w-16 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 cursor-pointer active:scale-95 transition-all"
          >
            {sessionState === "running" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
          </button>

          {/* Special trigger to end Flow stopwatch */}
          {timerType === "flow" ? (
            <button 
              onClick={handleFinalizeFlow}
              disabled={sessionState === "idle"}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/25 disabled:opacity-50 cursor-pointer transition-all active:scale-95 text-xs font-bold"
              title="Finalize & Log Deep Work Session"
            >
              <Check className="h-4 w-4" />
            </button>
          ) : (
            <div className="h-10 w-10" /> // empty visual symmetry placeholder
          )}
        </div>

      </div>

      {/* 2. Zen Synthesizer Ambient control side deck */}
      <div className="space-y-6">
        
        {/* Web Audio Synthesizer Toggle */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-cyan-400 animate-pulse" />
              Zen Synth Machine
            </h3>
            <p className="text-xs text-zinc-400 font-sans">Synthesize alpha brainwave drones directly inside your tab</p>
          </div>

          <div 
            onClick={handleToggleSynth}
            className={`p-4 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${
              synthActive
                ? "bg-cyan-950/20 border-cyan-500/30 text-white"
                : "bg-zinc-900/40 border-zinc-900 text-zinc-400 hover:border-zinc-800"
            }`}
          >
            <div className="space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Audio Catalyst active</span>
              <p className="text-sm font-semibold">{synthActive ? "Binaural Focus Active" : "Drone Synthesizer Muted"}</p>
            </div>
            
            <div className={`h-9 w-9 rounded-full border flex items-center justify-center ${
              synthActive ? "bg-cyan-500 text-white" : "border-zinc-800 bg-zinc-950"
            }`}>
              {synthActive ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
            </div>
          </div>
        </div>

        {/* Today Focus Records Stats Panel */}
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              Focus Log Dashboard
            </h3>
            <p className="text-xs text-zinc-400 font-sans">Real-time daily focus performance stats</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-lg text-center space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Completed Sessions</span>
              <p className="text-2xl font-bold text-white mt-0.5">{todayFocusStats.count} Blocks</p>
            </div>
            
            <div className="bg-zinc-900/40 border border-zinc-800 p-3.5 rounded-lg text-center space-y-1">
              <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Aggregate Minutes</span>
              <p className="text-2xl font-bold text-white mt-0.5">{todayFocusStats.minutes} Mins</p>
            </div>
          </div>

          {/* Historical sessions listings */}
          <div className="space-y-2 mt-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-400">History Log Queue</span>
            <div className="max-h-[140px] overflow-y-auto space-y-1.5 pr-1">
              {focusSessions.slice(0, 3).map((ses) => (
                <div 
                  key={ses.id}
                  className="flex items-center justify-between p-2 rounded bg-zinc-900/20 border border-zinc-900 font-sans"
                >
                  <p className="text-xs text-white capitalize leading-relaxed font-semibold">
                    {ses.type} Focus Block
                  </p>
                  
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
                    <Clock className="h-3.5 w-3.5" />
                    <span>{ses.duration} Mins</span>
                  </div>
                </div>
              ))}
              {focusSessions.length === 0 && (
                <div className="text-center py-4 text-zinc-650 text-xs italic">
                  No sessions logged in active history index.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

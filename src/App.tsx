import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { loginWithGoogle, logoutUser } from "./firebase";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { 
  Sparkles, 
  BrainCircuit, 
  LayoutDashboard, 
  Compass, 
  Calendar, 
  Flame, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  LogOut, 
  Menu,
  X,
  Zap,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  Shield,
  Fingerprint
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import view components
import Dashboard from "./components/Dashboard";
import Tasks from "./components/Tasks";
import CalendarView from "./components/CalendarView";
import Habits from "./components/Habits";
import FocusMode from "./components/FocusMode";
import Notes from "./components/Notes";
import Analytics from "./components/Analytics";

function NavigationSidebar({ 
  activeTab, 
  setActiveTab, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  mobileOpen,
  setMobileOpen
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { profile } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard, color: "text-indigo-400" },
    { id: "tasks", label: "Focus Register", Icon: Compass, color: "text-amber-400" },
    { id: "calendar", label: "Calendar Orbits", Icon: Calendar, color: "text-rose-400" },
    { id: "habits", label: "Routine Catalyst", Icon: Flame, color: "text-orange-400" },
    { id: "focus", label: "State Zero (Timer)", Icon: Clock, color: "text-cyan-400" },
    { id: "notes", label: "Notes Vault", Icon: BookOpen, color: "text-teal-400" },
    { id: "analytics", label: "Insights Matrix", Icon: TrendingUp, color: "text-purple-400" },
  ];

  const handleSignOut = async () => {
    try {
      await logoutUser();
      toast.info("Logged out from NeuroList.");
    } catch(e) {
      toast.error("Logout encounterd errors.");
    }
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 border-r border-zinc-900 justify-between select-none">
      <div className="p-4 space-y-6">
        
        {/* Brand logo bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/10">
              <BrainCircuit className="h-5 w-5 text-white animate-pulse" />
            </div>
            {(!sidebarCollapsed || mobileOpen) && (
              <div className="space-y-0.5">
                <span className="font-sans font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 uppercase tracking-wider">
                  NeuroList
                </span>
                <p className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase">Momentum OS</p>
              </div>
            )}
          </div>
          
          {/* Collapse handler for desktop */}
          {!mobileOpen && (
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex h-6 w-6 items-center justify-center rounded border border-zinc-805 hover:bg-zinc-900 text-zinc-500 hover:text-white cursor-pointer"
            >
              📊
            </button>
          )}
        </div>

        {/* User profile capsule card */}
        <div className="p-3 bg-zinc-90 w bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-900 rounded-xl space-y-3 shadow-md">
          <div className="flex items-center gap-3">
            {profile?.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt="user avatar" 
                referrerPolicy="no-referrer"
                className="h-10 w-10 rounded-lg object-cover ring-1 ring-indigo-500/20"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold font-mono">
                {profile?.displayName?.[0]?.toUpperCase() || "E"}
              </div>
            )}
            
            {(!sidebarCollapsed || mobileOpen) && (
              <div className="space-y-0.5 min-w-0 flex-1">
                <p className="text-xs font-bold text-white truncate max-w-[120px] font-sans">{profile?.displayName}</p>
                <div className="flex items-center gap-1 font-mono text-[9px] text-zinc-400">
                  <Zap className="h-3 w-3 text-indigo-400 fill-current" />
                  <span>Rank: Explorer</span>
                </div>
              </div>
            )}
          </div>

          {(!sidebarCollapsed || mobileOpen) && (
            <div className="space-y-1.5 border-t border-zinc-900/60 pt-2 font-sans">
              <div className="flex justify-between items-center text-[10px] text-zinc-400">
                <span>Level {profile?.level || 1}</span>
                <span className="font-mono text-zinc-500">{profile?.xp || 0} / {(profile?.level || 1) * 100} XP</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-950">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((profile?.xp || 0) / ((profile?.level || 1) * 100)) * 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation list */}
        <nav className="space-y-1 pt-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const ItemIcon = item.Icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                  isActive 
                    ? "bg-indigo-950/20 border-l-2 border-indigo-500 text-white shadow shadow-indigo-500/5 font-bold" 
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/40"
                }`}
              >
                <ItemIcon className={`h-4.5 w-4.5 shrink-0 ${isActive ? item.color : "text-zinc-500"}`} />
                {(!sidebarCollapsed || mobileOpen) && (
                  <span className="font-sans">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin or signout footer */}
      <div className="p-4 border-t border-zinc-900">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900/40 rounded-lg text-xs font-medium cursor-pointer transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {(!sidebarCollapsed || mobileOpen) && <span className="font-sans">Purge Session</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop static layout bar */}
      <div className={`hidden md:block h-screen fixed top-0 left-0 transition-all duration-300 z-30 ${
        sidebarCollapsed ? "w-20" : "w-64"
      }`}>
        {sidebarContent}
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed top-0 left-0 h-full w-64 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// Beautiful Premium Dark Landing Page
function LandingView() {
  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      toast.success("Successfully authenticated with Google Auth! 🚀");
    } catch(err) {
      console.error(err);
      toast.error("Google popup authentication declined or failed.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-200 font-sans flex flex-col justify-between overflow-hidden relative selection:bg-indigo-500/30">
      
      {/* Top light effects blur gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-100px] left-[-100px] h-96 w-96 bg-cyan-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      {/* 1. Header Bar */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-zinc-900/60 z-10 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center shadow shadow-indigo-500/10">
            <BrainCircuit className="h-4.5 w-4.5 text-white animate-pulse" />
          </div>
          <span className="font-sans font-black text-sm tracking-widest text-white uppercase">NeuroList</span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 border border-zinc-900 rounded-full px-3 py-1 bg-zinc-950/40 backdrop-blur">
          <Shield className="h-3 w-3 text-indigo-400" />
          <span>AES-256 Cloud Secure</span>
        </div>
      </header>

      {/* 2. Hero Body Section */}
      <main className="px-6 flex-1 flex flex-col items-center justify-center text-center z-10 max-w-4xl mx-auto py-12 md:py-24 space-y-8">
        
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 text-xs font-semibold rounded-full animate-bounce">
            <Sparkles className="h-3 w-3 animate-spin animate-duration-3000" />
            Introducing Momentum OS
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-sans">
            The next-generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              AI-driven productivity engine
            </span>
          </h1>
          
          <p className="max-w-xl mx-auto text-zinc-400 text-sm sm:text-base leading-relaxed font-sans">
            Formulate focus register nodes, compile consistent streak multipliers, and let Gemini AI restructure your schedule workflows autonomously.
          </p>
        </div>

        {/* Sign In Trigger */}
        <div className="space-y-3">
          <button 
            onClick={handleGoogleSignIn}
            className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:shadow-lg hover:shadow-indigo-500/20 rounded-xl text-white text-sm font-semibold cursor-pointer active:scale-95 transition-all flex items-center gap-3.5 mx-auto"
          >
            <Fingerprint className="h-5 w-5 text-white" />
            Initialize with Google Identity
          </button>
          
          <p className="text-[10px] text-zinc-500 font-mono">
            No password schemas required. Authenticated safely via Google OAuth popup channels.
          </p>
        </div>

        {/* Feature widgets showcasing premium design */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 text-left max-w-3xl w-full">
          <div className="bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-xl backdrop-blur relative overflow-hidden group">
            <Zap className="h-5 w-5 text-amber-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1.5">Synaptic gamification</h4>
            <p className="text-xs text-zinc-400 leading-normal">Earn XP for completing milestones, level up, and unlock status badges to reinforce loyalty curves.</p>
          </div>
          
          <div className="bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-xl backdrop-blur relative overflow-hidden group">
            <BrainCircuit className="h-5 w-5 text-indigo-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1.5">Gemini partitioning</h4>
            <p className="text-xs text-zinc-400 leading-normal">Instantly break complicated goals down into structured actionable checklist items with Gemini LLMs.</p>
          </div>

          <div className="bg-zinc-950/40 border border-zinc-900/80 p-5 rounded-xl backdrop-blur relative overflow-hidden group">
            <Clock className="h-5 w-5 text-cyan-400 mb-3" />
            <h4 className="text-sm font-semibold text-white mb-1.5">Binaural oscillations</h4>
            <p className="text-xs text-zinc-400 leading-normal">Enter state zero on command utilizing real low-frequency binaural wave generators built directly inside tabs.</p>
          </div>
        </div>

      </main>

      {/* 3. Footer Bar */}
      <footer className="border-t border-zinc-950 bg-black py-6 px-6 text-center select-none z-10 w-full max-w-7xl mx-auto">
        <p className="text-[10px] font-mono text-zinc-650 text-zinc-600">
          © 2026 NeuroList Momentum. Crafted under Zero-Trust compliance specifications. Licensed Apache-2.0.
        </p>
      </footer>

    </div>
  );
}

// Inner application main viewport routing switcher
function PanelSwitcher({ activeTab }: { activeTab: string }) {
  switch (activeTab) {
    case "dashboard":
      return <Dashboard />;
    case "tasks":
      return <Tasks />;
    case "calendar":
      return <CalendarView />;
    case "habits":
      return <Habits />;
    case "focus":
      return <FocusMode />;
    case "notes":
      return <Notes />;
    case "analytics":
      return <Analytics />;
    default:
      return <Dashboard />;
  }
}

function MainAppShell() {
  const { user, loading } = useAuth();
  
  // Navigation active switch state
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-sans space-y-4">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500/20 opacity-75" />
          <BrainCircuit className="h-8 w-8 text-indigo-400 animate-pulse" />
        </div>
        <div className="space-y-1 text-center select-none">
          <h4 className="text-white text-xs font-bold uppercase tracking-widest font-mono">Loading Synaptic Matrix</h4>
          <p className="text-[10px] text-zinc-600 font-mono">Syncing Firestore Real-time Streams...</p>
        </div>
      </div>
    );
  }

  // If user is logged out, render the magnificent premium landing page
  if (!user) {
    return <LandingView />;
  }

  return (
    <TaskProvider>
      <div className="min-h-screen bg-black text-zinc-200">
        
        {/* Navigation structure context */}
        <NavigationSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />

        {/* Layout content panel */}
        <div className={`transition-all duration-300 min-h-screen p-4 md:p-8 ${
          sidebarCollapsed ? "md:pl-28" : "md:pl-72"
        }`}>
          {/* Top header navigation bar for Mobile toggles */}
          <div className="md:hidden flex items-center justify-between py-3 mb-4 border-b border-zinc-900">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 border border-zinc-800 rounded-lg bg-zinc-950 text-white cursor-pointer"
            >
              <Menu className="h-4 w-4" />
            </button>
            <span className="font-sans font-black text-xs uppercase tracking-widest text-white">NeuroList</span>
            <div className="w-8 h-8" /> {/* visual padding end alignment placeholder */}
          </div>

          <main className="max-w-7xl mx-auto">
            <PanelSwitcher activeTab={activeTab} />
          </main>
        </div>

      </div>
    </TaskProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppShell />
      <Toaster theme="dark" position="top-right" closeButton richColors />
    </AuthProvider>
  );
}

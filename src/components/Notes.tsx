import React, { useState, useMemo } from "react";
import { useTasks } from "../context/TaskContext";
import { Note } from "../types";
import { 
  Plus, 
  Trash2, 
  BookOpen, 
  Sparkles, 
  Tag, 
  Search, 
  Edit3, 
  Eye, 
  Link as LinkIcon, 
  ArrowRight,
  BrainCircuit,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useTasks();

  const [search, setSearch] = useState("");
  
  // Note Form Editor States
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Create / Edit variables
  const [editorTitle, setEditorTitle] = useState("");
  const [editorContent, setEditorContent] = useState("");
  const [editorTags, setEditorTags] = useState("");

  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const matchQuery = n.title.toLowerCase().includes(search.toLowerCase()) || 
                          n.content.toLowerCase().includes(search.toLowerCase());
      return matchQuery;
    });
  }, [notes, search]);

  // Read currently active note details
  const activeNote = useMemo(() => {
    return notes.find(n => n.id === activeNoteId) || null;
  }, [notes, activeNoteId]);

  // Compute backlinks (notes that share at least one tag)
  const backlinks = useMemo(() => {
    if (!activeNote || !activeNote.tags) return [];
    return notes.filter((n) => {
      if (n.id === activeNote.id) return false;
      return n.tags.some(tag => activeNote.tags.includes(tag));
    });
  }, [notes, activeNote]);

  const handleCreateNewTrigger = () => {
    setEditorTitle("");
    setEditorContent("");
    setEditorTags("");
    setIsCreatingNew(true);
    setActiveNoteId(null);
    setIsEditing(true);
  };

  const handleSelectNote = (note: Note) => {
    setActiveNoteId(note.id);
    setEditorTitle(note.title);
    setEditorContent(note.content);
    setEditorTags(note.tags.join(", "));
    setIsCreatingNew(false);
    setIsEditing(false);
  };

  const handleSaveNote = async () => {
    if (!editorTitle.trim()) return;
    
    const parsedTags = editorTags
      .split(",")
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    if (isCreatingNew) {
      await addNote(editorTitle, editorContent, parsedTags);
      setIsCreatingNew(false);
      setIsEditing(false);
    } else if (activeNoteId) {
      await updateNote(activeNoteId, {
        title: editorTitle,
        content: editorContent,
        tags: parsedTags
      });
      setIsEditing(false);
    }
  };

  const handleDeleteTrigger = async (noteId: string) => {
    await deleteNote(noteId);
    if (activeNoteId === noteId) {
      setActiveNoteId(null);
      setIsEditing(false);
    }
  };

  // Simple Markdown Parser representation in-app to display formatted HTML preview
  const markdownPreview = (content: string) => {
    if (!content) return <p className="text-zinc-500 italic">No note context details initialized.</p>;
    
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="text-xl font-bold text-white mt-4 mb-2">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-lg font-bold text-white mt-3 mb-1.5">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("- ")) {
        return <li key={idx} className="text-sm text-zinc-300 list-disc ml-5 leading-relaxed">{line.replace("- ", "")}</li>;
      }
      if (line.startsWith("- [ ] ")) {
        return (
          <div key={idx} className="flex items-center gap-2 mt-1">
            <input type="checkbox" disabled className="h-3.5 w-3.5 rounded bg-zinc-900 border-zinc-700" />
            <span className="text-sm text-zinc-300">{line.replace("- [ ] ", "")}</span>
          </div>
        );
      }
      if (line.trim() === "") {
        return <div key={idx} className="h-3" />;
      }
      return <p key={idx} className="text-sm text-zinc-300 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      
      {/* 1. Notes left sidebar indexes */}
      <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4 space-y-4 flex flex-col max-h-[500px]">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-white flex items-center gap-1.5">
              <BrainCircuit className="h-4.5 w-4.5 text-indigo-400" />
              Notes Register
            </h3>
            <p className="text-xs text-zinc-400">Your visual brain index</p>
          </div>

          <button 
            onClick={handleCreateNewTrigger}
            className="p-1 px-2 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" /> New Note
          </button>
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            placeholder="Query brain files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-zinc-800 rounded-lg bg-zinc-90 The core text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* List of files */}
        <div className="flex-1 space-y-2 overflow-y-auto pr-1">
          {filteredNotes.map((note) => (
            <div 
              key={note.id}
              onClick={() => handleSelectNote(note)}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                activeNoteId === note.id
                  ? "bg-indigo-950/20 border-indigo-500/30"
                  : "bg-zinc-900/10 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-white truncate max-w-[120px]">{note.title}</h4>
                  <span className="font-mono text-[8px] text-zinc-500">{note.updatedAt.split("T")[0]}</span>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-1">{note.content || "Emply file context..."}</p>
                
                {/* tags micro indicators */}
                <div className="flex flex-wrap gap-1">
                  {note.tags.map((tag) => (
                    <span key={tag} className="text-[8px] font-mono text-zinc-500 bg-zinc-900 px-1 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {filteredNotes.length === 0 && (
            <div className="text-center py-12 text-zinc-650 text-xs text-zinc-500 italic">
              No notes indexed yet. Create one!
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Note Editing Frame & Preview (Two columns wide) */}
      <div className="md:col-span-2 rounded-xl border border-zinc-900 bg-zinc-950 p-5 space-y-4 flex flex-col min-h-[500px]">
        
        {/* Toggle Editor vs preview controls if a note is selected or creating */}
        {(activeNoteId || isCreatingNew) ? (
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* Toolbar row */}
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-400 animate-pulse" />
                <span className="text-sm font-semibold text-white">
                  {isCreatingNew ? "Initializing Note Node" : "Reviewing Brain File"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1.5 px-3 rounded text-xs font-semibold bg-zinc-900 border border-zinc-850 text-zinc-300 hover:text-white cursor-pointer hover:bg-zinc-800 transition-all flex items-center gap-1"
                >
                  {isEditing ? <Eye className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                  {isEditing ? "Read File" : "Modify File"}
                </button>

                <button
                  onClick={handleSaveNote}
                  className="p-1.5 px-3 rounded text-xs font-semibold bg-gradient-to-r from-indigo-500 to-cyan-500 text-white cursor-pointer shadow active:scale-95 transition-all"
                >
                  Save Sync
                </button>
              </div>
            </div>

            {/* Note creation input form (Editor panel active) */}
            {isEditing ? (
              <div className="flex-1 space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">File Header Title</label>
                    <input 
                      type="text"
                      placeholder="Title of connection..."
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-800 rounded bg-zinc-900 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Network Tags (Comma separated)</label>
                    <input 
                      type="text"
                      placeholder="e.g. database, api, setup..."
                      value={editorTags}
                      onChange={(e) => setEditorTags(e.target.value)}
                      className="w-full px-3 py-2 border border-zinc-800 rounded bg-zinc-905 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-1 flex flex-col">
                  <label className="text-[10px] uppercase font-mono tracking-widest text-zinc-500">Markdown Content Body</label>
                  <textarea 
                    placeholder="Type markdown syntax: # Header, ## Subtitle, - List item, - [ ] Checklist..."
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    className="flex-1 w-full p-3 border border-zinc-850 rounded bg-zinc-900 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono resize-none min-h-[220px]"
                  />
                </div>
              </div>
            ) : (
              // Read preview panel active
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual markdown preview */}
                <div className="lg:col-span-2 space-y-2 max-h-[340px] overflow-y-auto bg-zinc-900/25 p-4 border border-zinc-900 rounded-lg pr-1">
                  <h3 className="text-xl font-bold text-white border-b border-zinc-850 pb-2">{activeNote?.title}</h3>
                  <div className="space-y-1.5 pt-2">
                    {markdownPreview(editorContent)}
                  </div>
                </div>

                {/* Second-Brain backlinks relationships columns */}
                <div className="rounded-lg bg-zinc-900/10 p-3.5 border border-zinc-900 space-y-3 max-h-[340px] overflow-y-auto">
                  <div className="space-y-0.5 border-b border-zinc-900 pb-2">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BrainCircuit className="h-4 w-4 text-cyan-400" />
                      Visual Backlinks
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-sans">Notes tied in the same knowledge graph</p>
                  </div>

                  <div className="space-y-2">
                    {backlinks.map((link) => (
                      <div 
                        key={link.id}
                        onClick={() => handleSelectNote(link)}
                        className="p-2 bg-zinc-950 border border-zinc-900 rounded hover:border-zinc-800 cursor-pointer flex justify-between items-center text-xs text-zinc-200"
                      >
                        <span className="truncate max-w-[130px] font-semibold">{link.title}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                      </div>
                    ))}
                    {backlinks.length === 0 && (
                      <p className="text-[10px] text-zinc-500 italic text-center py-4 bg-zinc-950/20 border border-dashed border-zinc-900 rounded">
                        No relational backlinks tracked for this node.
                      </p>
                    )}
                  </div>

                  {/* Actions list */}
                  <div className="pt-2">
                    <button
                      onClick={() => activeNoteId && handleDeleteTrigger(activeNoteId)}
                      className="w-full py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-[10px] font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Purge Note File
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-2xl space-y-3">
            <BookOpen className="h-10 w-10 text-zinc-800 animate-pulse animate-duration-1000" />
            <h3 className="text-sm font-sans font-medium text-zinc-300">No active knowledge node loaded</h3>
            <p className="text-xs text-zinc-620 max-w-sm">
              Select an indexed brain file from the left panels or deploy a fresh markdown note node to populate connection triggers.
            </p>
            <button 
              onClick={handleCreateNewTrigger}
              className="py-1.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-semibold cursor-pointer shadow"
            >
              Initialize Note Node
            </button>
          </div>
        )}

      </div>

    </div>
  );
}

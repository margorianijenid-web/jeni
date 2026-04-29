/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Bell,
  Clock,
  LayoutGrid,
  List as ListIcon,
  ChevronDown
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Reminder, Category, Priority, CATEGORIES, PRIORITIES } from './types';
import { cn } from './lib/utils';

interface ReminderItemProps {
  reminder: Reminder;
  onToggle: () => void;
  onDelete: () => void;
  viewMode: 'grid' | 'list';
  key?: React.Key;
}

function ReminderItem({ 
  reminder, 
  onToggle, 
  onDelete,
  viewMode
}: ReminderItemProps): React.JSX.Element {
  const date = parseISO(reminder.dueDate);
  const isOverdue = isPast(date) && !isToday(date) && !reminder.completed;
  const isTdy = isToday(date);
  const isTmrw = isTomorrow(date);

  const priorityInfo = PRIORITIES.find(p => p.value === reminder.priority)!;

  // Bento category colors
  const categoryStyles: Record<Category, string> = {
    Work: 'bg-orange-50 border-orange-200 text-orange-700 ring-orange-100',
    Personal: 'bg-teal-50 border-teal-200 text-teal-700 ring-teal-100',
    Education: 'bg-indigo-50 border-indigo-200 text-indigo-700 ring-indigo-100',
    Health: 'bg-rose-50 border-rose-200 text-rose-700 ring-rose-100',
    Routine: 'bg-blue-50 border-blue-200 text-blue-700 ring-blue-100',
    Other: 'bg-slate-50 border-slate-200 text-slate-700 ring-slate-100'
  };

  const style = categoryStyles[reminder.category] || categoryStyles.Other;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        "group relative rounded-[24px] border-2 p-5 transition-all hover:shadow-bento-hover hover:-translate-y-1 active:translate-y-0 active:shadow-none",
        reminder.completed ? "bg-slate-100 border-slate-300 opacity-60 grayscale-[0.5]" : `${style.split(' ')[0]} ${style.split(' ')[1]}`,
        viewMode === 'list' ? "flex items-center gap-5" : "flex flex-col gap-4"
      )}
    >
      <button 
        onClick={onToggle}
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-xl border-4 flex items-center justify-center transition-all active:scale-90 shadow-sm",
          reminder.completed 
            ? "bg-slate-900 border-slate-900 text-white" 
            : "border-slate-900 bg-white"
        )}
      >
        {reminder.completed && <CheckCircle2 className="w-6 h-6" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className={cn(
            "text-lg font-black tracking-tight leading-none truncate",
            reminder.completed && "line-through text-slate-500"
          )}>
            {reminder.title}
          </h3>
          <span className={cn(
            "text-[9px] font-black px-2 py-1 rounded border-2 border-slate-900 uppercase tracking-widest",
            priorityInfo.color.includes('red') ? 'bg-rose-500 text-white' : priorityInfo.color.includes('yellow') ? 'bg-amber-400 text-slate-900' : 'bg-blue-500 text-white'
          )}>
            {priorityInfo.label}
          </span>
        </div>
        
        {reminder.description && (
          <p className={cn(
            "text-xs font-medium text-slate-600 line-clamp-2 mb-3",
            reminder.completed && "line-through opacity-50"
          )}>
            {reminder.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 text-[11px] font-black uppercase tracking-wider",
            isOverdue ? "text-rose-600" : isTdy ? "text-indigo-600" : "text-slate-500"
          )}>
            <Clock className="w-3 h-3 stroke-[3px]" />
            <span>
              {isTdy ? 'HARI INI' : isTmrw ? 'BESOK' : format(date, 'd MMM yyyy', { locale: id }).toUpperCase()}
              {' • '}
              {format(date, 'HH:mm')}
            </span>
          </div>

          <div className="bg-white/60 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-slate-900/10">
            {reminder.category}
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          if (confirm('Hapus agenda ini?')) onDelete();
        }}
        className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100 border border-transparent hover:border-rose-200"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </motion.div>
  );
}

function ReminderForm({ onSubmit }: { onSubmit: (val: Omit<Reminder, 'id' | 'createdAt' | 'completed' | 'notified'>) => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    priority: 'medium' as Priority,
    category: 'Work' as Category
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    
    onSubmit({
      title: formData.title,
      description: formData.description,
      dueDate: new Date(`${formData.date}T${formData.time}`).toISOString(),
      priority: formData.priority,
      category: formData.category
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Apa agendamu?</label>
          <input 
            autoFocus
            required
            type="text"
            placeholder="Ketik judul kegiatan..."
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-6 py-4 outline-none transition-all text-xl font-black placeholder:text-slate-200 focus:bg-white focus:shadow-bento-hover"
          />
        </div>

        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Catatan Tambahan</label>
          <textarea 
            placeholder="Detail atau instruksi..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-slate-50 border-4 border-slate-900 rounded-2xl px-6 py-4 outline-none transition-all text-sm min-h-[100px] resize-none placeholder:text-slate-200 focus:bg-white focus:shadow-bento-hover font-medium"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="relative">
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Kapan?</label>
            <div className="flex gap-2">
              <input 
                type="date"
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="flex-[2] bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 outline-none font-bold text-sm"
              />
              <input 
                type="time"
                value={formData.time}
                onChange={e => setFormData({ ...formData, time: e.target.value })}
                className="flex-[1] bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 outline-none font-bold text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Kategori</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full bg-slate-50 border-4 border-slate-900 rounded-xl px-4 py-3 outline-none font-black uppercase tracking-tighter text-xs appearance-none cursor-pointer"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Prioritas</label>
          <div className="flex gap-3">
            {[
              { val: 'low', label: 'Rendah', bg: 'bg-blue-400' },
              { val: 'medium', label: 'Sedang', bg: 'bg-amber-400' },
              { val: 'high', label: 'Tinggi', bg: 'bg-rose-500' }
            ].map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setFormData({ ...formData, priority: p.val as Priority })}
                className={cn(
                  "flex-1 py-3 text-xs font-black uppercase tracking-widest rounded-xl border-4 border-slate-900 transition-all",
                  formData.priority === p.val 
                    ? `${p.bg} text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] -translate-x-1 -translate-y-1`
                    : "bg-white text-slate-400 hover:bg-slate-50 active:translate-x-0 active:translate-y-0 active:shadow-none"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        type="submit"
        className="w-full bg-indigo-600 text-white py-5 rounded-[24px] font-black text-xl border-4 border-slate-900 shadow-bento hover:bg-indigo-700 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all uppercase tracking-tighter italic"
      >
        Simpan Agenda
      </button>
    </form>
  );
}

export default function App() {
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('si-pengingat-reminders');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeAlarm, setActiveAlarm] = useState<Reminder | null>(null);

  // Audio utility for Alarm
  const playAlarmSound = () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
    
    // Create a rhythmic pattern
    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    for (let i = 0; i < 5; i++) {
        gainNode.gain.linearRampToValueAtTime(0.5, now + i * 0.5);
        gainNode.gain.linearRampToValueAtTime(0, now + (i * 0.5) + 0.2);
    }

    oscillator.start(now);
    oscillator.stop(now + 2.5);
  };

  useEffect(() => {
    localStorage.setItem('si-pengingat-reminders', JSON.stringify(reminders));
  }, [reminders]);

  // Alarm Check Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const dueReminder = reminders.find(r => 
        !r.completed && 
        !r.notified && 
        isPast(parseISO(r.dueDate))
      );

      if (dueReminder && !activeAlarm) {
        setActiveAlarm(dueReminder);
        playAlarmSound();
        // Mark as notified so it doesn't trigger again immediately
        setReminders(prev => prev.map(r => r.id === dueReminder.id ? { ...r, notified: true } : r));
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [reminders, activeAlarm]);

  const addReminder = (newReminder: Omit<Reminder, 'id' | 'createdAt' | 'completed' | 'notified'>) => {
    const reminder: Reminder = {
      ...newReminder,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      completed: false,
      notified: false,
    };
    setReminders([reminder, ...reminders]);
    setIsAdding(false);
  };

  const toggleComplete = (id: string) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    if (activeAlarm?.id === id) setActiveAlarm(null);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter(r => r.id !== id));
    if (activeAlarm?.id === id) setActiveAlarm(null);
  };

  const dismissAlarm = () => {
    setActiveAlarm(null);
  };

  const completeAlarm = () => {
    if (activeAlarm) toggleComplete(activeAlarm.id);
    setActiveAlarm(null);
  };

  const filteredReminders = reminders.filter(r => {
    const title = r.title || '';
    const desc = r.description || '';
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || r.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || r.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  }).sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const stats = {
    total: reminders.length,
    completed: reminders.filter(r => r.completed).length,
    pending: reminders.filter(r => !r.completed).length,
    overdue: reminders.filter(r => !r.completed && isPast(parseISO(r.dueDate)) && !isToday(parseISO(r.dueDate))).length
  };

  const today = format(new Date(), 'EEEE, d MMMM yyyy', { locale: id });
  const dayName = format(new Date(), 'EEEE', { locale: id });
  const fullDate = format(new Date(), 'd MMMM yyyy', { locale: id });

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Top Bento Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Header Card */}
        <div className="md:col-span-8 flex flex-col justify-center bg-indigo-600 rounded-[32px] p-8 text-white border-4 border-slate-900 shadow-bento overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Bell className="w-32 h-32" />
          </div>
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <div className="w-8 h-8 bg-indigo-600 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter">SiPengingat</h1>
              <p className="text-indigo-200 text-sm font-bold uppercase tracking-[0.2em]">Manajemen Waktu & Fokus</p>
            </div>
            <div className="ml-auto text-right hidden sm:block">
              <p className="text-3xl font-black leading-none">{dayName}</p>
              <p className="text-indigo-200 font-mono text-sm">{fullDate}</p>
            </div>
          </div>
        </div>

        {/* Quick Action Card / Stats Summary */}
        <div className="md:col-span-4 flex flex-col gap-6">
          <div className="bento-card p-6 flex flex-col justify-center flex-1">
            <button 
              onClick={() => setIsAdding(true)}
              className="w-full h-full bg-yellow-400 hover:bg-yellow-300 bento-button px-6 py-4 flex items-center justify-center gap-3 transition-colors active:shadow-none"
            >
              <Plus className="w-6 h-6 stroke-[3px]" />
              <span className="text-xl font-black uppercase tracking-tight">Tambah Baru</span>
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-400 p-4 rounded-[24px] border-4 border-slate-900 shadow-bento">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-900/50 mb-1">Selesai</p>
              <p className="text-2xl font-black font-mono text-slate-900">{stats.completed}</p>
            </div>
            <div className="bg-rose-400 p-4 rounded-[24px] border-4 border-slate-900 shadow-bento">
              <p className="text-[10px] font-black uppercase tracking-widest text-rose-900/50 mb-1">Terlambat</p>
              <p className="text-2xl font-black font-mono text-slate-900">{stats.overdue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Statistics & Priority Scale */}
        <div className="md:col-span-4 space-y-6">
          <div className="bg-emerald-50 bento-card p-8 flex flex-col h-full">
            <h2 className="text-2xl font-black mb-6 tracking-tighter">Skala Prioritas</h2>
            <div className="space-y-6 flex-1">
              {[
                { label: 'Tinggi (Mendesak)', val: reminders.filter(r => r.priority === 'high').length, color: 'bg-red-500', total: stats.total },
                { label: 'Sedang (Penting)', val: reminders.filter(r => r.priority === 'medium').length, color: 'bg-amber-400', total: stats.total },
                { label: 'Rendah (Rutin)', val: reminders.filter(r => r.priority === 'low').length, color: 'bg-blue-400', total: stats.total }
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-black">{p.label}</span>
                    <span className="text-sm font-mono font-bold">{p.val.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="h-4 w-full bg-white rounded-full border-2 border-slate-900 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: p.total > 0 ? `${(p.val / p.total) * 100}%` : '0%' }}
                      className={cn("h-full", p.color)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-white rounded-2xl border-2 border-slate-900">
              <p className="text-xs italic text-slate-600 font-serif font-medium leading-tight">
                "Selesaikan yang mendesak, investasikan pada yang penting."
              </p>
            </div>
          </div>

          <div className="bento-card p-8 flex flex-col items-center justify-center text-center">
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
                {stats.total > 0 && (
                  <motion.circle 
                    cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="12" fill="transparent" 
                    strokeDasharray="339"
                    initial={{ strokeDashoffset: 339 }}
                    animate={{ strokeDashoffset: 339 - (339 * (stats.completed / stats.total)) }}
                    className="text-indigo-600" 
                  />
                )}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black">
                  {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                </span>
                <span className="text-[10px] font-black text-slate-400">SELESAI</span>
              </div>
            </div>
            <h3 className="mt-6 font-black text-sm uppercase tracking-wider">Progres Belajar</h3>
            <p className="text-xs text-slate-500 mt-1">Disiplin kunci kesuksesan</p>
          </div>
        </div>

        {/* Reminders List & Filtering */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {/* Controls Card */}
          <div className="bento-card p-6 flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari agenda atau catatan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-indigo-400 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto scrollbar-hide pb-1 md:pb-0">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-black uppercase tracking-tight outline-none focus:border-indigo-400 cursor-pointer"
              >
                <option value="All">Semua Kategori</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="flex bg-slate-100 p-1 rounded-xl border-2 border-slate-200">
                <button 
                  onClick={() => setViewMode('list')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400")}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-indigo-600" : "text-slate-400")}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Agenda Card */}
          <div className="bento-card p-8 flex-1 flex flex-col min-h-[500px]">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Agenda Tugas</h2>
              <div className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest italic animate-pulse">
                {filteredReminders.length} TUGAS AKTIF
              </div>
            </div>

            <div className={cn(
              "grid gap-4 flex-1 scrollbar-hide",
              viewMode === 'grid' ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
            )}>
              <AnimatePresence mode="popLayout" initial={false}>
                {filteredReminders.length > 0 ? (
                  filteredReminders.map((reminder) => (
                    <ReminderItem 
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={() => toggleComplete(reminder.id)}
                      onDelete={() => deleteReminder(reminder.id)}
                      viewMode={viewMode}
                    />
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full flex flex-col items-center justify-center py-20 text-center"
                  >
                    <div className="w-24 h-24 bg-slate-50 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center mb-6">
                      <Clock className="w-10 h-10 text-slate-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-800">Semua Terkendali!</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto font-medium">Belum ada tugas yang perlu diingatkan. Nikmati waktu luangmu atau buat rencana baru.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t-4 border-slate-100">
              <div className="h-3 w-full bg-slate-100 rounded-full border-2 border-slate-900 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: stats.total > 0 ? `${(stats.completed / (stats.total || 1)) * 100}%` : '0%' }}
                  className="h-full bg-indigo-600" 
                />
              </div>
              <p className="text-[10px] font-black text-slate-400 mt-3 uppercase tracking-widest">
                Progres Hari Ini: {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% Terdaftar
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-2xl bg-white border-4 border-slate-900 rounded-t-[40px] sm:rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-10"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-4xl font-black tracking-tighter italic">Buat Pengingat</h2>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Tentukan masa depanmu sekarang.</p>
                </div>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="w-12 h-12 rounded-full border-2 border-slate-900 hover:bg-slate-100 flex items-center justify-center group transition-colors"
                >
                  <ChevronDown className="w-7 h-7 text-slate-900 group-hover:scale-110 transition-transform" />
                </button>
              </div>

              <ReminderForm onSubmit={addReminder} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Alarm Alert */}
      <AnimatePresence>
        {activeAlarm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.8, y: 50, rotate: -5 }}
              animate={{ scale: 1, y: 0, rotate: 0 }}
              exit={{ scale: 0.8, y: 50, rotate: 5 }}
              className="relative w-full max-w-md bg-white border-4 border-slate-900 rounded-[40px] shadow-2xl p-10 text-center space-y-8"
            >
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-rose-500 rounded-full flex items-center justify-center border-4 border-slate-900 shadow-bento animate-bounce">
                  <Bell className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-2">Waktunya Tiba!</p>
                <h2 className="text-4xl font-black tracking-tighter leading-tight italic">{activeAlarm.title}</h2>
                {activeAlarm.description && (
                  <p className="text-slate-500 mt-4 text-sm font-medium leading-relaxed italic">"{activeAlarm.description}"</p>
                )}
              </div>

              <div className="flex flex-col gap-4 pt-4">
                <button 
                  onClick={completeAlarm}
                  className="w-full bg-emerald-400 text-slate-900 py-5 rounded-[24px] font-black text-xl border-4 border-slate-900 shadow-bento hover:bg-emerald-300 transition-all uppercase tracking-tighter"
                >
                  Selesaikan Tugas
                </button>
                <button 
                  onClick={dismissAlarm}
                  className="w-full bg-white text-slate-400 py-4 rounded-[24px] font-black text-sm border-2 border-slate-200 hover:text-slate-600 hover:border-slate-400 transition-all uppercase tracking-widest"
                >
                  Nanti Saja (Dismiss)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

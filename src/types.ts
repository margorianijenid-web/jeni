export type Priority = 'low' | 'medium' | 'high';
export type Category = 'Work' | 'Personal' | 'Education' | 'Health' | 'Routine' | 'Other';

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // ISO string
  priority: Priority;
  category: Category;
  completed: boolean;
  notified: boolean;
  createdAt: string;
}

export const CATEGORIES: Category[] = ['Work', 'Personal', 'Education', 'Health', 'Routine', 'Other'];
export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Rendah', color: 'bg-blue-400 text-slate-900 border-slate-900' },
  { value: 'medium', label: 'Sedang', color: 'bg-amber-400 text-slate-900 border-slate-900' },
  { value: 'high', label: 'Tinggi', color: 'bg-rose-500 text-white border-slate-900' },
];

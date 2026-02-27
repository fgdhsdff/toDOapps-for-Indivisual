import type { Task, Schedule } from '../types';
import { supabase } from './supabase';

// --- DB row types (snake_case) ---

interface TaskRow {
  id: number;
  name: string;
  created_at: string;
  deadline: string;
  priority: number;
  is_completed: boolean;
  completed_at: string | null;
}

interface ScheduleRow {
  id: number;
  name: string;
  start_at: string;
  end_at: string;
}

// --- Mapping helpers ---

function toTask(row: TaskRow): Task {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    deadline: row.deadline,
    priority: row.priority as Task['priority'],
    isCompleted: row.is_completed,
    completedAt: row.completed_at,
  };
}

function toSchedule(row: ScheduleRow): Schedule {
  return {
    id: row.id,
    name: row.name,
    startAt: row.start_at,
    endAt: row.end_at,
  };
}

// --- Tasks ---

export async function loadTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('id');
  if (error) throw error;
  return (data as TaskRow[]).map(toTask);
}

export async function addTask(
  input: Omit<Task, 'id'>,
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      name: input.name,
      created_at: input.createdAt,
      deadline: input.deadline,
      priority: input.priority,
      is_completed: input.isCompleted,
      completed_at: input.completedAt,
    })
    .select()
    .single();
  if (error) throw error;
  return toTask(data as TaskRow);
}

export async function updateTask(
  id: number,
  fields: Partial<Pick<Task, 'isCompleted' | 'completedAt'>>,
): Promise<void> {
  const row: Record<string, unknown> = {};
  if (fields.isCompleted !== undefined) row.is_completed = fields.isCompleted;
  if (fields.completedAt !== undefined) row.completed_at = fields.completedAt;

  const { error } = await supabase
    .from('tasks')
    .update(row)
    .eq('id', id);
  if (error) throw error;
}

// --- Schedules ---

export async function loadSchedules(): Promise<Schedule[]> {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .order('id');
  if (error) throw error;
  return (data as ScheduleRow[]).map(toSchedule);
}

export async function addSchedule(
  input: Omit<Schedule, 'id'>,
): Promise<Schedule> {
  const { data, error } = await supabase
    .from('schedules')
    .insert({
      name: input.name,
      start_at: input.startAt,
      end_at: input.endAt,
    })
    .select()
    .single();
  if (error) throw error;
  return toSchedule(data as ScheduleRow);
}

export async function deleteSchedule(id: number): Promise<void> {
  const { error } = await supabase
    .from('schedules')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

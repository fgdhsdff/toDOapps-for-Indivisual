import { useState, useEffect, useCallback } from 'react';
import type { Task, Schedule } from './types';
import {
  loadTasks,
  addTask,
  updateTask,
  loadSchedules,
  addSchedule,
  deleteSchedule,
} from './utils/storage';
import { getNowString } from './utils/date';
import { Header } from './components/Header';
import { TaskForm } from './components/TaskForm';
import { ScheduleForm } from './components/ScheduleForm';
import { GanttChart } from './components/GanttChart';
import { CompletionCalendar } from './components/CompletionCalendar';
import './App.css';

export type ViewMode = 'gantt' | 'calendar';
export type TimelineSpan = 1 | 3 | 5 | 7 | 14 | 21;

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('gantt');
  const [timelineSpan, setTimelineSpan] = useState<TimelineSpan>(14);

  useEffect(() => {
    (async () => {
      const [t, s] = await Promise.all([loadTasks(), loadSchedules()]);
      setTasks(t);
      setSchedules(s);
    })();
  }, []);

  const activeTasks = tasks
    .filter((t) => !t.isCompleted)
    .sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      if (a.deadline !== b.deadline) return a.deadline.localeCompare(b.deadline);
      return a.createdAt.localeCompare(b.createdAt);
    });

  const handleAddTask = useCallback(
    async (input: Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'completedAt'>) => {
      const created = await addTask({
        name: input.name,
        createdAt: getNowString(),
        deadline: input.deadline,
        priority: input.priority,
        isCompleted: false,
        completedAt: null,
      });
      setTasks((prev) => [...prev, created]);
      setShowTaskForm(false);
    },
    [],
  );

  const handleComplete = useCallback(
    async (id: number) => {
      const completedAt = getNowString();
      await updateTask(id, { isCompleted: true, completedAt });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, isCompleted: true, completedAt } : t,
        ),
      );
    },
    [],
  );

  const handleAddSchedule = useCallback(
    async (input: Omit<Schedule, 'id'>) => {
      const created = await addSchedule(input);
      setSchedules((prev) => [...prev, created]);
      setShowScheduleForm(false);
    },
    [],
  );

  const handleDeleteSchedule = useCallback(
    async (id: number) => {
      await deleteSchedule(id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    },
    [],
  );

  return (
    <div className="app">
      <Header
        onAddTaskClick={() => setShowTaskForm(true)}
        onAddScheduleClick={() => setShowScheduleForm(true)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        timelineSpan={timelineSpan}
        onTimelineSpanChange={setTimelineSpan}
      />
      {viewMode === 'gantt' ? (
        <GanttChart
          tasks={activeTasks}
          schedules={schedules}
          onComplete={handleComplete}
          onDeleteSchedule={handleDeleteSchedule}
          timelineSpan={timelineSpan}
        />
      ) : (
        <CompletionCalendar tasks={tasks} />
      )}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}
      {showScheduleForm && (
        <ScheduleForm
          onSubmit={handleAddSchedule}
          onCancel={() => setShowScheduleForm(false)}
        />
      )}
    </div>
  );
}

export default App;

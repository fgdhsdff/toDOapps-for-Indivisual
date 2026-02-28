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
      try {
        const [t, s] = await Promise.all([loadTasks(), loadSchedules()]);
        setTasks(t);
        setSchedules(s);
      } catch (e) {
        console.error('データ読み込みエラー:', e);
      }
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
      try {
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
      } catch (e) {
        console.error('タスク追加エラー:', e);
        alert('タスクの追加に失敗しました。コンソールを確認してください。');
      }
    },
    [],
  );

  const handleComplete = useCallback(
    async (id: number) => {
      try {
        const completedAt = getNowString();
        await updateTask(id, { isCompleted: true, completedAt });
        setTasks((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, isCompleted: true, completedAt } : t,
          ),
        );
      } catch (e) {
        console.error('タスク完了エラー:', e);
        alert('タスクの完了に失敗しました。コンソールを確認してください。');
      }
    },
    [],
  );

  const handleAddSchedule = useCallback(
    async (input: Omit<Schedule, 'id'>) => {
      try {
        const created = await addSchedule(input);
        setSchedules((prev) => [...prev, created]);
        setShowScheduleForm(false);
      } catch (e) {
        console.error('予定追加エラー:', e);
        alert('予定の追加に失敗しました。コンソールを確認してください。');
      }
    },
    [],
  );

  const handleDeleteSchedule = useCallback(
    async (id: number) => {
      try {
        await deleteSchedule(id);
        setSchedules((prev) => prev.filter((s) => s.id !== id));
      } catch (e) {
        console.error('予定削除エラー:', e);
        alert('予定の削除に失敗しました。コンソールを確認してください。');
      }
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

import { useEffect, useMemo, useState } from 'react';
import type { Task, Schedule } from '../types';
import {
  generateTimelineDates,
  generateTimelineHours,
  generateRecentHoursWindow,
  addDays,
  getTodayString,
  getDayOfWeekJa,
} from '../utils/date';
import { TimelineHeader } from './TimelineHeader';
import { ScheduleStrip } from './ScheduleStrip';
import { TaskRow } from './TaskRow';
import styles from './GanttChart.module.css';

interface GanttChartProps {
  tasks: Task[];
  schedules: Schedule[];
  onComplete: (id: number) => void;
  onDeleteSchedule: (id: number) => void;
  timelineSpan: number;
}

type DayViewMode = 'day4h' | 'recent6h';

export function GanttChart({ tasks, schedules, onComplete, onDeleteSchedule, timelineSpan }: GanttChartProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const [dayViewMode, setDayViewMode] = useState<DayViewMode>('day4h');
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    const syncNow = () => setNowTick(new Date().getTime());
    syncNow();
    const id = window.setInterval(syncNow, 30 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const isHourly = timelineSpan === 1;
  const isEmpty = tasks.length === 0 && schedules.length === 0;
  const now = useMemo(() => new Date(nowTick), [nowTick]);

  const dates = useMemo(() => {
    if (!isHourly) return generateTimelineDates(timelineSpan);
    if (dayViewMode === 'recent6h') return generateRecentHoursWindow(6, 30, now);
    return generateTimelineHours(dayOffset, 240);
  }, [isHourly, timelineSpan, dayViewMode, now, dayOffset]);

  const displayDate = isHourly ? addDays(getTodayString(), dayOffset) : '';
  const displayDow = isHourly ? getDayOfWeekJa(displayDate) : '';
  const isTodayView = dayOffset === 0;

  let navLabel = '';
  if (isHourly && dayViewMode === 'recent6h') {
    const start = new Date(dates[0]);
    const end = new Date(dates[dates.length - 1]);
    const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    navLabel = `${hhmm(start)} - ${hhmm(end)} (latest 6h)`;
  } else if (isHourly) {
    navLabel = `${displayDate.replace(/-/g, '/')} (${displayDow})`;
  }

  return (
    <div className={styles.wrapper}>
      {isHourly && (
        <div className={styles.dayNav}>
          {dayViewMode === 'day4h' && (
            <button className={styles.navButton} onClick={() => setDayOffset((d) => d - 1)} type="button">
              ← Prev
            </button>
          )}
          <span className={styles.navDate}>
            {navLabel}
            {dayViewMode === 'day4h' && isTodayView && <span className={styles.todayBadge}>TODAY</span>}
          </span>
          {dayViewMode === 'day4h' && (
            <button className={styles.navButton} onClick={() => setDayOffset((d) => d + 1)} type="button">
              Next →
            </button>
          )}
          <div className={styles.zoomSelector} aria-label="day view mode">
            <button
              type="button"
              className={`${styles.zoomButton} ${dayViewMode === 'day4h' ? styles.zoomButtonActive : ''}`}
              onClick={() => setDayViewMode('day4h')}
            >
              4h (day)
            </button>
            <button
              type="button"
              className={`${styles.zoomButton} ${dayViewMode === 'recent6h' ? styles.zoomButtonActive : ''}`}
              onClick={() => setDayViewMode('recent6h')}
            >
              latest 6h
            </button>
          </div>
        </div>
      )}
      {isEmpty ? (
        <div className={styles.emptyMessage}>
          No tasks yet. Add a task or schedule to get started.
        </div>
      ) : (
        <div className={styles.scrollArea}>
          <table className={styles.table}>
            <TimelineHeader dates={dates} slotMinutes={dayViewMode === 'recent6h' ? 30 : 240} nowTs={nowTick} />
            <tbody>
              {schedules.length > 0 && (
                <ScheduleStrip
                  schedules={schedules}
                  dates={dates}
                  slotMinutes={dayViewMode === 'recent6h' ? 30 : 240}
                  nowTs={nowTick}
                  onDelete={onDeleteSchedule}
                />
              )}
              {schedules.length > 0 && tasks.length > 0 && (
                <tr className={styles.separator}>
                  <td colSpan={dates.length + 1} />
                </tr>
              )}
              {tasks.map((task) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  dates={dates}
                  slotMinutes={dayViewMode === 'recent6h' ? 30 : 240}
                  nowTs={nowTick}
                  onComplete={onComplete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

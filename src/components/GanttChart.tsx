import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { Task, Schedule } from '../types';
import { generateTimelineDates, generateTimelineHours, addDays, getTodayString, getDayOfWeekJa } from '../utils/date';
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

function getDailySlotWidth(span: number): number {
  if (span <= 1) return 64;
  if (span <= 3) return 46;
  if (span <= 5) return 38;
  if (span <= 7) return 32;
  if (span <= 14) return 22;
  return 18;
}

export function GanttChart({ tasks, schedules, onComplete, onDeleteSchedule, timelineSpan }: GanttChartProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const [slotMinutes, setSlotMinutes] = useState<30 | 60 | 240>(60);

  const isHourly = timelineSpan === 1;
  const dates = isHourly ? generateTimelineHours(dayOffset, slotMinutes) : generateTimelineDates(timelineSpan);
  const isEmpty = tasks.length === 0 && schedules.length === 0;

  const displayDate = isHourly ? addDays(getTodayString(), dayOffset) : '';
  const displayDow = isHourly ? getDayOfWeekJa(displayDate) : '';
  const isTodayView = dayOffset === 0;

  // Keep scale meaningful: bin/span changes must change visual length.
  const slotWidth = isHourly ? 22 : getDailySlotWidth(timelineSpan);
  const tableStyle = { '--slot-width': `${slotWidth}px` } as CSSProperties;

  return (
    <div className={styles.wrapper}>
      {isHourly && (
        <div className={styles.dayNav}>
          <button className={styles.navButton} onClick={() => setDayOffset((d) => d - 1)} type="button">
            ← Prev
          </button>
          <span className={styles.navDate}>
            {displayDate.replace(/-/g, '/')} ({displayDow})
            {isTodayView && <span className={styles.todayBadge}>TODAY</span>}
          </span>
          <button className={styles.navButton} onClick={() => setDayOffset((d) => d + 1)} type="button">
            Next →
          </button>
          <div className={styles.zoomSelector} aria-label="time scale">
            <button
              type="button"
              className={`${styles.zoomButton} ${slotMinutes === 30 ? styles.zoomButtonActive : ''}`}
              onClick={() => setSlotMinutes(30)}
            >
              30m
            </button>
            <button
              type="button"
              className={`${styles.zoomButton} ${slotMinutes === 60 ? styles.zoomButtonActive : ''}`}
              onClick={() => setSlotMinutes(60)}
            >
              1h
            </button>
            <button
              type="button"
              className={`${styles.zoomButton} ${slotMinutes === 240 ? styles.zoomButtonActive : ''}`}
              onClick={() => setSlotMinutes(240)}
            >
              4h
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
          <table className={styles.table} style={tableStyle}>
            <TimelineHeader dates={dates} slotMinutes={slotMinutes} />
            <tbody>
              {schedules.length > 0 && (
                <ScheduleStrip
                  schedules={schedules}
                  dates={dates}
                  slotMinutes={slotMinutes}
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
                  slotMinutes={slotMinutes}
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

import { useState } from 'react';
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

export function GanttChart({ tasks, schedules, onComplete, onDeleteSchedule, timelineSpan }: GanttChartProps) {
  const [dayOffset, setDayOffset] = useState(0);
  const [slotMinutes, setSlotMinutes] = useState<30 | 60 | 240>(60);

  const isHourly = timelineSpan === 1;
  const dates = isHourly ? generateTimelineHours(dayOffset, slotMinutes) : generateTimelineDates(timelineSpan);
  const isEmpty = tasks.length === 0 && schedules.length === 0;

  const displayDate = isHourly ? addDays(getTodayString(), dayOffset) : '';
  const displayDow = isHourly ? getDayOfWeekJa(displayDate) : '';
  const isTodayView = dayOffset === 0;

  return (
    <div className={styles.wrapper}>
      {isHourly && (
        <div className={styles.dayNav}>
          <button className={styles.navButton} onClick={() => setDayOffset((d) => d - 1)} type="button">
            ← 前日
          </button>
          <span className={styles.navDate}>
            {displayDate.replace(/-/g, '/')}（{displayDow}）
            {isTodayView && <span className={styles.todayBadge}>TODAY</span>}
          </span>
          <button className={styles.navButton} onClick={() => setDayOffset((d) => d + 1)} type="button">
            翌日 →
          </button>
          <div className={styles.zoomSelector} aria-label="時間目盛り">
            <button
              type="button"
              className={`${styles.zoomButton} ${slotMinutes === 30 ? styles.zoomButtonActive : ''}`}
              onClick={() => setSlotMinutes(30)}
            >
              30分
            </button>
            <button
              type="button"
              className={`${styles.zoomButton} ${slotMinutes === 60 ? styles.zoomButtonActive : ''}`}
              onClick={() => setSlotMinutes(60)}
            >
              1時間
            </button>
            <button
              type="button"
              className={`${styles.zoomButton} ${slotMinutes === 240 ? styles.zoomButtonActive : ''}`}
              onClick={() => setSlotMinutes(240)}
            >
              4時間
            </button>
          </div>
        </div>
      )}
      {isEmpty ? (
        <div className={styles.emptyMessage}>
          タスクがありません。「タスク追加」か「予定追加」から追加してください。
        </div>
      ) : (
        <div className={styles.scrollArea}>
          <table className={styles.table}>
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

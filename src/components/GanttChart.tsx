import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setDayOffset(0);
  }, [timelineSpan]);

  const isHourly = timelineSpan === 1;
  const dates = isHourly ? generateTimelineHours(dayOffset) : generateTimelineDates(timelineSpan);
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
        </div>
      )}
      {isEmpty ? (
        <div className={styles.emptyMessage}>
          タスクがありません。「＋ タスク追加」ボタンからタスクを登録してください。
        </div>
      ) : (
        <div className={styles.scrollArea}>
          <table className={styles.table}>
            <TimelineHeader dates={dates} />
            <tbody>
              {schedules.length > 0 && (
                <ScheduleStrip
                  schedules={schedules}
                  dates={dates}
                  onDelete={onDeleteSchedule}
                />
              )}
              {schedules.length > 0 && tasks.length > 0 && (
                <tr className={styles.separator}>
                  <td colSpan={dates.length + 1} />
                </tr>
              )}
              {tasks.map((task) => (
                <TaskRow key={task.id} task={task} dates={dates} onComplete={onComplete} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

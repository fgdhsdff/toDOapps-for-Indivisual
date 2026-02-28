import type { Task } from '../types';
import { getTodayString, isDeadlineUrgent } from '../utils/date';
import { getPriorityColor } from '../utils/priority';
import styles from './GanttBar.module.css';

interface GanttBarProps {
  task: Task;
  dates: string[];
  slotMinutes?: number;
}

function toStart(value: string): Date {
  return value.includes('T') ? new Date(value) : new Date(`${value}T00:00`);
}

function toEnd(value: string): Date {
  return value.includes('T') ? new Date(value) : new Date(`${value}T23:59:59.999`);
}

function isInRangeHourly(slot: string, task: Task, slotMinutes: number): boolean {
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
  const taskStart = toStart(task.createdAt);
  const taskEnd = toEnd(task.deadline);
  return slotStart <= taskEnd && slotEnd > taskStart;
}

function isCurrentSlot(slot: string, slotMinutes: number): boolean {
  const now = new Date();
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
  return now >= slotStart && now < slotEnd;
}

function isInRangeDaily(slot: string, task: Task): boolean {
  const createdDate = task.createdAt.split('T')[0];
  const deadlineDate = task.deadline.split('T')[0];
  return slot >= createdDate && slot <= deadlineDate;
}

export function GanttBar({ task, dates, slotMinutes = 60 }: GanttBarProps) {
  const today = getTodayString();
  const isHourly = dates.length > 0 && dates[0].includes('T');
  const urgent = isDeadlineUrgent(task.deadline);
  const color = getPriorityColor(task.priority);

  return (
    <>
      {dates.map((slot) => {
        const inRange = isHourly
          ? isInRangeHourly(slot, task, slotMinutes)
          : isInRangeDaily(slot, task);

        const isCurrent = isHourly ? isCurrentSlot(slot, slotMinutes) : slot === today;

        return (
          <td key={slot} className={styles.cell}>
            {isCurrent && <div className={styles.todayMarker} />}
            {inRange && (
              <div
                className={`${styles.bar} ${urgent ? styles.barUrgent : ''}`}
                style={{ backgroundColor: color, color }}
              />
            )}
          </td>
        );
      })}
    </>
  );
}

import type { Task } from '../types';
import { getTodayString, extractDateOnly, isDeadlineUrgent } from '../utils/date';
import { getPriorityColor } from '../utils/priority';
import styles from './GanttBar.module.css';

interface GanttBarProps {
  task: Task;
  dates: string[];
}

function isInRangeHourly(slot: string, task: Task): boolean {
  const slotDate = extractDateOnly(slot);
  const createdDate = extractDateOnly(task.createdAt);
  const deadlineDate = extractDateOnly(task.deadline);

  if (createdDate > slotDate || deadlineDate < slotDate) return false;

  // 作成日がこの日 → 作成時刻の時間帯以降のみ
  if (createdDate === slotDate && task.createdAt.includes('T')) {
    const createdHour = task.createdAt.substring(0, 13);
    const slotHour = slot.substring(0, 13);
    if (slotHour < createdHour) return false;
  }

  // 締切がこの日より後 → 残り全時間帯
  if (deadlineDate > slotDate) return true;

  // 締切がこの日で時刻指定あり → その時間まで
  if (task.deadline.includes('T')) {
    const deadlineHour = task.deadline.substring(0, 13);
    const slotHour = slot.substring(0, 13);
    return slotHour <= deadlineHour;
  }

  // 締切がこの日で時刻なし → 終日
  return true;
}

function isInRangeDaily(slot: string, task: Task): boolean {
  const createdDate = extractDateOnly(task.createdAt);
  const deadlineDate = extractDateOnly(task.deadline);
  return slot >= createdDate && slot <= deadlineDate;
}

export function GanttBar({ task, dates }: GanttBarProps) {
  const today = getTodayString();
  const isHourly = dates.length > 0 && dates[0].includes('T');
  const urgent = isDeadlineUrgent(task.deadline);
  const color = getPriorityColor(task.priority);

  return (
    <>
      {dates.map((slot) => {
        const inRange = isHourly
          ? isInRangeHourly(slot, task)
          : isInRangeDaily(slot, task);

        const isCurrent = isHourly
          ? extractDateOnly(slot) === today && new Date(slot).getHours() === new Date().getHours()
          : slot === today;

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

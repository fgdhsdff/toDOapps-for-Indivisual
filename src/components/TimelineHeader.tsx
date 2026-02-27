import { formatShortDate, getTodayString, extractDateOnly } from '../utils/date';
import styles from './TimelineHeader.module.css';

interface TimelineHeaderProps {
  dates: string[];
}

function formatSlotLabel(slot: string): string {
  if (slot.includes('T')) {
    const hour = new Date(slot).getHours();
    return `${hour}:00`;
  }
  return formatShortDate(slot);
}

function isCurrentSlot(slot: string): boolean {
  const today = getTodayString();
  if (slot.includes('T')) {
    // hourly: 今日の現在時刻のスロットのみ
    return extractDateOnly(slot) === today && new Date(slot).getHours() === new Date().getHours();
  }
  return slot === today;
}

export function TimelineHeader({ dates }: TimelineHeaderProps) {
  return (
    <thead>
      <tr className={styles.headerRow}>
        <th className={styles.taskInfoHeader}>タスク</th>
        {dates.map((slot) => (
          <th
            key={slot}
            className={`${styles.dateCell} ${isCurrentSlot(slot) ? styles.today : ''}`}
          >
            {formatSlotLabel(slot)}
          </th>
        ))}
      </tr>
    </thead>
  );
}

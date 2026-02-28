import { formatShortDate } from '../utils/date';
import styles from './TimelineHeader.module.css';

interface TimelineHeaderProps {
  dates: string[];
  slotMinutes?: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatSlotLabel(slot: string, slotMinutes: number): string {
  if (slot.includes('T')) {
    const d = new Date(slot);
    const h = d.getHours();
    const m = d.getMinutes();
    if (slotMinutes === 30) return `${pad(h)}:${pad(m)}`;
    return `${h}:00`;
  }
  return formatShortDate(slot);
}

function getLabelStep(slotMinutes: number, slotCount: number, isHourly: boolean): number {
  if (!isHourly) {
    return slotCount > 14 ? 2 : 1;
  }
  if (slotMinutes === 30) return 4; // every 2 hours
  if (slotMinutes === 60) return 2; // every 2 hours
  return 1; // 4h bins
}

function isCurrentSlot(slot: string, slotMinutes: number): boolean {
  if (!slot.includes('T')) return slot === new Date().toISOString().split('T')[0];
  const now = new Date();
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
  return now >= slotStart && now < slotEnd;
}

export function TimelineHeader({ dates, slotMinutes = 60 }: TimelineHeaderProps) {
  const isHourly = dates.length > 0 && dates[0].includes('T');
  const labelStep = getLabelStep(slotMinutes, dates.length, isHourly);

  return (
    <thead>
      <tr className={styles.headerRow}>
        <th className={styles.taskInfoHeader}>Task</th>
        {dates.map((slot, index) => (
          <th
            key={slot}
            className={`${styles.dateCell} ${isCurrentSlot(slot, slotMinutes) ? styles.today : ''}`}
          >
            {index % labelStep === 0 ? formatSlotLabel(slot, slotMinutes) : ''}
          </th>
        ))}
      </tr>
    </thead>
  );
}

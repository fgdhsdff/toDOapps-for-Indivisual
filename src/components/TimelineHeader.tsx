import styles from './TimelineHeader.module.css';

interface TimelineHeaderProps {
  dates: string[];
  slotMinutes?: number;
  nowTs: number;
}

type HeaderGroup = {
  label: string;
  colSpan: number;
};

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function isCurrentSlot(slot: string, slotMinutes: number, nowTs: number): boolean {
  if (!slot.includes('T')) {
    const now = new Date(nowTs);
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    return slot === today;
  }
  const now = new Date(nowTs);
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
  return now >= slotStart && now < slotEnd;
}

function buildHourlyGroups(slots: string[]): HeaderGroup[] {
  const groups: HeaderGroup[] = [];
  for (const slot of slots) {
    const hour = new Date(slot).getHours();
    const label = `${hour}`;
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.colSpan += 1;
    } else {
      groups.push({ label, colSpan: 1 });
    }
  }
  return groups;
}

function buildDailyGroups(slots: string[]): HeaderGroup[] {
  const groups: HeaderGroup[] = [];
  for (const slot of slots) {
    const month = new Date(slot).getMonth() + 1;
    const label = `${month}`;
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.colSpan += 1;
    } else {
      groups.push({ label, colSpan: 1 });
    }
  }
  return groups;
}

function getBottomLabel(slot: string, isHourly: boolean): string {
  const d = new Date(slot);
  if (isHourly) return pad(d.getMinutes());
  return String(d.getDate());
}

function getTopSuffix(isHourly: boolean): string {
  return isHourly ? '時' : '月';
}

export function TimelineHeader({ dates, slotMinutes = 60, nowTs }: TimelineHeaderProps) {
  const isHourly = dates.length > 0 && dates[0].includes('T');
  const groups = isHourly ? buildHourlyGroups(dates) : buildDailyGroups(dates);
  const topSuffix = getTopSuffix(isHourly);

  return (
    <thead>
      <tr>
        <th className={styles.taskInfoHeader} rowSpan={2}>Task</th>
        {groups.map((group, index) => (
          <th key={`${group.label}-${index}`} colSpan={group.colSpan} className={styles.topCell}>
            {group.label}{topSuffix}
          </th>
        ))}
      </tr>
      <tr>
        {dates.map((slot) => (
          <th
            key={slot}
            className={`${styles.bottomCell} ${isCurrentSlot(slot, slotMinutes, nowTs) ? styles.current : ''}`}
          >
            {getBottomLabel(slot, isHourly)}
          </th>
        ))}
      </tr>
    </thead>
  );
}

import type { Schedule } from '../types';
import { getTodayString } from '../utils/date';
import styles from './ScheduleStrip.module.css';

const BAR_HEIGHT = 22;
const BAR_GAP = 3;

interface ScheduleStripProps {
  schedules: Schedule[];
  dates: string[];
  slotMinutes?: number;
  nowTs: number;
  onDelete: (id: number) => void;
}

function isActiveHourly(slot: string, s: Schedule, slotMinutes: number): boolean {
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
  const scheduleStart = new Date(s.startAt);
  const scheduleEnd = new Date(s.endAt);
  return slotStart <= scheduleEnd && slotEnd > scheduleStart;
}

function isCurrentSlot(slot: string, slotMinutes: number, nowTs: number): boolean {
  const now = new Date(nowTs);
  const slotStart = new Date(slot);
  const slotEnd = new Date(slotStart.getTime() + slotMinutes * 60 * 1000);
  return now >= slotStart && now < slotEnd;
}

function isActiveDaily(slot: string, s: Schedule): boolean {
  return slot >= s.startAt.split('T')[0] && slot <= s.endAt.split('T')[0];
}

function assignLanes(schedules: Schedule[]): Map<number, number> {
  const sorted = [...schedules].sort((a, b) => a.startAt.localeCompare(b.startAt));
  const lanes = new Map<number, number>();
  const laneEnds: string[] = [];

  for (const s of sorted) {
    let placed = false;
    for (let lane = 0; lane < laneEnds.length; lane++) {
      if (s.startAt >= laneEnds[lane]) {
        lanes.set(s.id, lane);
        laneEnds[lane] = s.endAt;
        placed = true;
        break;
      }
    }
    if (!placed) {
      lanes.set(s.id, laneEnds.length);
      laneEnds.push(s.endAt);
    }
  }

  return lanes;
}

export function ScheduleStrip({ schedules, dates, slotMinutes = 60, nowTs, onDelete }: ScheduleStripProps) {
  const today = getTodayString();
  const isHourly = dates.length > 0 && dates[0].includes('T');

  const laneMap = assignLanes(schedules);
  const laneCount = schedules.length > 0
    ? Math.max(...Array.from(laneMap.values())) + 1
    : 1;
  const totalHeight = laneCount * BAR_HEIGHT + Math.max(0, laneCount - 1) * BAR_GAP;

  const activePerSlot = dates.map((slot) =>
    schedules.filter((s) => (isHourly ? isActiveHourly(slot, s, slotMinutes) : isActiveDaily(slot, s))),
  );

  return (
    <tr className={styles.row}>
      <td className={styles.infoCell}>
        <span className={styles.badge}>Schedule</span>
      </td>
      {dates.map((slot, i) => {
        const active = activePerSlot[i];
        const isCurrent = isHourly ? isCurrentSlot(slot, slotMinutes, nowTs) : slot === today;

        return (
          <td key={slot} className={styles.cell}>
            {isCurrent && <div className={styles.nowMarker} />}
            <div className={styles.laneContainer} style={{ height: totalHeight }}>
              {active.map((s) => {
                const lane = laneMap.get(s.id) ?? 0;
                const top = lane * (BAR_HEIGHT + BAR_GAP);
                const isFirst = i === 0 || !activePerSlot[i - 1].some((a) => a.id === s.id);

                return (
                  <div
                    key={s.id}
                    className={styles.bar}
                    style={{ top, height: BAR_HEIGHT }}
                    title={s.name}
                  >
                    {isFirst && <span className={styles.barLabel}>{s.name}</span>}
                    {isFirst && (
                      <button
                        className={styles.deleteBtn}
                        onClick={() => onDelete(s.id)}
                        type="button"
                        title="Delete"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

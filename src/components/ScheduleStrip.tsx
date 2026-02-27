import type { Schedule } from '../types';
import { getTodayString, extractDateOnly } from '../utils/date';
import styles from './ScheduleStrip.module.css';

const BAR_HEIGHT = 22;
const BAR_GAP = 3;

interface ScheduleStripProps {
  schedules: Schedule[];
  dates: string[];
  onDelete: (id: number) => void;
}

// ---- レンジ判定 ----

function isActiveHourly(slot: string, s: Schedule): boolean {
  const slotDate = extractDateOnly(slot);
  const startDate = extractDateOnly(s.startAt);
  const endDate = extractDateOnly(s.endAt);

  if (startDate > slotDate || endDate < slotDate) return false;

  if (startDate === slotDate) {
    if (slot.substring(0, 13) < s.startAt.substring(0, 13)) return false;
  }

  if (endDate > slotDate) return true;

  return slot.substring(0, 13) <= s.endAt.substring(0, 13);
}

function isActiveDaily(slot: string, s: Schedule): boolean {
  return slot >= extractDateOnly(s.startAt) && slot <= extractDateOnly(s.endAt);
}

// ---- レーン割り当て（重ならない予定は同じレーンを共有） ----

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

export function ScheduleStrip({ schedules, dates, onDelete }: ScheduleStripProps) {
  const today = getTodayString();
  const isHourly = dates.length > 0 && dates[0].includes('T');

  const laneMap = assignLanes(schedules);
  const laneCount = schedules.length > 0
    ? Math.max(...Array.from(laneMap.values())) + 1
    : 1;
  const totalHeight = laneCount * BAR_HEIGHT + Math.max(0, laneCount - 1) * BAR_GAP;

  const activePerSlot = dates.map((slot) =>
    schedules.filter((s) => (isHourly ? isActiveHourly(slot, s) : isActiveDaily(slot, s))),
  );

  return (
    <tr className={styles.row}>
      <td className={styles.infoCell}>
        <span className={styles.badge}>予定</span>
      </td>
      {dates.map((slot, i) => {
        const active = activePerSlot[i];
        const isCurrent = isHourly
          ? extractDateOnly(slot) === today && new Date(slot).getHours() === new Date().getHours()
          : slot === today;

        return (
          <td key={slot} className={styles.cell}>
            {isCurrent && <div className={styles.nowMarker} />}
            <div className={styles.laneContainer} style={{ height: totalHeight }}>
              {active.map((s) => {
                const lane = laneMap.get(s.id) ?? 0;
                const top = lane * (BAR_HEIGHT + BAR_GAP);
                // 表示範囲内で最初のセルならラベルを出す
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
                        title="削除"
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

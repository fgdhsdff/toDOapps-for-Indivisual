import { useState } from 'react';
import type { Task } from '../types';
import { generateMonthCalendarDates, getTodayString, extractDateOnly } from '../utils/date';
import { CalendarDayCell } from './CalendarDayCell';
import styles from './CompletionCalendar.module.css';

interface CompletionCalendarProps {
  tasks: Task[];
}

const DOW_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

export function CompletionCalendar({ tasks }: CompletionCalendarProps) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const today = getTodayString();
  const dates = generateMonthCalendarDates(year, month);

  // 完了タスクを日付ごとにグルーピング
  const completedByDate = new Map<string, Task[]>();
  for (const date of dates) {
    completedByDate.set(date, []);
  }
  for (const task of tasks) {
    if (task.completedAt) {
      const dateKey = extractDateOnly(task.completedAt);
      const list = completedByDate.get(dateKey);
      if (list) {
        list.push(task);
      }
    }
  }

  const goToPrevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else { setMonth((m) => m - 1); }
  };

  const goToNextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else { setMonth((m) => m + 1); }
  };

  const goToToday = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <button className={styles.navButton} onClick={goToPrevMonth} type="button">
          ← 前月
        </button>
        <span className={styles.navTitle}>
          {year}年 {month}月
          {year === now.getFullYear() && month === now.getMonth() + 1 && (
            <span className={styles.todayBadge}>TODAY</span>
          )}
        </span>
        <button className={styles.navButton} onClick={goToNextMonth} type="button">
          翌月 →
        </button>
        <button className={styles.todayButton} onClick={goToToday} type="button">
          今月
        </button>
      </div>

      <div className={styles.dowRow}>
        {DOW_LABELS.map((d, i) => (
          <div
            key={d}
            className={`${styles.dowCell} ${i === 0 ? styles.sunday : ''} ${i === 6 ? styles.saturday : ''}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {dates.map((date) => (
          <CalendarDayCell
            key={date}
            date={date}
            tasks={completedByDate.get(date) ?? []}
            isToday={date === today}
            isOutsideMonth={!date.startsWith(`${year}-${String(month).padStart(2, '0')}`)}
          />
        ))}
      </div>
    </div>
  );
}

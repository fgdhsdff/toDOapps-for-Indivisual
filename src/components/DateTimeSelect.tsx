import { useMemo } from 'react';
import styles from './DateTimeSelect.module.css';

interface DateTimeSelectProps {
  value: string; // "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  /** アクセントカラー用クラス（省略時はデフォルト） */
  accentClass?: string;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function parse(value: string) {
  const d = value ? new Date(value) : new Date();
  return {
    year: d.getFullYear(),
    month: d.getMonth() + 1,
    day: d.getDate(),
    hour: d.getHours(),
    minute: d.getMinutes(),
  };
}

function build(y: number, m: number, d: number, h: number, min: number): string {
  const maxDay = daysInMonth(y, m);
  const safeDay = Math.min(d, maxDay);
  return `${y}-${pad(m)}-${pad(safeDay)}T${pad(h)}:${pad(min)}`;
}

export function DateTimeSelect({ value, onChange, accentClass }: DateTimeSelectProps) {
  const { year, month, day, hour, minute } = parse(value);

  const now = new Date();
  const currentYear = now.getFullYear();
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = currentYear; y <= currentYear + 2; y++) list.push(y);
    return list;
  }, [currentYear]);

  const maxDay = daysInMonth(year, month);

  const selectClass = `${styles.select} ${accentClass ?? ''}`;

  return (
    <div className={styles.container}>
      <select
        className={selectClass}
        value={year}
        onChange={(e) => onChange(build(Number(e.target.value), month, day, hour, minute))}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}年</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={month}
        onChange={(e) => onChange(build(year, Number(e.target.value), day, hour, minute))}
      >
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <option key={m} value={m}>{m}月</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={Math.min(day, maxDay)}
        onChange={(e) => onChange(build(year, month, Number(e.target.value), hour, minute))}
      >
        {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}日</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={hour}
        onChange={(e) => onChange(build(year, month, day, Number(e.target.value), minute))}
      >
        {Array.from({ length: 24 }, (_, i) => i).map((h) => (
          <option key={h} value={h}>{pad(h)}時</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={minute}
        onChange={(e) => onChange(build(year, month, day, hour, Number(e.target.value)))}
      >
        {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
          <option key={m} value={m}>{pad(m)}分</option>
        ))}
      </select>
    </div>
  );
}

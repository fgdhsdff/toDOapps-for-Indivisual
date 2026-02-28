/** 今日の日付を "YYYY-MM-DD" 形式で返す */
export function getTodayString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** 現在の日時をローカル "YYYY-MM-DDTHH:mm" 形式で返す */
export function getNowString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 日時文字列から日付部分 "YYYY-MM-DD" のみ抽出する */
export function extractDateOnly(dateStr: string): string {
  return dateStr.split('T')[0];
}

/** 2つの日付文字列の差分（日数）を返す */
export function diffDays(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  return Math.round((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

/** 指定日から n 日後の日付文字列を返す */
export function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + n);
  return d.toISOString().split('T')[0];
}

/** 日付文字列を "M/D" 形式に変換 */
export function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

/** 締切日時を "M/D HH:mm" 形式でフォーマット（時刻がある場合） */
export function formatDeadlineWithTime(dateStr: string): string {
  const d = new Date(dateStr);
  const md = `${d.getMonth() + 1}/${d.getDate()}`;
  if (dateStr.includes('T')) {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${md} ${hh}:${mm}`;
  }
  return md;
}

/** 締切が緊急かどうかを24時間ベースで判定する */
export function isDeadlineUrgent(deadline: string): boolean {
  const now = new Date();
  const dl = new Date(deadline);
  const diffMs = dl.getTime() - now.getTime();
  return diffMs <= 24 * 60 * 60 * 1000; // 24時間以内 or 期限切れ
}

/** タイムラインの日付配列を生成（過去:未来 = 3:7 の比率） */
export function generateTimelineDates(totalDays: number = 14): string[] {
  const today = getTodayString();
  const pastDays = Math.floor(totalDays * 0.3);
  const futureDays = totalDays - pastDays - 1; // -1 は今日の分
  const dates: string[] = [];
  for (let i = -pastDays; i <= futureDays; i++) {
    dates.push(addDays(today, i));
  }
  return dates;
}

/** 指定日の時間スロット配列を生成（"YYYY-MM-DDTHH:00" 形式、24個） */
export function generateTimelineHours(dayOffset: number = 0, stepMinutes: number = 60): string[] {
  const baseDate = addDays(getTodayString(), dayOffset);
  const slots: string[] = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += stepMinutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    slots.push(`${baseDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
  }
  return slots;
}

/** 直近 n 時間のスロット配列を生成（古い→新しい順） */
export function generateRecentHoursWindow(totalHours: number = 6, stepMinutes: number = 30, now: Date = new Date()): string[] {
  const slots: string[] = [];
  const stepMs = stepMinutes * 60 * 1000;
  const nowMs = now.getTime();
  const flooredNowMs = Math.floor(nowMs / stepMs) * stepMs;
  const count = Math.floor((totalHours * 60) / stepMinutes);
  for (let i = count - 1; i >= 0; i--) {
    const t = new Date(flooredNowMs - i * stepMs);
    const y = t.getFullYear();
    const m = String(t.getMonth() + 1).padStart(2, '0');
    const d = String(t.getDate()).padStart(2, '0');
    const h = String(t.getHours()).padStart(2, '0');
    const mm = String(t.getMinutes()).padStart(2, '0');
    slots.push(`${y}-${m}-${d}T${h}:${mm}`);
  }
  return slots;
}

/** 指定月のカレンダー日付配列を生成（日曜始まり、前後の月の日付で埋める） */
export function generateMonthCalendarDates(year: number, month: number): string[] {
  const pad = (n: number) => String(n).padStart(2, '0');
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const startOffset = firstDay.getDay(); // 日曜=0
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const dates: string[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = new Date(year, month - 1, 1 - startOffset + i);
    dates.push(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  }
  return dates;
}

/** 日付文字列から日本語の曜日を返す */
export function getDayOfWeekJa(dateStr: string): string {
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const d = new Date(dateStr);
  return days[d.getDay()];
}

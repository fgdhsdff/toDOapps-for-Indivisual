const JST_OFFSET_MINUTES = 9 * 60;

type DateSpec =
  | { kind: 'today' }
  | { kind: 'tomorrow' }
  | { kind: 'weekday'; weekday: number }
  | { kind: 'day_of_month'; day: number }
  | { kind: 'day_of_month_weekday'; day: number; weekday: number };

interface TimeSpec {
  hour: number;
  minute: number;
}

export interface ParsedNaturalTask {
  taskName: string;
  deadline: string; // JST "YYYY-MM-DDTHH:mm"
  preview: string; // "YYYY-MM-DD HH:mm (JST)"
}

export interface ParseNaturalTaskError {
  message: string;
}

export function parseNaturalTaskInput(
  rawInput: string,
  now: Date = new Date(),
):
  | { ok: true; value: ParsedNaturalTask }
  | { ok: false; error: ParseNaturalTaskError } {
  const normalized = normalizeInput(rawInput);
  if (!normalized) {
    return { ok: false, error: { message: '入力が空です。' } };
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  if (tokens.length < 2) {
    return { ok: false, error: { message: '「期限 タスク名」の形式で入力してください。' } };
  }

  const parsed = parseLeadingTokens(tokens);
  if (!parsed) {
    return { ok: false, error: { message: '期限の解釈に失敗しました。例: 明日23 レポート提出' } };
  }

  const taskName = tokens.slice(parsed.consumed).join(' ').trim();
  if (!taskName) {
    return { ok: false, error: { message: 'タスク名を入力してください。' } };
  }

  const nowJst = getJstParts(now);
  const deadline = resolveDeadline(parsed.dateSpec, parsed.timeSpec, nowJst);
  const deadlineString = formatJst(deadline.year, deadline.month, deadline.day, deadline.hour, deadline.minute);

  return {
    ok: true,
    value: {
      taskName,
      deadline: deadlineString,
      preview: `${deadlineString.replace('T', ' ')} (JST)`,
    },
  };
}

function normalizeInput(input: string): string {
  return input
    .replace(/\u3000/g, ' ')
    .replace(/[：]/g, ':')
    .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
    .trim();
}

function parseLeadingTokens(tokens: string[]): { dateSpec?: DateSpec; timeSpec?: TimeSpec; consumed: number } | null {
  const t1 = tokens[0];
  const t2 = tokens[1];

  const date1 = parseDateToken(t1);
  if (date1) {
    const time2 = t2 ? parseTimeToken(t2) : null;
    return {
      dateSpec: date1,
      timeSpec: time2 ?? undefined,
      consumed: time2 ? 2 : 1,
    };
  }

  const day1 = parseDayNumberToken(t1);
  const weekday2 = t2 ? parseWeekdayToken(t2) : null;
  if (day1 !== null && weekday2 !== null) {
    return {
      dateSpec: { kind: 'day_of_month_weekday', day: day1, weekday: weekday2 },
      consumed: 2,
    };
  }

  const time1 = parseTimeToken(t1);
  if (time1) {
    return { timeSpec: time1, consumed: 1 };
  }

  if (day1 !== null && t2) {
    const time2 = parseTimeToken(t2);
    if (time2) {
      return {
        dateSpec: { kind: 'day_of_month', day: day1 },
        timeSpec: time2,
        consumed: 2,
      };
    }
  }

  if (day1 !== null) {
    return {
      dateSpec: { kind: 'day_of_month', day: day1 },
      consumed: 1,
    };
  }

  return null;
}

function parseDateToken(token: string): DateSpec | null {
  if (token === '今日') return { kind: 'today' };
  if (token === '明日') return { kind: 'tomorrow' };

  const weekday = parseWeekdayToken(token);
  if (weekday !== null) return { kind: 'weekday', weekday };

  if (/\d+日$/.test(token)) {
    const n = parseDayNumberToken(token);
    if (n !== null) return { kind: 'day_of_month', day: n };
  }

  return null;
}

function parseDayNumberToken(token: string): number | null {
  const m = token.match(/^(\d{1,2})(?:日)?$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n < 1 || n > 31) return null;
  return n;
}

function parseWeekdayToken(token: string): number | null {
  const map: Record<string, number> = {
    '日': 0,
    '日曜': 0,
    '日曜日': 0,
    '月': 1,
    '月曜': 1,
    '月曜日': 1,
    '火': 2,
    '火曜': 2,
    '火曜日': 2,
    '水': 3,
    '水曜': 3,
    '水曜日': 3,
    '木': 4,
    '木曜': 4,
    '木曜日': 4,
    '金': 5,
    '金曜': 5,
    '金曜日': 5,
    '土': 6,
    '土曜': 6,
    '土曜日': 6,
  };
  return map[token] ?? null;
}

function parseTimeToken(token: string): TimeSpec | null {
  const m = token.match(/^(\d{1,2})(?::(\d{1,2}))?$/);
  if (!m) return null;
  const hour = Number(m[1]);
  const minute = m[2] ? Number(m[2]) : 0;
  if (hour < 0 || hour > 23) return null;
  if (minute < 0 || minute > 59) return null;
  return { hour, minute };
}

function resolveDeadline(dateSpec: DateSpec | undefined, timeSpec: TimeSpec | undefined, nowJst: JstParts): JstParts {
  const time = timeSpec ?? { hour: 7, minute: 0 };

  if (!dateSpec) {
    const todayTs = toJstTimestamp(nowJst.year, nowJst.month, nowJst.day, time.hour, time.minute);
    if (todayTs > nowJst.timestamp) {
      return { year: nowJst.year, month: nowJst.month, day: nowJst.day, ...time, timestamp: todayTs };
    }
    const next = addDays(nowJst.year, nowJst.month, nowJst.day, 1);
    const nextTs = toJstTimestamp(next.year, next.month, next.day, time.hour, time.minute);
    return { ...next, ...time, timestamp: nextTs };
  }

  if (dateSpec.kind === 'today' || dateSpec.kind === 'tomorrow') {
    const offset = dateSpec.kind === 'today' ? 0 : 1;
    const target = addDays(nowJst.year, nowJst.month, nowJst.day, offset);
    let ts = toJstTimestamp(target.year, target.month, target.day, time.hour, time.minute);
    if (ts <= nowJst.timestamp) {
      const rolled = addDays(target.year, target.month, target.day, 1);
      ts = toJstTimestamp(rolled.year, rolled.month, rolled.day, time.hour, time.minute);
      return { ...rolled, ...time, timestamp: ts };
    }
    return { ...target, ...time, timestamp: ts };
  }

  if (dateSpec.kind === 'weekday') {
    for (let i = 0; i <= 14; i++) {
      const d = addDays(nowJst.year, nowJst.month, nowJst.day, i);
      if (getWeekday(d.year, d.month, d.day) !== dateSpec.weekday) continue;
      const ts = toJstTimestamp(d.year, d.month, d.day, time.hour, time.minute);
      if (ts > nowJst.timestamp) {
        return { ...d, ...time, timestamp: ts };
      }
    }
  }

  if (dateSpec.kind === 'day_of_month' || dateSpec.kind === 'day_of_month_weekday') {
    for (let monthOffset = 0; monthOffset <= 24; monthOffset++) {
      const shifted = addMonths(nowJst.year, nowJst.month, monthOffset);
      const maxDay = daysInMonth(shifted.year, shifted.month);
      if (dateSpec.day > maxDay) continue;

      const d = { year: shifted.year, month: shifted.month, day: dateSpec.day };
      if (
        dateSpec.kind === 'day_of_month_weekday'
        && getWeekday(d.year, d.month, d.day) !== dateSpec.weekday
      ) {
        continue;
      }

      const ts = toJstTimestamp(d.year, d.month, d.day, time.hour, time.minute);
      if (ts > nowJst.timestamp) {
        return { ...d, ...time, timestamp: ts };
      }
    }
  }

  const fallback = addDays(nowJst.year, nowJst.month, nowJst.day, 1);
  const fallbackTs = toJstTimestamp(fallback.year, fallback.month, fallback.day, time.hour, time.minute);
  return { ...fallback, ...time, timestamp: fallbackTs };
}

interface JstParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  timestamp: number;
}

function getJstParts(date: Date): JstParts {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const year = Number(parts.find((p) => p.type === 'year')?.value ?? '0');
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? '0');
  const day = Number(parts.find((p) => p.type === 'day')?.value ?? '0');
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? '0');
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? '0');
  return {
    year,
    month,
    day,
    hour,
    minute,
    timestamp: date.getTime(),
  };
}

function toJstTimestamp(year: number, month: number, day: number, hour: number, minute: number): number {
  return Date.UTC(year, month - 1, day, hour, minute) - JST_OFFSET_MINUTES * 60 * 1000;
}

function formatJst(year: number, month: number, day: number, hour: number, minute: number): string {
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}`;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function addMonths(year: number, month: number, offset: number): { year: number; month: number } {
  const base = new Date(Date.UTC(year, month - 1 + offset, 1));
  return {
    year: base.getUTCFullYear(),
    month: base.getUTCMonth() + 1,
  };
}

function addDays(year: number, month: number, day: number, offset: number): { year: number; month: number; day: number } {
  const base = new Date(Date.UTC(year, month - 1, day));
  base.setUTCDate(base.getUTCDate() + offset);
  return {
    year: base.getUTCFullYear(),
    month: base.getUTCMonth() + 1,
    day: base.getUTCDate(),
  };
}

function getWeekday(year: number, month: number, day: number): number {
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export const NATURAL_INPUT_EXAMPLES = [
  '23 レポート提出',
  '明日 23:30 請求書送信',
  '月 23 定例準備',
  '23 月 経費処理',
];

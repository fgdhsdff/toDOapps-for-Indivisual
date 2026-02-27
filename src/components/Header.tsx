import type { ViewMode, TimelineSpan } from '../App';
import styles from './Header.module.css';

const SPAN_OPTIONS: { value: TimelineSpan; label: string }[] = [
  { value: 1, label: '1日' },
  { value: 3, label: '3日' },
  { value: 5, label: '5日' },
  { value: 7, label: '7日' },
  { value: 14, label: '14日' },
  { value: 21, label: '21日' },
];

interface HeaderProps {
  onAddTaskClick: () => void;
  onAddScheduleClick: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  timelineSpan: TimelineSpan;
  onTimelineSpanChange: (span: TimelineSpan) => void;
}

export function Header({
  onAddTaskClick,
  onAddScheduleClick,
  viewMode,
  onViewModeChange,
  timelineSpan,
  onTimelineSpanChange,
}: HeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>TODO スケジュール</h1>
      <div className={styles.controls}>
        <div className={styles.toggle}>
          <button
            className={`${styles.toggleButton} ${viewMode === 'gantt' ? styles.toggleButtonActive : ''}`}
            onClick={() => onViewModeChange('gantt')}
            type="button"
          >
            タイムライン
          </button>
          <button
            className={`${styles.toggleButton} ${viewMode === 'calendar' ? styles.toggleButtonActive : ''}`}
            onClick={() => onViewModeChange('calendar')}
            type="button"
          >
            完了履歴
          </button>
        </div>
        {viewMode === 'gantt' && (
          <div className={styles.spanSelector}>
            {SPAN_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`${styles.spanButton} ${timelineSpan === opt.value ? styles.spanButtonActive : ''}`}
                onClick={() => onTimelineSpanChange(opt.value)}
                type="button"
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
        <div className={styles.addButtons}>
          <button className={styles.addScheduleButton} onClick={onAddScheduleClick} type="button">
            <span className={styles.addIcon}>＋</span>
            予定追加
          </button>
          <button className={styles.addButton} onClick={onAddTaskClick} type="button">
            <span className={styles.addIcon}>＋</span>
            タスク追加
          </button>
        </div>
      </div>
    </header>
  );
}

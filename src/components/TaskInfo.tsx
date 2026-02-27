import type { Task } from '../types';
import { extractDateOnly, isDeadlineUrgent, formatDeadlineWithTime } from '../utils/date';
import styles from './TaskInfo.module.css';

interface TaskInfoProps {
  task: Task;
  dates: string[];
  onComplete: (id: number) => void;
}

export function TaskInfo({ task, dates, onComplete }: TaskInfoProps) {
  const urgent = isDeadlineUrgent(task.deadline);
  const deadlineDateOnly = extractDateOnly(task.deadline);

  // 締切日がタイムライン表示範囲外かどうか
  const timelineStart = dates[0];
  const timelineEnd = dates[dates.length - 1];
  const deadlineOutOfRange = deadlineDateOnly < timelineStart || deadlineDateOnly > timelineEnd;

  return (
    <div className={styles.container}>
      <div className={styles.textArea}>
        <div className={styles.taskName}>
          {task.name}
          {urgent && <span className={styles.alert}>🚨</span>}
        </div>
        {deadlineOutOfRange && (
          <div className={styles.deadline}>期限: {formatDeadlineWithTime(task.deadline)}</div>
        )}
      </div>
      <button
        className={styles.completeButton}
        onClick={() => onComplete(task.id)}
        type="button"
      >
        完了
      </button>
    </div>
  );
}

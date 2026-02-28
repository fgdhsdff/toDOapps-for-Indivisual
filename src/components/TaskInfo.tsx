import type { Task } from '../types';
import { isDeadlineUrgent, formatDeadlineWithTime } from '../utils/date';
import styles from './TaskInfo.module.css';

interface TaskInfoProps {
  task: Task;
  dates: string[];
  onComplete: (id: number) => void;
}

export function TaskInfo({ task, onComplete }: TaskInfoProps) {
  const urgent = isDeadlineUrgent(task.deadline);

  return (
    <div className={styles.container}>
      <div className={styles.textArea}>
        <div className={styles.taskName}>
          {task.name}
          {urgent && <span className={styles.alert}>!</span>}
        </div>
      </div>
      <div className={styles.actionArea}>
        <button
          className={styles.completeButton}
          onClick={() => onComplete(task.id)}
          type="button"
        >
          完了
        </button>
        <div className={styles.deadline}>〆切: {formatDeadlineWithTime(task.deadline)}</div>
      </div>
    </div>
  );
}

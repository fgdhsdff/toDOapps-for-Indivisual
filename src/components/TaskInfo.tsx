import type { Task } from '../types';
import { isDeadlineUrgent, formatDeadlineWithTime } from '../utils/date';
import styles from './TaskInfo.module.css';

interface TaskInfoProps {
  task: Task;
  onComplete: (id: number) => void;
}

export function TaskInfo({ task, onComplete }: TaskInfoProps) {
  const urgent = isDeadlineUrgent(task.deadline);
  const deadlineLabel = formatDeadlineWithTime(task.deadline);
  const [datePart, timePart = '--:--'] = deadlineLabel.split(' ');

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
        <div className={styles.deadline}>
          <div>〆切: {datePart}</div>
          <div>{timePart}</div>
        </div>
      </div>
    </div>
  );
}

import type { Task } from '../types';
import { TaskInfo } from './TaskInfo';
import { GanttBar } from './GanttBar';
import styles from './TaskRow.module.css';

interface TaskRowProps {
  task: Task;
  dates: string[];
  onComplete: (id: number) => void;
}

export function TaskRow({ task, dates, onComplete }: TaskRowProps) {
  return (
    <tr className={styles.row}>
      <td className={styles.infoCell}>
        <TaskInfo task={task} dates={dates} onComplete={onComplete} />
      </td>
      <GanttBar task={task} dates={dates} />
    </tr>
  );
}

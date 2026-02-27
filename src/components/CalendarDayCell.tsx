import type { Task } from '../types';
import { getDayOfWeekJa } from '../utils/date';
import { getPriorityColor } from '../utils/priority';
import styles from './CalendarDayCell.module.css';

interface CalendarDayCellProps {
  date: string;
  tasks: Task[];
  isToday: boolean;
  isOutsideMonth?: boolean;
}

export function CalendarDayCell({ date, tasks, isToday, isOutsideMonth }: CalendarDayCellProps) {
  const dayOfWeek = getDayOfWeekJa(date);
  const isSunday = dayOfWeek === '日';
  const isSaturday = dayOfWeek === '土';
  const dayNum = new Date(date).getDate();

  return (
    <div className={`${styles.cell} ${isToday ? styles.today : ''} ${isOutsideMonth ? styles.outside : ''}`}>
      <div
        className={`${styles.dateHeader} ${isSunday ? styles.sunday : ''} ${isSaturday ? styles.saturday : ''}`}
      >
        <span className={styles.dateText}>{dayNum}</span>
      </div>
      <div className={styles.taskList}>
        {tasks.map((task) => (
          <div
            key={task.id}
            className={styles.taskChip}
            style={{ borderLeftColor: getPriorityColor(task.priority) }}
            title={`${task.name}（重要度: ${task.priority}）`}
          >
            <span className={styles.taskName}>{task.name}</span>
            {task.completedAt && (
              <span className={styles.completedTime}>
                {new Date(task.completedAt).getHours().toString().padStart(2, '0')}:
                {new Date(task.completedAt).getMinutes().toString().padStart(2, '0')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

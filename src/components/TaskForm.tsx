import { useState } from 'react';
import type { Task } from '../types';
import { getNowString } from '../utils/date';
import { getPriorityColor } from '../utils/priority';
import { DateTimeSelect } from './DateTimeSelect';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'completedAt'>) => void;
  onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [name, setName] = useState('');
  const now = getNowString();
  const [deadline, setDeadline] = useState(now);
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [errors, setErrors] = useState<{ name?: string; priority?: string }>({});

  const handleSubmit = () => {
    const newErrors: { name?: string; priority?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'タスク名を入力してください';
    }
    if (priority === null) {
      newErrors.priority = '重要度を選択してください';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({
      name: name.trim(),
      deadline: deadline || now,
      priority: priority!,
    });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>タスクを追加</h2>

        <div className={styles.field}>
          <label className={styles.label}>タスク名</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: undefined })); }}
            placeholder="タスク名を入力"
            autoFocus
          />
          {errors.name && <div className={styles.error}>{errors.name}</div>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>締切日時</label>
          <DateTimeSelect value={deadline} onChange={setDeadline} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>重要度</label>
          <div className={styles.priorityButtons}>
            {([1, 2, 3, 4, 5] as const).map((p) => (
              <button
                key={p}
                className={`${styles.priorityButton} ${priority === p ? styles.priorityButtonSelected : ''}`}
                style={priority === p ? { background: getPriorityColor(p) } : undefined}
                onClick={() => { setPriority(p); setErrors(prev => ({ ...prev, priority: undefined })); }}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
          {errors.priority && <div className={styles.error}>{errors.priority}</div>}
        </div>

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel} type="button">
            キャンセル
          </button>
          <button className={styles.submitButton} onClick={handleSubmit} type="button">
            登録
          </button>
        </div>
      </div>
    </div>
  );
}

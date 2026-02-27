import { useMemo, useState } from 'react';
import type { Task } from '../types';
import { getPriorityColor } from '../utils/priority';
import { NATURAL_INPUT_EXAMPLES, parseNaturalTaskInput } from '../utils/naturalDeadline';
import styles from './TaskForm.module.css';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'isCompleted' | 'completedAt'>) => void;
  onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [naturalInput, setNaturalInput] = useState('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const parsed = useMemo(() => parseNaturalTaskInput(naturalInput), [naturalInput]);

  const handleSubmit = () => {
    if (!parsed.ok) {
      setSubmitError(parsed.error.message);
      return;
    }

    onSubmit({
      name: parsed.value.taskName,
      deadline: parsed.value.deadline,
      priority,
    });

    setSubmitError(null);
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
          <label className={styles.label}>入力</label>
          <input
            className={styles.input}
            type="text"
            value={naturalInput}
            onChange={(e) => {
              setNaturalInput(e.target.value);
              setSubmitError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="明日 23 レポート提出"
            autoFocus
          />
          <div className={styles.hint}>{NATURAL_INPUT_EXAMPLES.join(' / ')}</div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>解釈結果</label>
          <div className={styles.previewBox}>
            {parsed.ok ? parsed.value.preview : '期限トークンを先頭に入力してください'}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>優先度</label>
          <div className={styles.priorityButtons}>
            {([1, 2, 3, 4, 5] as const).map((p) => (
              <button
                key={p}
                className={`${styles.priorityButton} ${priority === p ? styles.priorityButtonSelected : ''}`}
                style={priority === p ? { background: getPriorityColor(p) } : undefined}
                onClick={() => setPriority(p)}
                type="button"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {submitError && <div className={styles.error}>{submitError}</div>}

        <div className={styles.actions}>
          <button className={styles.cancelButton} onClick={onCancel} type="button">
            キャンセル
          </button>
          <button className={styles.submitButton} onClick={handleSubmit} type="button">
            追加
          </button>
        </div>
      </div>
    </div>
  );
}

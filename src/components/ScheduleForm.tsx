import { useState } from 'react';
import type { Schedule } from '../types';
import { getNowString } from '../utils/date';
import { DateTimeSelect } from './DateTimeSelect';
import dtStyles from './DateTimeSelect.module.css';
import styles from './ScheduleForm.module.css';

interface ScheduleFormProps {
  onSubmit: (schedule: Omit<Schedule, 'id'>) => void;
  onCancel: () => void;
}

export function ScheduleForm({ onSubmit, onCancel }: ScheduleFormProps) {
  const now = getNowString();
  const [name, setName] = useState('');
  const [startAt, setStartAt] = useState(now);
  const [endAt, setEndAt] = useState(now);
  const [errors, setErrors] = useState<{ name?: string; time?: string }>({});

  const handleSubmit = () => {
    const newErrors: { name?: string; time?: string } = {};
    if (!name.trim()) {
      newErrors.name = '予定名を入力してください';
    }
    if (!startAt || !endAt) {
      newErrors.time = '開始日時と終了日時を入力してください';
    } else if (startAt >= endAt) {
      newErrors.time = '終了日時は開始日時より後にしてください';
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ name: name.trim(), startAt, endAt });
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onCancel();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>予定を追加</h2>

        <div className={styles.field}>
          <label className={styles.label}>予定名</label>
          <input
            className={styles.input}
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })); }}
            placeholder="予定名を入力"
            autoFocus
          />
          {errors.name && <div className={styles.error}>{errors.name}</div>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>開始日時</label>
          <DateTimeSelect
            value={startAt}
            onChange={(v) => {
              setStartAt(v);
              if (!endAt || endAt <= v) setEndAt(v);
              setErrors((prev) => ({ ...prev, time: undefined }));
            }}
            accentClass={dtStyles.scheduleAccent}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>終了日時</label>
          <DateTimeSelect
            value={endAt}
            onChange={(v) => { setEndAt(v); setErrors((prev) => ({ ...prev, time: undefined })); }}
            accentClass={dtStyles.scheduleAccent}
          />
          {errors.time && <div className={styles.error}>{errors.time}</div>}
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

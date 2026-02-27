/** 重要度に対応する色を返す */
export function getPriorityColor(priority: 1 | 2 | 3 | 4 | 5): string {
  const colors: Record<number, string> = {
    1: '#3a7bd5',  // 青：余裕があるタスク
    2: '#48a9a6',  // ティール：頭に入れておくタスク
    3: '#d4a843',  // ゴールド：通常のタスク
    4: '#d97328',  // オレンジ：注意が必要なタスク
    5: '#c8102e',  // ディープレッド：緊急のタスク
  };
  return colors[priority];
}

/** 重要度のラベルを返す */
export function getPriorityLabel(priority: number): string {
  const labels: Record<number, string> = {
    1: '最低',
    2: '低',
    3: '中',
    4: '高',
    5: '最高',
  };
  return labels[priority] ?? '';
}

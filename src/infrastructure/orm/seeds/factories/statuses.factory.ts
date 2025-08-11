import { setSeederFactory } from 'typeorm-extension';
import { Statuses } from '../../entities/statuses.entity';

export const statusData = [
  { name: 'not_yet', description: 'タスクが未着手の状態' },
  { name: 'in_progress', description: '貸出中の状態' },
  { name: 'in_checking', description: '返却されたかどうか確認中' },
  { name: 'done', description: '返却完了済みです！' },
];

export const StatusesFactory = setSeederFactory(Statuses, () => {
  const newStatus = new Statuses();
  const status = statusData.shift(); // 順番にデータを取得
  if (status) {
    newStatus.name = status.name;
    newStatus.description = status.description;
    newStatus.createdAt = new Date();
    newStatus.updatedAt = new Date();
    newStatus.deletedAt = undefined;
  }
  return newStatus;
});

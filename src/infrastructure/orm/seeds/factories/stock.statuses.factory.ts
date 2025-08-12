import { setSeederFactory } from 'typeorm-extension';
import { StockStatuses } from '../../entities/stock.statuses.entity';

/**
 * 在庫ステータスのマスタデータ
 * 在庫の現在状態を管理するためのステータス
 */
export const stockStatusData = [
  { name: 'available', description: '在庫あり' },
  { name: 'unavailable', description: '在庫なし' },
  { name: 'adjusting', description: '調整中' },
  { name: 'stopped', description: '停止中' },
  { name: 'discarded', description: '廃棄済み' },
  { name: 'incoming', description: '入庫待ち' },
];

export const StockStatusesFactory = setSeederFactory(StockStatuses, () => {
  const newStockStatus = new StockStatuses();
  const statusData = stockStatusData.shift(); // 順番にデータを取得

  if (statusData) {
    newStockStatus.name = statusData.name;
    newStockStatus.description = statusData.description;
    newStockStatus.createdAt = new Date();
    newStockStatus.updatedAt = new Date();
    newStockStatus.deletedAt = null;
  }

  return newStockStatus;
});

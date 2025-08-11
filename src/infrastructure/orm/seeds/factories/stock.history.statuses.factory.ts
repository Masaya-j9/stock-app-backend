import { setSeederFactory } from 'typeorm-extension';
import { StockHistoryStatuses } from '../../entities/stock.history.statuses.entity';

/**
 * 在庫履歴ステータスのマスタデータ
 * 在庫の入出庫状態を管理するためのステータス
 */
export const stockHistoryStatusData = [
  { name: 'increase', description: '在庫増加（入庫）' },
  { name: 'decrease', description: '在庫減少（出庫）' },
  { name: 'adjustment', description: '在庫調整中' },
  { name: 'unusable', description: '使用不能' },
  { name: 'return', description: '返却による在庫復旧' },
  { name: 'loss', description: '紛失・破損による在庫減少' },
  { name: 'transfer', description: '在庫移動・移管' },
  { name: 'revival', description: '復活' },
];

export const StockHistoryStatusesFactory = setSeederFactory(
  StockHistoryStatuses,
  () => {
    const newStockHistoryStatus = new StockHistoryStatuses();
    const statusData = stockHistoryStatusData.shift(); // 順番にデータを取得

    if (statusData) {
      newStockHistoryStatus.name = statusData.name;
      newStockHistoryStatus.description = statusData.description;
      newStockHistoryStatus.createdAt = new Date();
      newStockHistoryStatus.updatedAt = new Date();
      newStockHistoryStatus.deletedAt = null;
    }

    return newStockHistoryStatus;
  }
);

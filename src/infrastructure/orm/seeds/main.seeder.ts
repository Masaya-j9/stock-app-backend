import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import { Borrowings } from '../entities/borrowings.entity';
import { Categories } from '../entities/categories.entity';
import { Comments } from '../entities/comments.entity';
import { Items } from '../entities/items.entity';
import { Profiles } from '../entities/profiles.entity';
import { Returns } from '../entities/returns.entity';
import { Roles } from '../entities/roles.entity';
import { Statuses } from '../entities/statuses.entity';
import { StockHistoryStatuses } from '../entities/stock.history.statuses.entity';
import { StockHistories } from '../entities/stock.histories.entity';
import { Stocks } from '../entities/stocks.entity';
import { Users } from '../entities/users.entity';

//中間テーブル
import { BorrowingComments } from '../entities/intermediates/borrowing.comments.entity';
import { BorrowingReturns } from '../entities/intermediates/borrowing.returns.entity';
import { BorrowingStocks } from '../entities/intermediates/borrowing.stocks.entity';
import { ItemCategories } from '../entities/intermediates/item.categories.entity';
import { ReturnStocks } from '../entities/intermediates/return.stocks.entity';
import { UserBorrowings } from '../entities/intermediates/user.borrowings.entity';
import { UserComments } from '../entities/intermediates/user.comments.entity';

export class MainSeeder implements Seeder {
  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager
  ): Promise<any> {
    //Borrowingsデータを作成
    const borrowingFactory = await factoryManager.get(Borrowings);
    await borrowingFactory.saveMany(10);

    //categoriesデータは、categoryDataを使って作成
    const categoryFactory = await factoryManager.get(Categories);
    await categoryFactory.saveMany(4);

    //commentsデータを作成
    const commentFactory = await factoryManager.get(Comments);
    await commentFactory.saveMany(10);

    //itemsデータを作成
    const itemFactory = await factoryManager.get(Items);
    await itemFactory.saveMany(20);

    //returnsデータを作成
    const returnFactory = await factoryManager.get(Returns);
    await returnFactory.saveMany(5);

    //rolesデータを作成
    const roleFactory = await factoryManager.get(Roles);
    await roleFactory.saveMany(3);

    //statusesデータを作成
    const statusFactory = await factoryManager.get(Statuses);
    await statusFactory.saveMany(4);

    //stockHistoryStatusesデータを追加
    const stockHistoryStatusFactory =
      await factoryManager.get(StockHistoryStatuses);
    await stockHistoryStatusFactory.saveMany(8);

    //stockHistoriesデータを作成
    const stockHistoryFactory = await factoryManager.get(StockHistories);
    await stockHistoryFactory.saveMany(10);

    //stocksデータを作成
    const stockFactory = await factoryManager.get(Stocks);
    await stockFactory.saveMany(10);

    //usersデータを作成
    const userFactory = await factoryManager.get(Users);
    await userFactory.saveMany(10);

    //profilesデータを作成
    const profileFactory = await factoryManager.get(Profiles);
    await profileFactory.saveMany(10);

    //中間テーブル
    //borrowingCommentsデータを作成
    //10件のデータを作成
    const borrowingCommentsFactory =
      await factoryManager.get(BorrowingComments);
    await borrowingCommentsFactory.saveMany(10);

    //borrowingReturnsデータを作成
    //5件のデータを作成
    const borrowingReturnFactory = await factoryManager.get(BorrowingReturns);
    await borrowingReturnFactory.saveMany(5);

    //borrowingStocksデータを作成
    //5件のデータを作成
    const borrowingStockFactory = await factoryManager.get(BorrowingStocks);
    await borrowingStockFactory.saveMany(5);

    //itemCategoriesデータを作成
    //10件のデータを作成
    const itemCategoryFactory = await factoryManager.get(ItemCategories);
    await itemCategoryFactory.saveMany(10);

    //returnStocksデータを作成
    //5件のデータを作成
    const returnStockFactory = await factoryManager.get(ReturnStocks);
    await returnStockFactory.saveMany(5);

    //userBorrowingsデータを作成
    //10件のデータを作成
    const userBorrowingFactory = await factoryManager.get(UserBorrowings);
    await userBorrowingFactory.saveMany(10);

    //userCommentsデータを作成
    //10件のデータを作成
    const userCommentFactory = await factoryManager.get(UserComments);
    await userCommentFactory.saveMany(10);
  }
}

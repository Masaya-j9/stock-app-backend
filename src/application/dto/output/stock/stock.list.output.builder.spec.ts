import { StockListOutputBuilder } from './stock.list.output.builder';
import { StockListOutputDto } from './stock.list.output.dto';
import { Stock } from '../../../../domain/inventory/stocks/entities/stock.entity';
import { StockStatus } from '../../../../domain/inventory/stocks/entities/stock.status.entity';
import { Quantity } from '../../../../domain/inventory/items/value-objects/quantity';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';

describe('StockListOutputBuilder', () => {
  const stocks = [
    new Stock(
      1,
      Quantity.of(10),
      'テスト在庫1',
      new Date(),
      new Date(),
      null,
      1,
      new StockStatus(
        1,
        'In Stock',
        'The item is in stock',
        new Date(),
        new Date(),
        null
      )
    ),
    new Stock(
      2,
      Quantity.of(20),
      'テスト在庫2',
      new Date(),
      new Date(),
      null,
      2,
      new StockStatus(
        2,
        'Out of Stock',
        'The item is out of stock',
        new Date(),
        new Date(),
        null
      )
    ),
  ];
  const items = [
    {
      id: 1,
      name: 'Item 1',
      description: 'Description 1',
      quantity: 10,
      itemCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
    {
      id: 2,
      name: 'Item 2',
      description: 'Description 2',
      quantity: 5,
      itemCategories: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ] as Items[];
  const totalCount = 2;
  const totalPages = 1;
  describe('build', () => {
    it('should return StockListOutputDto with stocks and items', () => {
      const builder = new StockListOutputBuilder(
        stocks,
        items,
        totalCount,
        totalPages
      );
      const output = builder.build();
      expect(output).toBeInstanceOf(StockListOutputDto);
      expect(output.count).toBe(totalCount);
      expect(output.totalPages).toBe(totalPages);
      expect(output.results).toHaveLength(2);
      expect(output.results[0].id).toBe(1);
      expect(output.results[0].quantity).toBe(10);
      expect(output.results[0].description).toBe('テスト在庫1');
      expect(output.results[0].createdAt).toBeInstanceOf(Date);
      expect(output.results[0].updatedAt).toBeInstanceOf(Date);
      expect(output.results[0].item.id).toBe(1);
      expect(output.results[0].item.name).toBe('Item 1');
      expect(output.results[0].status.id).toBe(1);
      expect(output.results[0].status.name).toBe('In Stock');
      expect(output.results[0].status.description).toBe('The item is in stock');
      expect(output.results[1].id).toBe(2);
      expect(output.results[1].quantity).toBe(20);
      expect(output.results[1].description).toBe('テスト在庫2');
      expect(output.results[1].createdAt).toBeInstanceOf(Date);
      expect(output.results[1].updatedAt).toBeInstanceOf(Date);
      expect(output.results[1].item.id).toBe(2);
      expect(output.results[1].item.name).toBe('Item 2');
      expect(output.results[1].status.id).toBe(2);
      expect(output.results[1].status.name).toBe('Out of Stock');
      expect(output.results[1].status.description).toBe(
        'The item is out of stock'
      );
    });

    it('should throw NotFoundException if no stocks found', () => {
      const builder = new StockListOutputBuilder([], [], 0, 0);
      expect(() => builder.build()).toThrow('Stocks not found');
    });
  });
});

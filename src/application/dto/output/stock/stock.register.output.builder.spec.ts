import { StockRegisterOutputDtoBuilder } from './stock.register.output.builder';
import { StockRegisterOutputDto } from './stock.register.output.dto';
import { Stock } from '../../../../domain/inventory/stocks/entities/stock.entity';
import { StockStatus } from '../../../../domain/inventory/stocks/entities/stock.status.entity';
import { Items } from '../../../../infrastructure/orm/entities/items.entity';
import { Quantity } from '../../../../domain/inventory/items/value-objects/quantity';

describe('StockRegisterOutputDtoBuilder', () => {
  let builder: StockRegisterOutputDtoBuilder;

  // モックデータの作成
  const mockQuantity = Quantity.of(10);
  const mockStockStatus = new StockStatus(
    1,
    'available',
    'Available status',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    null
  );

  const mockStock = new Stock(
    123, // DB ID (永続化済み)
    mockQuantity,
    'Test stock description',
    new Date('2024-01-01T10:00:00Z'),
    new Date('2024-01-01T11:00:00Z'),
    null,
    1, // itemId
    mockStockStatus
  );

  const mockItem: Items = {
    id: 1,
    name: 'Test Item',
    quantity: 10,
    description: 'Test Item Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    deletedAt: null,
    itemCategories: [],
  };

  describe('constructor', () => {
    it('Stockエンティティのみで初期化できること', () => {
      builder = new StockRegisterOutputDtoBuilder(mockStock);

      expect(builder).toBeDefined();
    });

    it('StockエンティティとItemエンティティで初期化できること', () => {
      builder = new StockRegisterOutputDtoBuilder(mockStock, mockItem);

      expect(builder).toBeDefined();
    });

    it('Itemエンティティがnullでも初期化できること', () => {
      builder = new StockRegisterOutputDtoBuilder(mockStock, null);

      expect(builder).toBeDefined();
    });

    it('Itemエンティティが未指定でも初期化できること', () => {
      builder = new StockRegisterOutputDtoBuilder(mockStock);

      expect(builder).toBeDefined();
    });
  });

  describe('build', () => {
    it('完全なデータでOutput DTOを正しく構築すること', () => {
      // Arrange
      builder = new StockRegisterOutputDtoBuilder(mockStock, mockItem);

      // Act
      const result = builder.build();

      // Assert
      expect(result).toBeInstanceOf(StockRegisterOutputDto);
      expect(result.id).toBe(123);
      expect(result.quantity).toBe(10);
      expect(result.description).toBe('Test stock description');
      expect(result.createdAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(result.updatedAt).toEqual(new Date('2024-01-01T11:00:00Z'));

      // Item情報の検証
      expect(result.item).toEqual({
        id: 1,
        name: 'Test Item',
      });

      // Status情報の検証
      expect(result.status).toEqual({
        id: 1,
        name: 'available',
        description: 'Available status',
      });
    });

    it('Itemがnullの場合、itemフィールドがnullになること', () => {
      // Arrange
      builder = new StockRegisterOutputDtoBuilder(mockStock, null);

      // Act
      const result = builder.build();

      // Assert
      expect(result).toBeInstanceOf(StockRegisterOutputDto);
      expect(result.id).toBe(123);
      expect(result.quantity).toBe(10);
      expect(result.description).toBe('Test stock description');
      expect(result.item).toBeNull();

      // Statusは正常に設定される
      expect(result.status).toEqual({
        id: 1,
        name: 'available',
        description: 'Available status',
      });
    });

    it('Itemが未指定の場合、itemフィールドがnullになること', () => {
      // Arrange
      builder = new StockRegisterOutputDtoBuilder(mockStock);

      // Act
      const result = builder.build();

      // Assert
      expect(result).toBeInstanceOf(StockRegisterOutputDto);
      expect(result.item).toBeNull();
    });

    it('Stockのstatusがnullの場合、statusフィールドがnullになること', () => {
      // Arrange
      const stockWithoutStatus = new Stock(
        456,
        mockQuantity,
        'Test stock without status',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        null,
        1,
        null // status is null
      );
      builder = new StockRegisterOutputDtoBuilder(stockWithoutStatus, mockItem);

      // Act
      const result = builder.build();

      // Assert
      expect(result).toBeInstanceOf(StockRegisterOutputDto);
      expect(result.id).toBe(456);
      expect(result.status).toBeNull();

      // 他のフィールドは正常に設定される
      expect(result.item).toEqual({
        id: 1,
        name: 'Test Item',
      });
    });

    it('UUID（string）のIDでも正しく構築できること', () => {
      // Arrange
      const stockWithUUID = new Stock(
        'uuid-123-456-789',
        mockQuantity,
        'Test stock with UUID',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        null,
        1,
        mockStockStatus
      );
      builder = new StockRegisterOutputDtoBuilder(stockWithUUID, mockItem);

      // Act
      const result = builder.build();

      // Assert
      expect(result).toBeInstanceOf(StockRegisterOutputDto);
      expect(result.id).toBe('uuid-123-456-789');
      expect(result.quantity).toBe(10);
      expect(result.description).toBe('Test stock with UUID');
    });

    it('空の説明でも正しく構築できること', () => {
      // Arrange
      const stockWithEmptyDescription = new Stock(
        789,
        mockQuantity,
        '', // empty description
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        null,
        1,
        mockStockStatus
      );
      builder = new StockRegisterOutputDtoBuilder(
        stockWithEmptyDescription,
        mockItem
      );

      // Act
      const result = builder.build();

      // Assert
      expect(result).toBeInstanceOf(StockRegisterOutputDto);
      expect(result.description).toBe('');
    });

    it('複数回buildを呼び出しても同じ結果を返すこと', () => {
      // Arrange
      builder = new StockRegisterOutputDtoBuilder(mockStock, mockItem);

      // Act
      const result1 = builder.build();
      const result2 = builder.build();

      // Assert
      expect(result1).toEqual(result2);
      expect(result1).not.toBe(result2); // 異なるインスタンス
    });
  });

  describe('edge cases', () => {
    it('最小数量(1)で正しく構築できること', () => {
      // Arrange
      const minQuantity = Quantity.of(1);
      const stockWithMinQuantity = new Stock(
        999,
        minQuantity,
        'Test stock with min quantity',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        null,
        1,
        mockStockStatus
      );
      builder = new StockRegisterOutputDtoBuilder(
        stockWithMinQuantity,
        mockItem
      );

      // Act
      const result = builder.build();

      // Assert
      expect(result.quantity).toBe(1);
    });

    it('最大数量(100)で正しく構築できること', () => {
      // Arrange
      const maxQuantity = Quantity.of(100);
      const stockWithMaxQuantity = new Stock(
        1000,
        maxQuantity,
        'Test stock with max quantity',
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        null,
        1,
        mockStockStatus
      );
      builder = new StockRegisterOutputDtoBuilder(
        stockWithMaxQuantity,
        mockItem
      );

      // Act
      const result = builder.build();

      // Assert
      expect(result.quantity).toBe(100);
    });

    it('長い説明文でも正しく構築できること', () => {
      // Arrange
      const longDescription = 'This is a very long description '.repeat(10);
      const stockWithLongDescription = new Stock(
        1001,
        mockQuantity,
        longDescription,
        new Date('2024-01-01T10:00:00Z'),
        new Date('2024-01-01T11:00:00Z'),
        null,
        1,
        mockStockStatus
      );
      builder = new StockRegisterOutputDtoBuilder(
        stockWithLongDescription,
        mockItem
      );

      // Act
      const result = builder.build();

      // Assert
      expect(result.description).toBe(longDescription);
      expect(result.description.length).toBeGreaterThan(100);
    });
  });
});

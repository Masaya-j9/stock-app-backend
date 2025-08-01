import { Item } from './item.entity';

describe('Item Entity', () => {
  let item: Item;

  beforeEach(() => {
    item = new Item(
      1,
      'Item 1',
      10,
      'Description 1',
      new Date(),
      new Date(),
      null,
      [1, 2]
    );
  });

  describe('create', () => {
    it('should create an instance of Item', () => {
      expect(item).toBeDefined();
    });
  });

  describe('updateQuantity', () => {
    it('should update the quantity of the item', () => {
      const updated = item.updateQuantity(5);
      expect(updated.quantity).toBe(5);
    });
  });
});

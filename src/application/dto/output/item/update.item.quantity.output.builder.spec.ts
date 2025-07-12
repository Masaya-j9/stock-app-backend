import { UpdateItemQuantityOutputBuilder } from './update.item.quantity.output.builder';

describe('UpdateItemQuantityOutputBuilder', () => {
  it('should build UpdateItemQuantityOutputDto', () => {
    const id = 1;
    const quantity = 10;
    const updatedAt = new Date();
    const builder = new UpdateItemQuantityOutputBuilder(
      id,
      quantity,
      updatedAt
    );
    const output = builder.build();
    expect(output.id).toBe(id);
    expect(output.quantity).toBe(quantity);
    expect(output.updatedAt).toBe(updatedAt);
  });
});

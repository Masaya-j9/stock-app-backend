import { CategoryRegisterOutputBuilder } from './category.register.output.builder';
import { CategoryRegisterOutputDto } from './category.register.output.dto';

describe('CategoryRegisterOutputBuilder', () => {
  describe('build', () => {
    it('should return a CategoryRegisterOutputDto', () => {
      const builder = new CategoryRegisterOutputBuilder(
        1,
        'Category 1',
        'Category 1',
        new Date(),
        new Date()
      );
      const output = builder.build();
      expect(output).toBeInstanceOf(CategoryRegisterOutputDto);
      expect(output.id).toBe(1);
      expect(output.name).toBe('Category 1');
      expect(output.description).toBe('Category 1');
      expect(output.createdAt).toBeInstanceOf(Date);
      expect(output.updatedAt).toBeInstanceOf(Date);
    });
  });
});

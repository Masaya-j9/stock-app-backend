import { Test, TestingModule } from '@nestjs/testing';
import { ItemListController } from './item.controller';
import { ItemListService } from '../../../application/services/item/item.list.service';
import { ItemListInputDto } from '../../../application/dto/input/item/item.list.input.dto';
import { ItemListOutputDto } from '../../../application/dto/output/item/item.list.output.dto';
import { of } from 'rxjs';
describe('ItemController', () => {
  let controller: ItemListController;
  let itemListService: ItemListService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemListController],
      providers: [
        {
          provide: ItemListService,
          useValue: {
            service: jest.fn(),
            itemListDatasource: {},
            categoriesDatasource: {},
          },
        },
      ],
    }).compile();
    controller = module.get<ItemListController>(ItemListController);
    itemListService = module.get<ItemListService>(ItemListService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findItemList', () => {
    it('should return an array of items', (done) => {
      const query: ItemListInputDto = { pages: 1, sortOrder: 0 };
      const result: ItemListOutputDto = {
        count: 2,
        results: [
          {
            id: 1,
            name: 'Item 1',
            quantity: 10,
            description: 'Description 1',
            itemsCategories: [],
          },
          {
            id: 2,
            name: 'Item 2',
            quantity: 20,
            description: 'Description 2',
            itemsCategories: [],
          },
        ],
      };
      jest.spyOn(itemListService, 'service').mockReturnValue(of(result));
      controller.findItemList(query).subscribe({
        next: (response: ItemListOutputDto) => {
          expect(response).toBe(result);
          expect(itemListService.service).toHaveBeenCalledWith(query);
        },
        error: (err: any) => {
          fail(err);
        },
        complete: () => {
          done();
        },
      });
    });
  });
});

import { ItemRegisterInputDto } from 'src/application/dto/input/item/item.register.input.dto';
import { ItemRegisterOutputDto } from 'src/application/dto/output/item/item.register.output.dto';
import { ApplicationService } from '../application.service';

export interface ItemRegisterServiceInterface
  extends ApplicationService<ItemRegisterInputDto, ItemRegisterOutputDto> {}

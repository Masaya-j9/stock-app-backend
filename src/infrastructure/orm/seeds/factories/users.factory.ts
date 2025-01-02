import { setSeederFactory } from 'typeorm-extension';
import { Users } from '../../entities/users.entity';
import { Roles } from '../../entities/roles.entity';
import { faker } from '@faker-js/faker';

// 10件のユーザーデータを生成
export const UsersFactory = setSeederFactory(Users, () => {
  const user = new Users();
  user.name = faker.internet.userName();
  user.email = faker.internet.email();
  user.password = faker.internet.password();
  user.createdAt = new Date();
  user.updatedAt = new Date();
  user.deletedAt = undefined;

  user.role = new Roles();
  user.role.id = 1;

  return user;
});

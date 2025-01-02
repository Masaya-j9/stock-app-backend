import { setSeederFactory } from 'typeorm-extension';
import { Roles } from '../../entities/roles.entity';

// 新規でロールを追加したい場合、追加する
const roleData = [
  { name: 'admin', description: '管理者' },
  { name: 'member', description: '一般会員' },
  { name: 'guest', description: 'ゲスト' },
];

export const RolesFactory = setSeederFactory(Roles, () => {
  const newRole = new Roles();
  const role = roleData.shift(); // 順番にデータを取得
  if (role) {
    newRole.name = role.name;
    newRole.description = role.description;
    newRole.createdAt = new Date();
    newRole.updatedAt = new Date();
    newRole.deletedAt = undefined;
  }
  return newRole;
});

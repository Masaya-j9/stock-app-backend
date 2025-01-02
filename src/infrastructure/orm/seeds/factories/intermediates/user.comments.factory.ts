import { setSeederFactory } from 'typeorm-extension';
import { UserComments } from '../../../entities/intermediates/user.comments.entity';
import { Users } from '../../../entities/users.entity';
import { Comments } from '../../../entities/comments.entity';
import { faker } from '@faker-js/faker';

export const UserCommentsFactory = setSeederFactory(UserComments, () => {
  const userComment = new UserComments();
  userComment.createdAt = new Date();
  userComment.updatedAt = new Date();

  userComment.user = new Users();
  userComment.user.id = faker.number.int({ min: 1, max: 10 });

  userComment.comment = new Comments();
  userComment.comment.id = faker.number.int({ min: 1, max: 10 });

  return userComment;
});

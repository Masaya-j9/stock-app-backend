import { setSeederFactory } from 'typeorm-extension';
import { Comments } from '../../entities/comments.entity';
import { faker } from '@faker-js/faker';

export const CommentsFactory = setSeederFactory(Comments, () => {
  const comment = new Comments();
  comment.description = faker.lorem.sentence();
  comment.createdAt = new Date();
  comment.updatedAt = new Date();
  comment.deletedAt = undefined;

  return comment;
});

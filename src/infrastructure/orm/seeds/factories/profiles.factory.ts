import { setSeederFactory } from 'typeorm-extension';
import { Profiles } from '../../entities/profiles.entity';
import { Users } from '../../entities/users.entity';
import { faker } from '@faker-js/faker';

const profileData = [
  { userId: 1 },
  { userId: 2 },
  { userId: 3 },
  { userId: 4 },
  { userId: 5 },
  { userId: 6 },
  { userId: 7 },
  { userId: 8 },
  { userId: 9 },
  { userId: 10 },
];

export const ProfilesFactory = setSeederFactory(Profiles, () => {
  const profile = new Profiles();
  const profiles = profileData.shift();
  if (profiles) {
    profile.user = new Users();
    profile.user.id = profiles.userId;
    profile.description = faker.lorem.sentence();
    profile.createdAt = new Date();
    profile.updatedAt = new Date();
    profile.deletedAt = undefined;

    return profile;
  }
});

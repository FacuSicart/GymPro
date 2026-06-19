import { User } from '@prisma/client';

export type PublicUser = Omit<User, 'passwordHash' | 'providerUserId'>;

export function toPublicUser(user: User): PublicUser {
  const {
    passwordHash: _passwordHash,
    providerUserId: _providerUserId,
    ...publicUser
  } = user;

  void _passwordHash;
  void _providerUserId;

  return publicUser;
}

export function toPublicUsers(users: User[]): PublicUser[] {
  return users.map(toPublicUser);
}

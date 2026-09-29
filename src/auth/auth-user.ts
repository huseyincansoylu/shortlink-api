import type { PublicUser } from '../users/users.service.js';

export type AuthUser = Pick<PublicUser, 'id' | 'email' | 'role'>;

export type AuthTokens = { accessToken: string; refreshToken: string };

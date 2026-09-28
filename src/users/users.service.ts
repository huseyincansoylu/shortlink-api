import { ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'argon2';
import { Prisma, type User } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(email: string, password: string): Promise<PublicUser> {
    const passwordHash = await hash(password);

    try {
      return await this.prisma.user.create({
        data: { email, passwordHash },
        omit: { passwordHash: true },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(`Email ${email} is already registered`);
      }
      throw error;
    }
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import type { Prisma } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import type { AuthUser } from './auth-user.js';
import { REFRESH_TOKEN_TTL_DAYS } from './auth.constants.js';

@Injectable()
export class RefreshTokensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: number,
    db: Prisma.TransactionClient = this.prisma,
  ): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_TTL_DAYS);

    await db.refreshToken.create({
      data: { userId, tokenHash: this.hash(token), expiresAt },
    });

    return token;
  }

  async rotate(token: string): Promise<{ user: AuthUser; token: string }> {
    const result = await this.prisma.$transaction(async (tx) => {
      const record = await this.findByToken(token, tx);

      if (!record || record.expiresAt < new Date()) {
        return null;
      }

      const { count } = await tx.refreshToken.updateMany({
        where: { id: record.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (count === 0) {
        await tx.refreshToken.updateMany({
          where: { userId: record.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        return null;
      }

      const newToken = await this.create(record.userId, tx);

      return { user: record.user, token: newToken };
    });

    if (!result) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return result;
  }

  async revoke(token: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: this.hash(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private findByToken(
    token: string,
    db: Prisma.TransactionClient = this.prisma,
  ) {
    return db.refreshToken.findUnique({
      where: { tokenHash: this.hash(token) },
      include: { user: { select: { id: true, email: true, role: true } } },
    });
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}

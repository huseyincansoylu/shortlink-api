import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { PublicUser, UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import type { AuthTokens, AuthUser } from './auth-user.js';
import { PASSWORD_MAX_LENGTH } from './auth.constants.js';
import { RefreshTokensService } from './refresh-tokens.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    private readonly refreshTokens: RefreshTokensService,
  ) {}

  register(dto: RegisterDto): Promise<PublicUser> {
    return this.users.create(dto.email, dto.password);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<PublicUser | null> {
    if (password.length > PASSWORD_MAX_LENGTH) {
      return null;
    }

    const user = await this.users.findByEmail(email);

    if (!user || !(await verify(user.passwordHash, password))) {
      return null;
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async login(user: AuthUser): Promise<AuthTokens> {
    const accessToken = await this.signAccessToken(user);
    const refreshToken = await this.refreshTokens.create(user.id);
    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const rotated = await this.refreshTokens.rotate(refreshToken);
    const accessToken = await this.signAccessToken(rotated.user);
    return { accessToken, refreshToken: rotated.token };
  }

  logout(refreshToken: string): Promise<void> {
    return this.refreshTokens.revoke(refreshToken);
  }

  private signAccessToken(user: AuthUser): Promise<string> {
    return this.jwt.signAsync({ sub: user.id, email: user.email });
  }
}

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { verify } from 'argon2';
import { PublicUser, UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  register(dto: RegisterDto): Promise<PublicUser> {
    return this.users.create(dto.email, dto.password);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<PublicUser | null> {
    const user = await this.users.findByEmail(email);

    if (!user || !(await verify(user.passwordHash, password))) {
      return null;
    }

    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async login(user: PublicUser): Promise<{ accessToken: string }> {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}

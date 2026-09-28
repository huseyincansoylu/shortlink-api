import { Injectable } from '@nestjs/common';
import { PublicUser, UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  register(dto: RegisterDto): Promise<PublicUser> {
    return this.users.create(dto.email, dto.password);
  }
}

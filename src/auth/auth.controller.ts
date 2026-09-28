import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import type { PublicUser } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<PublicUser> {
    return this.auth.register(dto);
  }
}

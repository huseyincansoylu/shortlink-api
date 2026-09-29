import { Controller, Get } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator.js';
import { UsersService, type PublicUser } from './users.service.js';

@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(): Promise<PublicUser[]> {
    return this.usersService.findAll();
  }
}

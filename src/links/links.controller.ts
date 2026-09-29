import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import {
  LinksService,
  type ClickPage,
  type LinkWithClickCount,
} from './links.service.js';
import { CreateLinkDto } from './dto/create-link.dto.js';
import type { Link } from '../generated/prisma/client.js';
import { ParseLimitPipe } from '../common/pipes/parse-limit.pipe.js';

import { Public } from '../common/decorators/public.decorator.js';
import { ClientIp } from '../common/decorators/client-ip.decorator.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import type { AuthUser } from '../auth/auth-user.js';

@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @Public()
  @Get()
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe, ParseLimitPipe)
    limit: number,
  ): Promise<Link[]> {
    return this.linksService.findAll(limit);
  }

  @Public()
  @Get(':code')
  findOne(@Param('code') code: string): Promise<LinkWithClickCount> {
    return this.linksService.findDetails(code);
  }

  @Public()
  @Get(':code/clicks')
  findClicks(
    @Param('code') code: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe, ParseLimitPipe)
    limit: number,
    @Query('cursor', new ParseIntPipe({ optional: true }))
    cursor?: number,
  ): Promise<ClickPage> {
    return this.linksService.findClicks(code, limit, cursor);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('code') code: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.linksService.remove(code, user.id);
  }

  @Post()
  create(
    @Body() dto: CreateLinkDto,
    @CurrentUser() user: AuthUser,
    @ClientIp() ip: string,
  ): Promise<Link> {
    return this.linksService.create(dto.url, user.id, ip);
  }
}

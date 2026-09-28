import { Controller, Get, Param, Redirect } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator.js';
import { LinksService } from '../links/links.service.js';
import { SkipTransform } from '../common/decorators/skip-transform.decorator.js';

@Public()
@Controller()
export class RedirectController {
  constructor(private readonly linksService: LinksService) {}

  @Get(':code')
  @Redirect()
  @SkipTransform()
  async redirect(@Param('code') code: string): Promise<{ url: string }> {
    return { url: await this.linksService.resolve(code) };
  }
}

import { Module } from '@nestjs/common';
import { LinksModule } from '../links/links.module.js';
import { RedirectController } from './redirect.controller.js';

@Module({
  imports: [LinksModule],
  controllers: [RedirectController],
})
export class RedirectModule {}

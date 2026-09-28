import { Controller, Get } from '@nestjs/common';
import { AppService, type AppStatus } from './app.service.js';
import { Public } from './common/decorators/public.decorator.js';

@Controller()
@Public()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getStatus(): AppStatus {
    return this.appService.getStatus();
  }
}

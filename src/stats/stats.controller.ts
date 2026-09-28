import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service.js';
import { Public } from '../common/decorators/public.decorator.js';

@Controller('stats')
@Public()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get()
  getSummary(): Promise<{ totalLinks: number }> {
    return this.statsService.getSummary();
  }
}

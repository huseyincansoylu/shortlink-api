import { Injectable } from '@nestjs/common';
import { LinksService } from '../links/links.service.js';

@Injectable()
export class StatsService {
  constructor(private readonly linksService: LinksService) {}

  async getSummary(): Promise<{ totalLinks: number }> {
    return { totalLinks: await this.linksService.count() };
  }
}

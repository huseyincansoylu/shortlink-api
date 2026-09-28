import { Test, TestingModule } from '@nestjs/testing';
import { StatsService } from './stats.service.js';
import { LinksService } from '../links/links.service.js';

describe('StatsService', () => {
  let service: StatsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: LinksService, useValue: { count: async () => 3 } },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
  });

  it('wraps link count in summary', async () => {
    expect(await service.getSummary()).toEqual({ totalLinks: 3 });
  });
});

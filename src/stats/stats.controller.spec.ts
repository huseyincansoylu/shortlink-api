import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller.js';
import { StatsService } from './stats.service.js';

describe('StatsController', () => {
  let controller: StatsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        {
          provide: StatsService,
          useValue: { getSummary: () => ({ totalLinks: 5 }) },
        },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
  });

  it('returns summary from service', () => {
    expect(controller.getSummary()).toEqual({ totalLinks: 5 });
  });
});

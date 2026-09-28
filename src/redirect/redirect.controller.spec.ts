import { Test, TestingModule } from '@nestjs/testing';
import { RedirectController } from './redirect.controller.js';
import { LinksService } from '../links/links.service.js';

describe('RedirectController', () => {
  let controller: RedirectController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RedirectController],
      providers: [{ provide: LinksService, useValue: {} }],
    }).compile();

    controller = module.get<RedirectController>(RedirectController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

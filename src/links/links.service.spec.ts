import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { NotFoundException } from '@nestjs/common';

describe('LinksService', () => {
  let service: LinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        {
          provide: PrismaService,
          useValue: { link: { findUnique: async () => null } },
        },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
  });

  it('throws NotFoundException when link does not exist', async () => {
    await expect(service.findByCode('yok')).rejects.toThrow(NotFoundException);
  });
});

import { Injectable, NotFoundException } from '@nestjs/common';
import type { Click, Link } from '../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';

export type LinkWithClickCount = Link & { _count: { clicks: number } };

export type ClickPage = { items: Click[]; nextCursor: number | null };

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  count(): Promise<number> {
    return this.prisma.link.count();
  }

  findAll(limit: number): Promise<LinkWithClickCount[]> {
    return this.prisma.link.findMany({
      take: limit,
      include: { _count: { select: { clicks: true } } },
    });
  }

  async findByCode(code: string): Promise<Link> {
    const link = await this.prisma.link.findUnique({ where: { code } });

    if (!link) {
      throw new NotFoundException(`Link ${code} not found`);
    }
    return link;
  }

  async findDetails(code: string): Promise<LinkWithClickCount> {
    const link = await this.prisma.link.findUnique({
      where: { code },
      include: { _count: { select: { clicks: true } } },
    });

    if (!link) {
      throw new NotFoundException(`Link ${code} not found`);
    }
    return link;
  }

  async findClicks(
    code: string,
    limit: number,
    cursor?: number,
  ): Promise<ClickPage> {
    const link = await this.findByCode(code);

    const items = await this.prisma.click.findMany({
      where: {
        linkId: link.id,
        ...(cursor !== undefined && { id: { gt: cursor } }),
      },
      orderBy: { id: 'asc' },
      take: limit,
    });

    const nextCursor =
      items.length === limit ? items[items.length - 1].id : null;
    return { items, nextCursor };
  }

  async resolve(code: string): Promise<string> {
    const link = await this.findByCode(code);
    const createClick = this.prisma.click.create({ data: { linkId: link.id } });
    const updateLink = this.prisma.link.update({
      where: { id: link.id },
      data: { lastClickedAt: new Date() },
    });
    await this.prisma.$transaction([createClick, updateLink]);
    return link.url;
  }

  async remove(code: string): Promise<void> {
    const link = await this.findByCode(code);
    await this.prisma.link.delete({ where: { id: link.id } });
  }

  create(url: string, ip: string): Promise<Link> {
    const code = Math.random().toString(36).slice(2, 8);
    return this.prisma.link.create({
      data: { code, url, createdByIp: ip },
    });
  }
}

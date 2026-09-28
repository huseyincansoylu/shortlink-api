import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseLimitPipe implements PipeTransform<number, number> {
  transform(value: number): number {
    if (value < 1 || value > 100) {
      throw new BadRequestException('limit must be between 1 and 100');
    }

    return value;
  }
}

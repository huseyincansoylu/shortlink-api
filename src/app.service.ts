import { Injectable } from '@nestjs/common';

export type AppStatus = { name: string; status: 'ok' };

@Injectable()
export class AppService {
  getStatus(): AppStatus {
    return { name: 'shortlink', status: 'ok' };
  }
}

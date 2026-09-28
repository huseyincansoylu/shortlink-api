import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LinksModule } from './links/links.module.js';
import { StatsModule } from './stats/stats.module.js';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { RedirectModule } from './redirect/redirect.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtAuthGuard } from './auth/jwt-auth.guard.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LinksModule,
    StatsModule,
    UsersModule,
    AuthModule,
    RedirectModule,
  ],
  controllers: [AppController],
  providers: [AppService, { provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}

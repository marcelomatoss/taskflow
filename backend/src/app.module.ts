import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { TasksModule } from './tasks/tasks.module.js';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 30000,
      max: 100,
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TasksModule,
  ],
})
export class AppModule {}

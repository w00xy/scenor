import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { UsersModule } from './users/users.module.js';
import { ProfilesModule } from './profiles/profiles.module.js';
import { ProjectsModule } from './projects/projects.module.js';
import { WorkflowsModule } from './workflows/workflows.module.js';
import { NodeTypesModule } from './node-types/node-types.module.js';
import { ExecutionsModule } from './executions/executions.module.js';
import { CredentialsModule } from './credentials/credentials.module.js';
import { WorkflowSharesModule } from './workflow-shares/workflow-shares.module.js';
import { getEnvFilePaths, validateEnv } from './config/env.config.js';
import { InitializationModule } from './initialization/initialization.module.js';
import { LoggerMiddleware } from './common/middleware/logger.middleware.js';
import { AdminModule } from './admin/admin.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: getEnvFilePaths(),
      validate: validateEnv,
    }),
    DatabaseModule,
    UsersModule,
    ProfilesModule,
    ProjectsModule,
    WorkflowsModule,
    NodeTypesModule,
    ExecutionsModule,
    CredentialsModule,
    WorkflowSharesModule,
    InitializationModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}

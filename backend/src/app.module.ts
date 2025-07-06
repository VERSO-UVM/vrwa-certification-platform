import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DrizzleModule } from './database/drizzle.module';

@Module({
  imports: [AuthModule, DrizzleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DrizzleModule } from 'src/database/drizzle.module';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { SessionStrategy } from './session.strategy';

@Module({
  imports: [ConfigModule, DrizzleModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, SessionStrategy],
})
export class AuthModule {}

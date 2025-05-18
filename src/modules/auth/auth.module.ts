import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { RedisModule } from 'src/common/redis/redis.module';
import { MailerModule } from 'src/common/mailer/mailer.module';

@Module({
  imports: [RedisModule, MailerModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}

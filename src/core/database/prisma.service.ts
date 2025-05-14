import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger('Database');
  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected!');
    } catch (error) {
      this.logger.error(error.message);
      process.exit(1);
    }
  }
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('Successfully disconnected!');
    } catch (error) {
      this.logger.error(error.message);
      process.exit(1);
    }
  }
}

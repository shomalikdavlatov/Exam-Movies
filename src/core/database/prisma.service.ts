import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const logger = new Logger('Database');

export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      logger.log('Successfully connected!');
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  }
  async onModuleDestroy() {
    try {
      await this.$disconnect();
      logger.log('Successfully disconnected!');
    } catch (error) {
      logger.error(error.message);
      process.exit(1);
    }
  }
}

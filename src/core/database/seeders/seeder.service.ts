import { forwardRef, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import bcrypt from 'bcrypt';

export class SeederService implements OnModuleInit {
  private readonly logger = new Logger('Seeder');
  constructor(
    @Inject(forwardRef(() => PrismaService)) private prisma: PrismaService,
  ) {}
  async seedAll() {
    await this.seedUsers();
  }
  async seedUsers() {
    const username = process.env.SUPERADMIN_USERNAME;
    const password = process.env.SUPERADMIN_PASSWORD;
    const email = process.env.SUPERADMIN_EMAIL;
    const superadminUser = await this.prisma.user.findFirst({
      where: { username },
    });

    if (!superadminUser) {
      this.logger.log('Superadmin created');
      const hashedPassword = await bcrypt.hash(password!, +!process.env.HASH);
      await this.prisma.user.create({
        data: {
          username: username!,
          password_hash: hashedPassword,
          email: email!,
          role: 'superadmin',
        },
      });
    }
  }
  async onModuleInit() {
    try {
      await this.seedAll();
    } catch (error) {
      this.logger.error(error.message);
      process.exit(1);
    }
  }
}

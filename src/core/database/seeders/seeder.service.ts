import { forwardRef, Inject, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import bcrypt from 'bcrypt';

export class SeederService implements OnModuleInit {
  private readonly logger = new Logger('Seeder');
  constructor(
    @Inject(forwardRef(() => PrismaService)) private prisma: PrismaService,
  ) {}
  async seedAll() {
    await this.seedPlans();
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
      const hashedPassword = await bcrypt.hash(password!, +!process.env.HASH);
      const superadmin = await this.prisma.user.create({
        data: {
          username: username!,
          password_hash: hashedPassword,
          email: email!,
          role: 'superadmin',
        },
      });
      const adminPlan = await this.prisma.subscriptionPlan.findFirst({
        where: { name: 'Admin' },
      });
      await this.prisma.userSubscription.create({
        data: {
          user_id: superadmin.id,
          plan_id: adminPlan!.id,
          status: 'active',
        },
      });
      this.logger.log('Superadmin created!');
    }
  }
  async seedPlans() {
    const freePlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: 'Free' },
    });
    const adminPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: 'Admin' },
    });
    if (!freePlan) {
      await this.prisma.subscriptionPlan.create({
        data: {
          name: 'Free',
          price: 0,
          duration_days: null,
          features: ['Free plan for everyone'],
          is_active: true,
        },
      });
      this.logger.log('Free plan created!');
    }
    if (!adminPlan) {
      await this.prisma.subscriptionPlan.create({
        data: {
          name: 'Admin',
          price: 0,
          duration_days: null,
          features: ['Premium plan for admins'],
          is_active: true,
        },
      });
      this.logger.log('Admin plan created!');
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

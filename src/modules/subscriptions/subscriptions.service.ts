import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { SubscriptionPlanDto } from './dto/subscription.plan.dto';
import { PurchaseDto } from './dto/purchase.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}
  async getAll() {
    return await this.prisma.subscriptionPlan.findMany({
      where: { NOT: { name: 'Admin' } },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
      },
    });
  }
  async create(body: SubscriptionPlanDto) {
    console.log(body);
    return await this.prisma.subscriptionPlan.create({
      data: {
        ...body,
        is_active: body.is_active === undefined ? true : body.is_active,
      },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
      },
    });
  }
  async changeStatus(id: string, is_active: boolean) {
    const subscriptionPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { id },
    });
    if (!subscriptionPlan)
      throw new NotFoundException(
        'Subscription plan with the specified id not found',
      );
    return await this.prisma.subscriptionPlan.update({
      where: { id },
      data: { is_active },
      select: {
        id: true,
        name: true,
        price: true,
        duration_days: true,
        features: true,
      },
    });
  }
  async purchase(userId: string, body: PurchaseDto) {
    const subscriptionPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: body.plan_id },
    });
    if (!subscriptionPlan)
      throw new NotFoundException(
        'Subscription plan with the specified id not found!',
      );
    const date = new Date();
    date.setTime(
      date.getTime() + subscriptionPlan!.duration_days! * 24 * 60 * 60 * 1000,
    );
    const userSubscription = await this.prisma.userSubscription.create({
      data: {
        end_date: date,
        status: 'pending_payment',
        auto_renew: body.auto_renew ? body.auto_renew : false,
        user_id: userId,
        plan_id: body.plan_id,
      },
    });
    const payment = await this.prisma.payment.create({
      data: {
        amount: subscriptionPlan.price,
        payment_method: body.payment_method,
        payment_details: body.payment_details,
        status: 'completed',
        external_transfer_id: '',
        user_subscription_id: userSubscription.id,
      },
    });
    await this.prisma.userSubscription.update({
      where: { id: userSubscription.id },
      data: { status: 'active' },
    });
    return {
      subscription: {
        id: userSubscription.id,
        plan: {
          id: subscriptionPlan.id,
          name: subscriptionPlan.name,
        },
        start_date: userSubscription.start_date,
        end_date: userSubscription.end_date,
        status: userSubscription.status,
        auto_renew: userSubscription.auto_renew,
      },
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        external_transfer_id: payment.external_transfer_id,
        payment_method: payment.payment_method,
      },
    };
  }
}

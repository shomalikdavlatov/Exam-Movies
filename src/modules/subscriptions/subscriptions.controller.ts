import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { SubscriptionPlanDto } from './dto/subscription.plan.dto';
import { PurchaseDto } from './dto/purchase.dto';
import { Request } from 'express';

@Controller('subscription')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}
  @Get('plans')
  @SetMetadata('isFreeAuth', true)
  async getAll() {
    return await this.subscriptionsService.getAll();
  }
  @Post('plans')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  async create(@Body() body: SubscriptionPlanDto) {
    return await this.subscriptionsService.create(body);
  }
  @Put('plans/:id/activate')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  async activatePlan(@Param('id') id: string) {
    return await this.subscriptionsService.changeStatus(id, true);
  }
  @Put('plans/:id/deactivate')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  async deactivatePlan(@Param('id') id: string) {
    return await this.subscriptionsService.changeStatus(id, false);
  }
  @Post('purchase')
  async purchase(@Req() req: Request, @Body() body: PurchaseDto) {
    return {
      message: 'The subscription purchased successfully!',
      data: await this.subscriptionsService.purchase(req['user'].userId, body),
    };
  }
}

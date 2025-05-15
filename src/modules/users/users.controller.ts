import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { RoleGuard } from 'src/common/guards/role.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Get()
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin'])
  async getAll(@Query('role') role: any) {
    let result: object;
    if (role && (role === 'admin' || role === 'user'))
      result = await this.usersService.getAll(role);
    else result = await this.usersService.getAll();
    return result;
  }
  @Get(':id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin', 'admin', 'owner'])
  async getOne(@Param('id') id: string) {
    const user = await this.usersService.getOne(id);
    // @ts-ignore
    delete user.password_hash;
    for (const key in user) if (!user[key]) delete user[key];
    return user;
  }
  @Put('promote/:id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  async promote(@Param('id') id: string) {
    return await this.usersService.promote(id);
  }
  @Put('demote/:id')
  @UseGuards(RoleGuard)
  @SetMetadata('roles', ['superadmin'])
  async demote(@Param('id') id: string) {
    return await this.usersService.demote(id);
  }
}

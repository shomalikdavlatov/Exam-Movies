import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async getAll(role?: 'admin' | 'user') {
    if (role)
      return await this.prisma.user.findMany({
        where: { role: role },
        select: {
          id: true,
          username: true,
          email: true,
          avatar_url: true,
          created_at: true,
        },
      });
    return await this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        avatar_url: true,
        created_at: true,
      },
    });
  }
  async getOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new NotFoundException('User with the specified id not found!');
    return user;
  }
  async promote(id: string) {
    const superadmin = await this.prisma.user.findFirst({
      where: { role: 'superadmin' },
    });
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new NotFoundException('User with the specified id not found!');
    if (user.id === superadmin!.id)
      throw new ConflictException(
        'You can not set superadmin to admin as there must be a superadmin all the time!',
      );
    await this.prisma.user.update({
      where: { id },
      data: { role: 'admin' },
    });
    return {
      message: "User's role has been promoted!",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'admin',
      },
    };
  }
  async demote(id: string) {
    const superadmin = await this.prisma.user.findFirst({
      where: { role: 'superadmin' },
    });
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new NotFoundException('User with the specified id not found!');
    if (user.id === superadmin!.id)
      throw new ConflictException(
        'You can not set superadmin to user as there must be a superadmin all the time!',
      );
    await this.prisma.user.update({
      where: { id },
      data: { role: 'user' },
    });
    return {
      message: "User's role has been demoted!",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: 'user',
      },
    };
  }
}

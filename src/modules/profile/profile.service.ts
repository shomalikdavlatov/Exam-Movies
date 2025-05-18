import { Injectable } from '@nestjs/common';
import { deleteFile } from 'src/common/utils/file.util';
import { PrismaService } from 'src/core/database/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private prisma: PrismaService) {}
  async getProfile(id: string) {
    const user = await this.prisma.user.findFirst({ where: { id } });
    return {
      data: {
        user_id: user!.id,
        full_name: user!.full_name,
        phone: user!.phone,
        country: user!.country,
        created_at: user!.created_at,
        avatar_url: user!.avatar_url,
      },
    };
  }
  async updateProfile(id: string, body: any, avatar: any) {
    const user = await this.prisma.user.findFirst({ where: { id } });

    if (avatar) {
      if (user!.avatar_url) deleteFile(user!.avatar_url);
      body.avatar_url = avatar.path;
    }
    for (const key in body) {
      if (body[key] === undefined) delete body[key];
    }
    return await this.prisma.user.update({
      where: { id },
      data: body,
    });
  }
}

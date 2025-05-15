import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from './dto/update.profile.dto';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}
  @Get()
  async getProfile(@Req() req: Request) {
    return this.profileService.getProfile(req['userId']);
  }
  @Put()
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: Request,
    @Body() body: UpdateProfileDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const result = await this.profileService.updateProfile(
      req['user']['userId'],
      body,
      avatar,
    );
    result['message'] = 'Profile updated successfully!';
    for (const key in result) {
      if (
        !['user_id', 'full_name', 'phone', 'country', 'updated_at'].includes(
          key,
        ) ||
        !result[key]
      )
        delete result[key];
    }
    return result;
  }
}

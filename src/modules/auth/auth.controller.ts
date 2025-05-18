import {
  Body,
  Controller,
  Post,
  Res,
  SetMetadata,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @SetMetadata('isFreeAuth', true)
  @UseInterceptors(FileInterceptor('avatar'))
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const { token, ...result } = await this.authService.register(body, avatar);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 4 * 60 * 60 * 1000 + 10000,
    });
    return result;
  }
  @Post('login')
  @SetMetadata('isFreeAuth', true)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, ...result } = await this.authService.login(body);
    res.cookie('jwt', token, {
      httpOnly: true,
      maxAge: 4 * 60 * 60 * 1000 + 10000,
    });
    return result;
  }
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('jwt');
    return { message: 'Logged out successfully!' };
  }
}

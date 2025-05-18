import { Body, Controller, Post, Res, SetMetadata } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';
import { VerificationDto } from './dto/verification.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @SetMetadata('isFreeAuth', true)
  async register(@Body() body: RegisterDto) {
    return await this.authService.register(body);
  }
  @Post('verify')
  @SetMetadata('isFreeAuth', true)
  async verify(
    @Body() body: VerificationDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { token, ...result } = await this.authService.verify(body);
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

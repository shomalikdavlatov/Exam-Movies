import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { RedisService } from 'src/common/redis/redis.service';
import { MailerService } from 'src/common/mailer/mailer.service';
import { VerificationDto } from './dto/verification.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private redis: RedisService,
    private mailer: MailerService,
  ) {}
  async register(body: RegisterDto) {
    const userUsername = await this.prisma.user.findFirst({
      where: {
        username: body.username,
      },
    });
    if (userUsername)
      throw new ConflictException(
        'There is already a user with a specified username!',
      );
    const userEmail = await this.prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });
    if (userEmail)
      throw new ConflictException(
        'There is already a user with a specified email!',
      );
    const code = Math.floor(100000 + Math.random() * 900000);
    await this.mailer.sendVerificationCode(
      body.email,
      'Verification code',
      code,
    );
    await this.redis.set(
      `verify:${body.email}`,
      JSON.stringify({ ...body, code }),
      600,
    );
    return {
      message: `Verification code sent to ${body.email}. You have 10 minutes to verify your account or all information will be deleted!`,
    };
  }
  async verify(body: VerificationDto) {
    const stored = await this.redis.get(`verify:${body.email}`);
    if (!stored) throw new BadRequestException('Code expired or not found!');
    const userData = JSON.parse(stored);
    if (userData.code != body.code)
      throw new BadRequestException('Invalid code!');
    await this.redis.del(`verify:${body.email}`);
    const userUsername = await this.prisma.user.findFirst({
      where: {
        username: userData.username,
      },
    });
    if (userUsername)
      throw new ConflictException(
        'There is already a user with a specified username!',
      );
    const userEmail = await this.prisma.user.findFirst({
      where: {
        email: userData.email,
      },
    });
    if (userEmail)
      throw new ConflictException(
        'There is already a user with a specified email!',
      );
    if (!process.env.HASH) throw new InternalServerErrorException();
    const hashedPassword = await bcrypt.hash(
      userData.password,
      +process.env.HASH,
    );
    const { code, password, ...rest } = userData;
    const user = {
      ...rest,
      password_hash: hashedPassword,
    };
    const userResponse = await this.prisma.user.create({ data: user });
    const freePlan = await this.prisma.subscriptionPlan.findFirst({
      where: { name: 'Free' },
    });
    await this.prisma.userSubscription.create({
      data: {
        user_id: userResponse.id,
        plan_id: freePlan!.id,
        status: 'active',
      },
    });
    const token = await this.jwtService.signAsync({
      userId: userResponse.id,
      userRole: userResponse.role,
    });
    return {
      token,
      message: 'Registered successfully!',
      data: {
        user_id: userResponse.id,
        username: userResponse.username,
        role: userResponse.role,
        created_at: userResponse.created_at,
      },
    };
  }
  async login(body: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: body.email,
      },
    });
    if (!user)
      throw new UnauthorizedException('Email or password is incorrect!');
    const checkPassword = await bcrypt.compare(
      body.password,
      user.password_hash,
    );
    if (!checkPassword)
      throw new UnauthorizedException('Email or password is incorrect!');
    const token = await this.jwtService.signAsync({
      userId: user.id,
      userRole: user.role,
    });
    const userSubscription = await this.prisma.userSubscription.findFirst({
      where: { user_id: user.id, status: 'active' },
    });
    const userPlan = await this.prisma.subscriptionPlan.findFirst({
      where: { id: userSubscription?.plan_id },
    });
    return {
      token,
      message: 'Logged in successfully!',
      data: {
        user_id: user.id,
        username: user.username,
        role: user.role,
        subscription: {
          plan_name: userPlan!.name,
          expires_at: userSubscription!.end_date,
        },
      },
    };
  }
}

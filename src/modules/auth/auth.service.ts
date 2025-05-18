import {
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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}
  async register(body: RegisterDto, avatar: object | undefined) {
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
    if (!process.env.HASH) throw new InternalServerErrorException();
    const hashedPassword = await bcrypt.hash(body.password, +process.env.HASH);
    const { password, ...rest } = body;
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
        avatar_url: avatar ? avatar['path'] : null,
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

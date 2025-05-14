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
    if (!process.env.HASH) throw new InternalServerErrorException();
    const hashedPassword = await bcrypt.hash(body.password, +process.env.HASH);
    // @ts-ignore
    delete body.password;
    const user = {
      ...body,
      password_hash: hashedPassword,
    };
    const userResponse = await this.prisma.user.create({ data: user });
    const token = await this.jwtService.signAsync({
      userId: userResponse.id,
      userRole: userResponse.role,
    });
    return token;
  }
  async login(body: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        username: body.username,
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
    return token;
  }
}

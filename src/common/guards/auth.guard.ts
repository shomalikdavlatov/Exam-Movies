import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const handler = context.getHandler();
    if (this.reflector.get('isFreeAuth', handler)) return true;
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['jwt'];
    try {
      const { userId, userRole } = await this.jwtService.verifyAsync(token);
      request.user = { userId, userRole };
      return true;
    } catch (error) {
      throw new ForbiddenException('Token is invalid!');
    }
  }
}

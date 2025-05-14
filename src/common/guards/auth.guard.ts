import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
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

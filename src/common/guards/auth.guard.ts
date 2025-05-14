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
    const token = request.headers['authorization']?.split()[1];
    try {
      const { userId, userRole } = await this.jwtService.verifyAsync(token);
      request.userId = userId;
      request.userRole = userRole;
      return true;
    } catch (error) {
      throw new ForbiddenException('Token is invalid!');
    }
  }
}

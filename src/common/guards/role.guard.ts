import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const handler = context.getHandler();
    const roles = this.reflector.get('roles', handler);
    if (roles.includes(request.user.userRole)) return true;
    if (roles.includes('owner') && request.params.id === request.user.userId)
      return true;
    throw new ForbiddenException('Role required!');
  }
}

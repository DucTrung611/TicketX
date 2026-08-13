import {
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { CurrentUserPayload } from '../decorators/current-user.decorator';

@Injectable()
export class RolesGuard {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: CurrentUserPayload }>();

    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        code: 'AUTH_004',
        message: 'Role not permitted for this action',
      });
    }

    return true;
  }
}

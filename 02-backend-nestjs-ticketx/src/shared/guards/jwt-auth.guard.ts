import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = unknown>(
    err: unknown,
    user: TUser,
    info: { name?: string } | undefined,
  ): TUser {
    if (err || !user) {
      const isExpired = info?.name === 'TokenExpiredError';
      throw new UnauthorizedException({
        code: isExpired ? 'AUTH_002' : 'AUTH_003',
        message: isExpired
          ? 'Access token expired'
          : 'Access token missing or malformed',
      });
    }
    return user;
  }
}

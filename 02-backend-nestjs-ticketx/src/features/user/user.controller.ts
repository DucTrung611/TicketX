import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../shared/decorators/current-user.decorator';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@CurrentUser() currentUser: CurrentUserPayload) {
    const user = await this.userService.findByIdOrThrow(currentUser.sub);
    return this.userService.toResponseDto(user);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.userService.updateProfile(currentUser.sub, dto);
    return this.userService.toResponseDto(user);
  }

  @Patch('me/password')
  async changePassword(
    @CurrentUser() currentUser: CurrentUserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.userService.changePassword(currentUser.sub, dto);
    return { message: 'Password updated' };
  }
}

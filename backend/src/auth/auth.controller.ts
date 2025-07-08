import {
  Controller,
  Delete,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Res,
  UsePipes,
  UseGuards,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { LoginDto, RegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from 'nestjs-zod';
import { SessionGuard } from './session.guard';
import { User } from './user.decorator';
import { SessionUser } from 'src/database/schema';

@UsePipes(ZodValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  @UseGuards(SessionGuard)
  async getMe(@User() user: SessionUser) {
    const orgName =
      user.user.orgId !== null
        ? (await this.authService.getOrganization(user.user.orgId)).orgDetails
            .orgName
        : null;
    return {
      firstName: user.user.firstName,
      lastName: user.user.lastName,
      email: user.user.email,
      orgName,
    };
  }

  @Post('login')
  async login(
    @Body() loginDetails: LoginDto,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const user = await this.authService.validateLoginRequest(
      loginDetails.email,
      loginDetails.password,
    );

    if (user === null) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const session = await this.authService.issueSessionToken(user.id);
    await res.setCookie(this.authService.SessionCookieName, session.id, {
      httpOnly: true,
      expires: session.expiresAt,
      sameSite: 'lax',
    });
  }

  @Post('register')
  async register(@Body() regDetails: RegisterDto) {
    const r = await this.authService.registerExistingUser(regDetails);
    if (r) {
      return { success: true };
    }
    throw new HttpException(
      'Failed to register',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Delete('logout')
  @UseGuards(SessionGuard)
  async logout(
    @Res({ passthrough: true }) res: FastifyReply,
    @User() user: SessionUser,
  ) {
    await this.authService.invalidateSessionToken(user.session.id);
    await res.clearCookie(this.authService.SessionCookieName);
  }
}

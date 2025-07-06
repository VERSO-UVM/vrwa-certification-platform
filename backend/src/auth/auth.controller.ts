import {
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Body,
  HttpException,
  HttpStatus,
  Res,
  UsePipes,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { LoginDto } from './auth.dto';
import { AuthService } from './auth.service';
import { SESSION_COOKIE_NAME } from 'src/constants';
import { ZodValidationPipe } from 'nestjs-zod';

@UsePipes(ZodValidationPipe)
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('me')
  async getMe() {}

  @Get('session')
  async getSession() {}

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
    // TODO: Figure out __Secure prefix and cookie expiry
    await res.setCookie(SESSION_COOKIE_NAME, session.id);
  }

  @Delete('logout')
  async logout(@Res({ passthrough: true }) res: FastifyReply) {
    await res.clearCookie(SESSION_COOKIE_NAME);
  }
}

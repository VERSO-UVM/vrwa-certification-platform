import { Controller, Delete, Get, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  constructor() {}

  @Get('me')
  async getMe() {}

  @Get('session')
  async getSession() {}

  @Post('login')
  async login() {}

  @Delete('logout')
  async logout() {}
}

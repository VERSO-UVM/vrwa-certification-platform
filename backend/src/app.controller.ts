import { Controller, Get, Render } from '@nestjs/common';
import { AppService } from './app.service';
import { sql } from 'bun';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render("index")
  async root() {
    const registrations = await sql`SELECT * FROM Registrations;`;
    return { registrations };
  }
}

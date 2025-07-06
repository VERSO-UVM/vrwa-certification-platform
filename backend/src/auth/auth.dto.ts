import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// class is required for using DTO as a type
export class LoginDto extends createZodDto(LoginSchema) {}

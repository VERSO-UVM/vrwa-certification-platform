import { Test, TestingModule } from '@nestjs/testing';
import { drizzleProvider as Drizzle } from './drizzle.provider';

describe('Drizzle', () => {
  let provider: typeof Drizzle;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Drizzle],
    }).compile();

    // FIXME
    // @ts-expect-error types don't match and idk why
    provider = module.get<typeof Drizzle>(Drizzle);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});

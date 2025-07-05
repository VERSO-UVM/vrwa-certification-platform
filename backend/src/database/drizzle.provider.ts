import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { ConfigService } from '@nestjs/config';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Provider } from '@nestjs/common';

export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';

export type DrizzleProviderReturn = {
  client: NodePgDatabase<typeof schema>;
  schema: typeof schema;
};

export const drizzleProvider = {
  provide: DrizzleAsyncProvider,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');

    const pool = new Pool({
      connectionString,
    });

    const client = drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;

    return { client, schema } satisfies DrizzleProviderReturn;
  },
} satisfies Provider;

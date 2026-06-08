import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    let dbPath = 'dev.db';

    // If running in Vercel or production serverless, copy the database to a writable directory (/tmp)
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      const tmpPath = '/tmp/dev.db';
      try {
        if (!fs.existsSync(tmpPath)) {
          // Look for dev.db in multiple potential locations in the bundled functions
          const possiblePaths = [
            path.join(process.cwd(), 'dev.db'),
            path.join(process.cwd(), 'backend', 'dev.db'),
            path.join(__dirname, '..', '..', 'dev.db'),
            path.join(__dirname, '..', '..', '..', 'dev.db'),
            'dev.db'
          ];
          
          let copied = false;
          for (const srcPath of possiblePaths) {
            if (fs.existsSync(srcPath)) {
              fs.copyFileSync(srcPath, tmpPath);
              console.log(`[PrismaService] Successfully copied bundled database from ${srcPath} to ${tmpPath}`);
              copied = true;
              break;
            }
          }
          if (!copied) {
            console.error('[PrismaService] Could not find source dev.db in any bundled paths.');
          }
        } else {
          console.log(`[PrismaService] SQLite database already present at ${tmpPath}`);
        }
        dbPath = tmpPath;
      } catch (err) {
        console.error('[PrismaService] Error copying database to /tmp:', err);
      }
    }

    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

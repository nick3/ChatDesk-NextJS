import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  console.log('🔌 Connecting to database...');
  console.log(`🔑 Connection string format check: ${
    process.env.POSTGRES_URL.startsWith('postgres://') || 
    process.env.POSTGRES_URL.startsWith('postgresql://') ? 
    '✅' : '❌'
  }`);
  
  try {
    const connection = postgres(process.env.POSTGRES_URL, { 
      prepare: false, 
      max: 1,
      debug: true, // 添加调试信息
    });
    
    console.log('✅ Database connection established');
    const db = drizzle(connection);

    console.log('⏳ Running migrations...');

    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();

    console.log('✅ Migrations completed in', end - start, 'ms');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed');
    console.error('Error details:', error);
    
    if (error.code === '42501') {
      console.error('\n🔐 权限问题: 当前用户没有足够权限执行操作');
      console.error('请确保 chatdesk 用户对 public schema 有完整权限');
    }
    
    process.exit(1);
  }
};

runMigrate();

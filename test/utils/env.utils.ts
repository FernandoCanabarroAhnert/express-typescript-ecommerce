import { execSync } from 'child_process';

export function setTestEnvironmentVariables(postgresUrl: string, redisUrl: string): void {
    process.env.DATABASE_URL = postgresUrl;
    process.env.REDIS_URL = redisUrl;
    process.env.JWT_SECRET = 'secret'
    process.env.ACCESS_TOKEN_DURATION = '86400'
    process.env.REFRESH_TOKEN_DURATION = '2592000'
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'http';

    execSync('npx prisma migrate deploy', { env: { ...process.env } });
}
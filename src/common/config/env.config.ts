import z from "zod";
import { configDotenv } from "dotenv";

configDotenv();

const envSchema = z.object({
    DATABASE_URL: z.string(),
    REDIS_URL: z.string(),
    JWT_SECRET: z.string(),
    ACCESS_TOKEN_DURATION: z.string().transform(Number),
    REFRESH_TOKEN_DURATION: z.string().transform(Number),
    PORT: z.string().transform(Number).default(3000),
    NODE_ENV: z.enum(["dev", "prod", "test"]),
    LOG_LEVEL: z.enum(["info", "warn", "error", "http"]).default("info"),
});

export const env = envSchema.parse(process.env)
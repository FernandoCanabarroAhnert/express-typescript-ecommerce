import { inject, injectable } from "tsyringe";
import { RedisService } from "../../common/services/redis.service";
import { REDIS_SERVICE } from "../../common/constants/services.constants";
import { REFRESH_TOKEN_CACHE_KEY } from "../../common/constants/cache-keys.constants";
import jwt from "jsonwebtoken";

@injectable()
export class RefreshTokenService {

    constructor(
        @inject(REDIS_SERVICE)
        private readonly redisService: RedisService
    ) {}

    async saveRefreshToken(refreshToken: jwt.JwtPayload, tokenValue: string): Promise<void> {
        return await this.redisService.set(`${REFRESH_TOKEN_CACHE_KEY}:${refreshToken.jti}`, tokenValue, 86400 * 30);
    }

    async deleteRefreshToken(jti: string): Promise<void> {
        return await this.redisService.delete(`${REFRESH_TOKEN_CACHE_KEY}:${jti}`);
    }

    async refreshTokenExists(jti: string): Promise<boolean> {
        return this.redisService.hasKey(`${REFRESH_TOKEN_CACHE_KEY}:${jti}`);
    }

}
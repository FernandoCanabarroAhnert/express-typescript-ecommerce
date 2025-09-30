import { inject, injectable } from "tsyringe";
import { REDIS_SERVICE } from "../../common/constants/services.constants";
import { RedisService } from "../../common/services/redis.service";
import jwt from "jsonwebtoken";
import { BLACKLIST_CACHE_KEY } from "../../common/constants/cache-keys.constants";

@injectable()
export class BlacklistTokenService {

    constructor(
        @inject(REDIS_SERVICE)
        private readonly redisService: RedisService
    ) {}

    async addToBlacklist(jwt: jwt.JwtPayload, tokenValue: string): Promise<void> {
        const jti = jwt.jti!;
        const exp = jwt.exp!;
        const accessTokenTimeLeft = exp - Math.floor(Date.now() / 1000);
        return await this.redisService.set(`${BLACKLIST_CACHE_KEY}:${jti}`, tokenValue, accessTokenTimeLeft);
    }

    async isTokenBlacklisted(jti: string): Promise<boolean> {
        return this.redisService.hasKey(`${BLACKLIST_CACHE_KEY}:${jti}`);
    }

}
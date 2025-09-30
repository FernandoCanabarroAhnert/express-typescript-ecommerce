import jwt from 'jsonwebtoken';
import { env } from '../../common/config/env.config';

export class JwtService {

    private readonly JWT_SECRET = env.JWT_SECRET;

    private generateJti() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    encodeAccessToken({ email, authorities }: { email: string; authorities: string[] }): string {
        return jwt.sign({ subject: email, authorities, jti: this.generateJti() }, this.JWT_SECRET, { expiresIn: '1d' });
    }

    encodeRefreshToken(email: string): string {
        return jwt.sign({ subject: email, jti: this.generateJti() }, this.JWT_SECRET, { expiresIn: '30d' });
    }

    isTokenValid(token: string): boolean {
        try {
            jwt.verify(token, this.JWT_SECRET);
            return true;
        } catch {
            return false;
        }
    }

    decodeToken(token: string): jwt.JwtPayload {
        return jwt.decode(token, {
            json: true
        }) as jwt.JwtPayload;
    }

}
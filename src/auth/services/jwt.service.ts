import jwt from 'jsonwebtoken';

export class JwtService {

    private generateJti() {
        return Math.random().toString(36).substring(2) + Date.now().toString(36);
    }

    encodeAccessToken({ email, authorities }: { email: string; authorities: string[] }): string {
        return jwt.sign({ subject: email, authorities, jti: this.generateJti() }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    }

    encodeRefreshToken(email: string): string {
        return jwt.sign({ subject: email, jti: this.generateJti() }, process.env.JWT_SECRET!, { expiresIn: '30d' });
    }

    isTokenValid(token: string): boolean {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
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
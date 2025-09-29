import bcrypt from 'bcryptjs';

export class PasswordService {
   
    async encodePassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

    async passwordMatches(rawPassword: string, hashedPassword: string): Promise<boolean> {
        return await bcrypt.compare(rawPassword, hashedPassword);
    }

}
import request from 'supertest';

export async function obtainAuthToken(app: any, email: string, password: string): Promise<{ accessToken: string, cookies: string[] }> {
    const res = await request(app)
        .post('/auth/login')
        .send({ email, password })
        .expect(200);
    const accessToken = res.body.accessToken;
    const cookies = res.headers['set-cookie'] as any as string[];
    return { accessToken, cookies };
}
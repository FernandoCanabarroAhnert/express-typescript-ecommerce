import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

export type StartContainersResponse = {
    startedPostgresContainer: StartedPostgreSqlContainer;
    startedRedisContainer: StartedTestContainer;
    postgresUrl: string;
    redisUrl: string;
}

export async function startContainers(): Promise<StartContainersResponse> {
    const startedPostgresContainer = await new PostgreSqlContainer('postgres:16')
        .withExposedPorts(5432)
        .withUsername('postgres')
        .withPassword('1234567')
        .withDatabase('products')
        .start();
    const startedRedisContainer = await new GenericContainer('redis:6.2')
        .withExposedPorts(6379)
        .start();
    const postgresUrl = startedPostgresContainer.getConnectionUri();
    const redisUrl = `redis://${startedRedisContainer.getHost()}:${startedRedisContainer.getMappedPort(6379)}`;
    return { startedPostgresContainer, startedRedisContainer, postgresUrl, redisUrl };
}
module.exports = {
    testEnvironment: 'node',
    preset: 'ts-jest',
    testMatch: ['**/?(*.)+(spec|test).ts?(x)', '**/?(*.)+(e2e-spec).ts?(x)'],
    modulePathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/node_modules/'],
};
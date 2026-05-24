/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/__tests__'],
    moduleNameMapper: {
        // Stub out modules that require a native runtime
        'expo-modules-core': '<rootDir>/__mocks__/expo-modules-core.ts',
        'react-native': '<rootDir>/__mocks__/react-native.ts',
    },
    transform: {
        '^.+\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
};

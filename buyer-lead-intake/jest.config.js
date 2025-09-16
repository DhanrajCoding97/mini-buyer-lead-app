/** @type {import('jest').Config} */
const config = {
    testEnvironment: "jsdom",
    transform: {
      "^.+\\.(ts|tsx)$": "ts-jest",
    },
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/$1",
    },
    // ❌ remove setupFilesAfterEnv if you don't have a jest.setup.js
  };
  
  module.exports = config;
  
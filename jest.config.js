/** @type {import('jest').Config} */
module.exports = {
  preset: "jest-expo",
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-paper|react-native-safe-area-context|react-native-screens|react-native-chart-kit|@react-native-async-storage/async-storage)",
  ],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  setupFilesAfterEnv: ["./tests/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@contexts/(.*)$": "<rootDir>/src/contexts/$1",
    "^@hooks/(.*)$": "<rootDir>/src/hooks/$1",
    "^@navigation/(.*)$": "<rootDir>/src/navigation/$1",
    "^@screens/(.*)$": "<rootDir>/src/screens/$1",
    "^@theme/(.*)$": "<rootDir>/src/theme/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@types/(.*)$": "<rootDir>/src/types/$1",
  },
};

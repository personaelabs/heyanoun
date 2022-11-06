module.exports = {
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  setupFilesAfterEnv: ["./tests/setup.js"],
  moduleNameMapper: {
    "fs/promises": "./node_modules/fs-extra/lib/fs",
  },
  collectCoverage: true,
};

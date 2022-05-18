export const workspacePackagejsonTemplate = `{
  "scripts": {
    "lint:fix": "prettier */*.js \\"*/**/*{.js,.ts}\\" -w",
    "lint": "prettier */*.js \\"*/**/*{.js,.ts}\\" --check"
  },
  "dependencies": {
      "@project-serum/anchor": "^0.24.2"
  },
  "devDependencies": {
      "@types/bn.js": "^5.1.0",
      "@types/chai": "^4.3.0",
      "@types/mocha": "^9.0.0",
      "chai": "^4.3.4",
      "mocha": "^9.0.3",
      "prettier": "^2.6.2",
      "ts-mocha": "^9.0.2",
      "typescript": "^4.3.5"
  }
}
`;

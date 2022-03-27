export const __packageJson = `{
  "name": "{{workspaceName.camelCase}}",
  "version": "1.0.0",
  "description": "{{workspaceName.pascalCase}}",
  "scripts": {},
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "@types/chai": "^4.2.22",
    "@types/mocha": "^9.0.0",
    "@types/node": "^16.10.5",
    "chai": "^4.3.4",
    "mocha": "^9.1.2",
    "typescript": "^4.4.4"
  },
  "dependencies": {
    "@project-serum/anchor": "^0.22.1"
  }
}
`;

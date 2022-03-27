export const __test = `import {
  Program,
  web3,
} from '@project-serum/anchor';
import { assert } from 'chai';
import { {{applicationName.pascalCase}} } from '../target/types/{{applicationName.snakeCase}}';
import * as anchor from '@project-serum/anchor';

describe('{{applicationName.pascalCase}}', () => {
  anchor.setProvider(anchor.Provider.env());

  const {{applicationName.camelCase}} = anchor.workspace.{{applicationName.pascalCase}} as Program<{{applicationName.pascalCase}}>;

  it('should initialize counter', async () => {
    // arrange
    // act
    // assert
  });
});
`;

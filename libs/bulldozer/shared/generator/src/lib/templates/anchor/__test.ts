export const __test = `import {
  Provider,
  setProvider,
  web3,
  workspace,
} from '@project-serum/anchor';
import { assert } from 'chai';

describe('{{applicationName.pascalCase}}', () => {
  setProvider(Provider.env());
  const application = workspace.{{applicationName.pascalCase}};
});
`;

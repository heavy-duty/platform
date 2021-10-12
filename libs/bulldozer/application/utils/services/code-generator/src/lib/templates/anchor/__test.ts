export const __test = `import { Provider, setProvider, utils, workspace } from '@project-serum/anchor';
import { assert } from 'chai';

describe('instruction', () => {
  setProvider(Provider.env());
  const application = workspace.{{application.name.pascalCase}};
});
`;

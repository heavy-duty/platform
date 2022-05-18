export const applicationTestTemplate = `
import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { assert } from 'chai';
import { {{name.pascalCase}}, IDL } from '../target/types/{{name.snakeCase}}';

describe('{{name.kebabCase}}', () => {
	const provider = AnchorProvider.env();
	const program = new Program<{{name.pascalCase}}>(IDL, new web3.PublicKey('{{programId}}'), provider);

	it('enter your test case', async () => {
		assert.ok(true)
	});
});
`;

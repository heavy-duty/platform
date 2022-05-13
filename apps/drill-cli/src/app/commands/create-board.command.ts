import { Command, CommandRunner } from 'nest-commander';
import { confirmSignature } from '../actions/confirm-signature';
import { createBoard } from '../actions/create-board';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

export interface CreateBoardCommandOptions {
  repo?: string;
  lockTime?: string;
  acceptedMint?: string;
}

@Command({
  name: 'create-board',
  description: 'Create a new board',
  arguments: '<username/repo> <lock-time> <accepted-mint>',
})
export class CreateBoardCommand implements CommandRunner {
  async run(
    params: string[],
    options?: CreateBoardCommandOptions
  ): Promise<void> {
    try {
      const [owner, repoName] = params[0].split('/');
      const lockTime = params[1];
      const acceptedMint = params[2];

      const config = await getSolanaConfig();
      const provider = await getProvider(config);
      const program = getProgram(provider);

      log(`Creating board "${owner}/${repoName}"`);

      const txid = await createBoard(program, provider, {
        owner,
        repoName,
        lockTime,
        acceptedMint,
      });

      log(`Confirming signature: ${txid}`);

      await confirmSignature(provider, txid);
    } catch (e) {
      console.log('Something go wrong: ', e);
    }
  }

  // @Option({
  //   flags: '-n, --number [number]',
  //   description: 'A basic number parser',
  // })
  // parseNumber(val: string): number {
  //   return Number(val);
  // }
}

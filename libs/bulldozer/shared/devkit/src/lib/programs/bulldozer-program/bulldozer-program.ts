import { Program, Provider } from '@heavy-duty/anchor';
import { Connection, PublicKey } from '@solana/web3.js';
import { Bulldozer, IDL } from './bulldozer';

export const BULLDOZER_PROGRAM_ID = new PublicKey(
  '7WgU9mAEgB1doxyKisYd2HAxdsNUrpfP6tAPvyNYnFfD'
);

let currentEndpoint: string;
let program: Program<Bulldozer>;

export const getBulldozerProgram = (endpoint: string) => {
  if (currentEndpoint && program && currentEndpoint === endpoint) {
    return program;
  }

  program = new Program<Bulldozer>(
    IDL,
    BULLDOZER_PROGRAM_ID,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new Provider(new Connection(endpoint), {} as any, Provider.defaultOptions())
  );

  return program;
};

import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer, IDL } from './bulldozer';

export const BULLDOZER_PROGRAM_ID = new PublicKey(
  'GVm1TjFD3V6paG5ef4cvpd7fc27bwyjityN2sbyPJpef'
);

export const bulldozerProgram = new Program<Bulldozer>(
  IDL,
  BULLDOZER_PROGRAM_ID,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as any
);

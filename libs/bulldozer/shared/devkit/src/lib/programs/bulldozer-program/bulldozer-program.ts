import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer, IDL } from './bulldozer';

export const BULLDOZER_PROGRAM_ID = new PublicKey(
  '7WgU9mAEgB1doxyKisYd2HAxdsNUrpfP6tAPvyNYnFfD'
);

export const bulldozerProgram = new Program<Bulldozer>(
  IDL,
  BULLDOZER_PROGRAM_ID,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as any
);

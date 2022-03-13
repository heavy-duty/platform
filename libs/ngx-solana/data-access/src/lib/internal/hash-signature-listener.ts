import { Commitment } from '@solana/web3.js';

export const hashSignatureListener = (
  signature: string,
  commitment: Commitment
) => `${signature}:${commitment}`;

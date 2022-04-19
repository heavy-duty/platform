import { Pipe, PipeTransform } from '@angular/core';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

@Pipe({
  name: 'bdFromLamports',
})
export class FromLamportsPipe implements PipeTransform {
  transform(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }
}

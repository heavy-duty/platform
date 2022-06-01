import { Injectable } from '@angular/core';
import { Keypair } from '@solana/web3.js';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class KeypairsService {
  private readonly _keypairs = new BehaviorSubject<Keypair[]>([]);
  readonly keypairs$ = this._keypairs.asObservable();

  generateKeypair() {
    this._keypairs.next([...this._keypairs.getValue(), Keypair.generate()]);
  }

  removeKeypair(index: number) {
    const keypairs = [...this._keypairs.getValue()];
    keypairs.splice(index, 1);
    this._keypairs.next(keypairs);
  }

  getKeypair(index: number) {
    const keypairs = [...this._keypairs.getValue()];

    return keypairs[index] ?? null;
  }
}

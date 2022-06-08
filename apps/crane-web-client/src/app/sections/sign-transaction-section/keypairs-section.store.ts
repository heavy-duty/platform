import { Injectable } from '@angular/core';
import { ComponentStore } from '@ngrx/component-store';
import { Keypair } from '@solana/web3.js';

interface ViewModel {
	keypairs: Keypair[];
}

const initialState: ViewModel = {
	keypairs: [],
};

@Injectable()
export class KeypairsSectionStore extends ComponentStore<ViewModel> {
	readonly keypairs$ = this.select(({ keypairs }) => keypairs);

	constructor() {
		super(initialState);
	}

	readonly generateKeypair = this.updater((state) => ({
		...state,
		keypairs: [...state.keypairs, Keypair.generate()],
	}));

	readonly removeKeypair = this.updater<number>((state, index) => {
		const keypairs = [...state.keypairs];

		keypairs.splice(index, 1);

		return {
			...state,
			keypairs,
		};
	});
}

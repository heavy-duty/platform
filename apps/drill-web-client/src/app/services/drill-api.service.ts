import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AnchorProvider, BN, Program } from '@heavy-duty/anchor';
import {
	Account,
	getAccount,
	getAssociatedTokenAddress,
	getMint,
} from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { catchError, concatMap, defer, from, map, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Option } from '../types';
import { Drill, IDL } from './drill';

export interface Board {
	id: number;
	publicKey: PublicKey;
	authority: PublicKey;
	acceptedMint: PublicKey;
	lockTime: BN;
	boardBump: number;
	boardVaultBump: number;
}

export interface Bounty {
	publicKey: PublicKey;
	boardId: number;
	bountyBump: number;
	bountyHunter: Option<string>;
	id: number;
	bountyVaultBump: number;
	closedAt: Option<Date>;
	isClosed: boolean;
}

@Injectable({ providedIn: 'root' })
export class DrillApiService {
	private readonly _baseUrl = environment.gatewayUrl;
	private readonly _connection = new Connection(environment.rpcEndpoint);
	private readonly _program = new Program<Drill>(
		IDL,
		environment.programId,
		new AnchorProvider(
			this._connection,
			{} as never,
			AnchorProvider.defaultOptions()
		)
	);

	constructor(private readonly _httpClient: HttpClient) {}

	private getBoardPublicKey(boardId: number) {
		return defer(() =>
			from(
				PublicKey.findProgramAddress(
					[
						Buffer.from('board', 'utf8'),
						new BN(boardId).toArrayLike(Buffer, 'le', 4),
					],
					new PublicKey(environment.programId)
				).then(([publicKey]) => publicKey)
			)
		);
	}

	private getBoardVaultPublicKey(boardId: number) {
		return this.getBoardPublicKey(boardId).pipe(
			concatMap((boardPublicKey) =>
				defer(() =>
					from(
						PublicKey.findProgramAddress(
							[Buffer.from('board_vault', 'utf8'), boardPublicKey.toBuffer()],
							new PublicKey(environment.programId)
						).then(([publicKey]) => publicKey)
					)
				)
			)
		);
	}

	private getBountyPublicKey(boardId: number, bountyId: number) {
		return this.getBoardPublicKey(boardId).pipe(
			concatMap((boardPublicKey) =>
				defer(() =>
					from(
						PublicKey.findProgramAddress(
							[
								Buffer.from('bounty', 'utf8'),
								boardPublicKey.toBuffer(),
								new BN(bountyId).toArrayLike(Buffer, 'le', 4),
							],
							new PublicKey(environment.programId)
						).then(([publicKey]) => publicKey)
					)
				)
			)
		);
	}

	private getBountyVaultPublicKey(boardId: number, bountyId: number) {
		return this.getBountyPublicKey(boardId, bountyId).pipe(
			concatMap((bountyPublicKey) =>
				defer(() =>
					from(
						PublicKey.findProgramAddress(
							[Buffer.from('bounty_vault', 'utf8'), bountyPublicKey.toBuffer()],
							new PublicKey(environment.programId)
						).then(([publicKey]) => publicKey)
					)
				)
			)
		);
	}

	getBoard(boardId: number): Observable<Option<Board>> {
		return this.getBoardPublicKey(boardId).pipe(
			concatMap((boardPublicKey) =>
				defer(() =>
					from(this._program.account.board.fetchNullable(boardPublicKey))
				).pipe(
					map(
						(boardAccount) =>
							boardAccount && {
								id: boardId,
								publicKey: boardPublicKey,
								acceptedMint: boardAccount.acceptedMint,
								authority: boardAccount.authority,
								lockTime: boardAccount.lockTime,
								boardBump: boardAccount.boardBump,
								boardVaultBump: boardAccount.boardVaultBump,
							}
					)
				)
			)
		);
	}

	getBoardVault(boardId: number): Observable<Option<Account>> {
		return this.getBoardVaultPublicKey(boardId).pipe(
			concatMap((boardVaultPublicKey) =>
				defer(() =>
					from(getAccount(this._connection, boardVaultPublicKey))
				).pipe(catchError(() => of(null)))
			)
		);
	}

	getBounty(boardId: number, bountyId: number): Observable<Option<Bounty>> {
		return this.getBountyPublicKey(boardId, bountyId).pipe(
			concatMap((bountyPublicKey) =>
				defer(() =>
					from(this._program.account.bounty.fetchNullable(bountyPublicKey))
				).pipe(
					map(
						(bountyAccount) =>
							bountyAccount && {
								publicKey: bountyPublicKey,
								boardId: bountyAccount.boardId,
								id: bountyAccount.bountyId,
								bountyBump: bountyAccount.bountyBump,
								bountyHunter: bountyAccount.bountyHunter,
								bountyVaultBump: bountyAccount.bountyVaultBump,

								closedAt: bountyAccount.closedAt
									? new Date(bountyAccount.closedAt.toNumber() * 1000)
									: null,
								isClosed: bountyAccount.isClosed,
							}
					)
				)
			)
		);
	}

	getBountyVault(
		boardId: number,
		bountyId: number
	): Observable<Option<Account>> {
		return this.getBountyVaultPublicKey(boardId, bountyId).pipe(
			concatMap((bountyVaultPublicKey) =>
				defer(() =>
					from(getAccount(this._connection, bountyVaultPublicKey))
				).pipe(catchError(() => of(null)))
			)
		);
	}

	getMint(mint: PublicKey) {
		return defer(() => from(getMint(this._connection, mint))).pipe(
			catchError(() => of(null))
		);
	}

	getAssociatedTokenAccount(publicKey: PublicKey, mint: PublicKey) {
		return defer(async () => {
			const address = await getAssociatedTokenAddress(mint, publicKey);

			try {
				return await getAccount(this._connection, address);
			} catch (err) {
				return null;
			}
		});
	}

	claimBounty(boardId: number, bountyId: number, userVault: PublicKey) {
		return this._httpClient.post(
			`${this._baseUrl}/claim-bounty/${boardId}/${bountyId}`,
			{ userVault: userVault.toBase58() }
		);
	}
}

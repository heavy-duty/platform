import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { HttpService } from '@nestjs/axios';
import {
	Body,
	Controller,
	Get,
	Headers,
	HttpException,
	HttpStatus,
	OnModuleInit,
	Param,
	Post,
} from '@nestjs/common';
import { PublicKey } from '@solana/web3.js';
import { catchError, concatMap, defer, from, map, throwError } from 'rxjs';
import {
	getProgram,
	getProvider,
	getSolanaConfig,
	SolanaConfig,
} from './utils';
import { Drill } from './utils/drill';

@Controller()
export class AppController implements OnModuleInit {
	private _config: SolanaConfig;
	private _provider: AnchorProvider;
	private _program: Program<Drill>;

	constructor(private readonly _httpService: HttpService) {}

	async onModuleInit() {
		this._config = await getSolanaConfig();
		this._provider = await getProvider(this._config);
		this._program = getProgram(this._provider);
	}

	@Get('authenticate/:code')
	authenticate(@Param('code') code: string) {
		return this._httpService
			.post(
				'https://github.com/login/oauth/access_token',
				{
					client_id: process.env.GITHUB_CLIENT_ID,
					client_secret: process.env.GITHUB_CLIENT_SECRET,
					code,
				},
				{
					headers: { 'content-type': 'application/json' },
				}
			)
			.pipe(
				map((res) => ({
					token: new URLSearchParams(res.data).get('access_token'),
				}))
			);
	}

	@Post('claim-bounty/:boardId/:bountyId')
	claimBounty(
		@Headers('Authorization') authorization: string,
		@Param('boardId') boardId: number,
		@Param('bountyId') bountyId: number,
		@Body('userVault') userVault: string
	) {
		return this._httpService
			.get('https://api.github.com/user', {
				headers: {
					Authorization: authorization,
					Accept: 'application/vnd.github.v3+json',
				},
			})
			.pipe(
				concatMap((res) =>
					defer(() =>
						from(
							this._program.methods
								.sendBounty(boardId, bountyId, res.data.login)
								.accounts({
									authority: this._provider.wallet.publicKey,
									userVault: new PublicKey(userVault),
								})
								.rpc()
						).pipe(
							catchError((error) => {
								console.log(error.error);
								return throwError(
									() =>
										new HttpException(
											{
												status: HttpStatus.INTERNAL_SERVER_ERROR,
												error: error.error.errorCode.code,
											},
											HttpStatus.INTERNAL_SERVER_ERROR
										)
								);
							})
						)
					)
				)
			);
	}
}

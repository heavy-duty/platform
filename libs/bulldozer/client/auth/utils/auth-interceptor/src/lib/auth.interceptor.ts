import {
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { concatMap, Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
	constructor(private _walletStore: WalletStore) {}

	private isSolanaTransaction(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		httpRequest: HttpRequest<any>
	) {
		return httpRequest.headers.get('solana-rpc-method') === 'sendTransaction';
	}

	intercept(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		httpRequest: HttpRequest<any>,
		next: HttpHandler
	): Observable<HttpEvent<string>> {
		// Handle only solana transactions
		if (!this.isSolanaTransaction(httpRequest)) {
			return next.handle(httpRequest);
		}

		const signer = this._walletStore.signTransaction(httpRequest.body);

		if (!signer) {
			return throwError(() => new Error('Wallet cannot sign'));
		}

		return signer.pipe(
			concatMap((transaction) =>
				next.handle(
					httpRequest.clone({
						body: transaction,
					})
				)
			)
		);
	}
}

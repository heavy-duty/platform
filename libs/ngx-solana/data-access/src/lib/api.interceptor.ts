import {
	HttpEvent,
	HttpHandler,
	HttpHeaders,
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap, Observable, of, throwError } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Injectable()
export class HdSolanaApiInterceptor implements HttpInterceptor {
	private getParams(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		httpRequest: HttpRequest<any>
	) {
		const rpcMethod = httpRequest.headers.get('solana-rpc-method');

		if (rpcMethod === 'sendTransaction') {
			return [
				httpRequest.body.serialize().toString('base64'),
				{ encoding: 'base64' },
			];
		}

		if (httpRequest.body === null) {
			return [];
		}

		return Array.isArray(httpRequest.body)
			? httpRequest.body
			: [httpRequest.body];
	}

	private isSolanaRequest(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		httpRequest: HttpRequest<any>
	) {
		return httpRequest.headers.has('solana-rpc-method');
	}

	intercept(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		httpRequest: HttpRequest<any>,
		next: HttpHandler
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	): Observable<HttpEvent<any>> {
		// Handle only the http requests for Solana
		if (!this.isSolanaRequest(httpRequest)) {
			return next.handle(httpRequest);
		}

		return next
			.handle(
				httpRequest.clone({
					body: JSON.stringify([
						{
							jsonrpc: '2.0',
							method: httpRequest.headers.get('solana-rpc-method'),
							id: uuid(),
							params: this.getParams(httpRequest),
						},
					]),
					headers: new HttpHeaders({
						'content-type': 'application/json',
					}),
				})
			)
			.pipe(
				concatMap((event) => {
					if (event instanceof HttpResponse) {
						const firstValue = event.body[0];

						if ('error' in firstValue) {
							return throwError(() => firstValue.error.data);
						}

						return of(event.clone({ body: firstValue.result }));
					}

					return of(event);
				})
			);
	}
}

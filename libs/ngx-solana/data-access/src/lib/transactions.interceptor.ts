import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { concatMap, Observable, of } from 'rxjs';
import { HdSolanaTransactionsStore } from './transactions.store';

@Injectable()
export class HdSolanaTransactionsInterceptor implements HttpInterceptor {
  constructor(
    private readonly _hdSolanaTransactionsStore: HdSolanaTransactionsStore
  ) {}

  private isSendTransaction(httpRequest: HttpRequest<string>) {
    if (httpRequest.body === null) {
      return false;
    }

    const body = JSON.parse(httpRequest.body);

    return (
      Array.isArray(body) &&
      body.length > 0 &&
      'method' in body[0] &&
      body[0].method === 'sendTransaction'
    );
  }

  intercept(
    httpRequest: HttpRequest<string>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Handle only for send transaction
    if (!this.isSendTransaction(httpRequest)) {
      return next.handle(httpRequest);
    }

    return next.handle(httpRequest).pipe(
      concatMap((event) => {
        if (event instanceof HttpResponse) {
          this._hdSolanaTransactionsStore.reportProgress(event.body[0].result);
        }

        return of(event);
      })
    );
  }
}

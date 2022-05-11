/* eslint-disable @typescript-eslint/no-explicit-any */
import {
	HttpErrorResponse,
	HttpEvent,
	HttpHandler,
	HttpInterceptor,
	HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
	constructor(private authService: AuthService, private router: Router) {}

	private handleAuthError = (err: HttpErrorResponse): Observable<any> => {
		if (err.status === 401 || err.status === 403) {
			this.router.navigateByUrl('/unauthorized');
			return of(err.message);
		}
		return throwError(() => err);
	};

	intercept(
		req: HttpRequest<never>,
		next: HttpHandler
	): Observable<HttpEvent<any>> {
		const headersConfig: any = {
			'Content-Type': 'application/json',
			Accept: 'application/json',
		};

		if (this.router.url.split('?')[0] !== '/login') {
			const token = this.authService.getToken();

			if (token) {
				headersConfig.Authorization = `Bearer ${token}`;
			}
		}

		const request = req.clone({ setHeaders: headersConfig });

		return next.handle(request).pipe(catchError(this.handleAuthError));
	}
}

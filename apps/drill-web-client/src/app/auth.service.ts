import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly _baseUrl = environment.gatewayUrl;
	private _isLogged = false;
	private _token: string | null = null;

	constructor(private httpClient: HttpClient, private router: Router) {}

	login(code: string) {
		return this.httpClient
			.get<{ token: string }>(`${this._baseUrl}/authenticate/${code}`)
			.pipe(
				tap(({ token }) => {
					localStorage.setItem('token', token);
					this._isLogged = true;
				})
			);
	}

	isLoggedIn() {
		if (!this._isLogged) {
			this._isLogged = !!this.getToken();
		}
		return this._isLogged;
	}

	getToken() {
		if (!this._token) {
			this._token = localStorage.getItem('token');
		}
		return this._token;
	}

	logout(): void {
		this._isLogged = false;
		this._token = null;
		localStorage.removeItem('token');
		this.router.navigate(['unauthorized']);
	}
}

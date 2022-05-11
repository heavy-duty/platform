import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
	private readonly TOKEN = 'token';
	private readonly baseUrl = `${environment.gatewayUrl}/authenticate`;
	private isLogged = false;
	private token: string | null = null;

	constructor(private httpClient: HttpClient, private router: Router) {}

	login(code: string) {
		return this.httpClient
			.get<{ token: string }>(`${this.baseUrl}/${code}`)
			.pipe(
				tap(({ token }) => {
					localStorage.setItem(this.TOKEN, token);
					this.isLogged = true;
				})
			);
	}

	isLoggedIn() {
		if (!this.isLogged) {
			this.isLogged = !!this.getToken();
		}
		return this.isLogged;
	}

	getToken() {
		if (!this.token) {
			this.token = localStorage.getItem(this.TOKEN);
		}
		return this.token;
	}

	logout(): void {
		this.isLogged = false;
		this.token = null;
		localStorage.removeItem(this.TOKEN);
		this.router.navigate(['unauthorized']);
	}
}

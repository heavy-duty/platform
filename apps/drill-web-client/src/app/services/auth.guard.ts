import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) {}

	canActivate(): boolean {
		return this.checkLogin();
	}

	checkLogin(): boolean {
		if (this.authService.isLoggedIn()) {
			return true;
		}

		// Navigate to the login page with extras
		this.router.navigate(['/unauthorized']);
		return false;
	}
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'drill-login',
	template: ` <h1>We are logging you in...</h1> `,
})
export class LoginPageComponent implements OnInit {
	private readonly _code: string | null;

	constructor(
		private authService: AuthService,
		private router: Router,
		activatedRoute: ActivatedRoute
	) {
		this._code = activatedRoute.snapshot.queryParamMap.get('code');
	}

	ngOnInit() {
		if (this._code) {
			this.login(this._code);
		} else {
			this.unauthorizedAccess();
		}
	}

	unauthorizedAccess() {
		this.router.navigate(['unauthorized']);
	}

	login(code: string) {
		this.authService.login(code).subscribe({
			next: () => this.router.navigate(['']),
			error: () => this.router.navigate(['']),
		});
	}

	logout(): void {
		this.authService.logout();
	}
}

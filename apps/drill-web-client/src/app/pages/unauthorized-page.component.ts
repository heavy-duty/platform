import { Component } from '@angular/core';
import { environment } from '../../environments/environment';

@Component({
	selector: 'drill-unauthorized',
	template: `
		<h1>Unauthorized Access Denied.</h1>

		<p>
			<span>In order to log using your Github account</span>
			<a id="link" href="{{ linkToGithub }}">Click here!</a>
		</p>
	`,
})
export class UnauthorizedPageComponent {
	readonly linkToGithub = `${environment.githubOAuth}?
    scope=user:email&client_id=${environment.clientId}&redirect_uri=${environment.redirectUri}`;
}

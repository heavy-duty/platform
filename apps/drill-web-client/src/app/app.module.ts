import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { AppComponent } from './app.component';
import { BountyClaimComponent } from './components/bounty-claim.component';
import { BountyInformationComponent } from './components/bounty-information.component';
import { BountyStatusComponent } from './components/bounty-status.component';
import { BountyTotalComponent } from './components/bounty-total.components';
import { BountyUserComponent } from './components/bounty-user.component';
import { ScrewedCardComponent } from './components/screwed-card.component';
import { ProgressSpinnerDirective } from './directives/progress-spinner.directive';
import { RotateDirective } from './directives/rotate.directive';
import { BoardPageComponent } from './pages/board-page.component';
import { BountyPageComponent } from './pages/bounty-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { UnauthorizedPageComponent } from './pages/unauthorized-page.component';
import { AuthGuard } from './services/auth.guard';
import { HttpTokenInterceptor } from './services/auth.interceptor';
import { ShellComponent } from './shell.component';

@NgModule({
	declarations: [
		AppComponent,
		ShellComponent,
		BountyPageComponent,
		BoardPageComponent,
		ScrewedCardComponent,
		UnauthorizedPageComponent,
		RotateDirective,
		ProgressSpinnerDirective,
		BountyInformationComponent,
		BountyUserComponent,
		BountyTotalComponent,
		BountyClaimComponent,
		BountyStatusComponent,
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot([
			{
				path: '',
				component: ShellComponent,
				canActivate: [AuthGuard],
				children: [
					{
						path: 'board',
						component: BoardPageComponent,
					},
					{
						path: 'bounty/:bountyId',
						component: BountyPageComponent,
					},
					{
						path: '',
						redirectTo: 'board',
						pathMatch: 'full',
					},
				],
			},
			{
				path: 'unauthorized',
				component: UnauthorizedPageComponent,
			},
			{
				path: 'login',
				component: LoginPageComponent,
			},
		]),
		HttpClientModule,
		ReactiveComponentModule,
	],
	bootstrap: [AppComponent],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
	],
})
export class AppModule {}

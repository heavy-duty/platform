import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { AuthGuard } from './auth.guard';
import { HttpTokenInterceptor } from './auth.interceptor';
import {
	BoardPageComponent,
	RotateDirective,
	ScrewedCardComponent,
} from './board-page.component';
import { LoginPageComponent } from './login-page.component';
import { UnauthorizedPageComponent } from './unauthorized-page.component';

@NgModule({
	declarations: [
		AppComponent,
		BoardPageComponent,
		ScrewedCardComponent,
		UnauthorizedPageComponent,
		RotateDirective,
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot([
			{
				path: '',
				component: BoardPageComponent,
				canActivate: [AuthGuard],
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
	],
	bootstrap: [AppComponent],
	providers: [
		{ provide: HTTP_INTERCEPTORS, useClass: HttpTokenInterceptor, multi: true },
	],
})
export class AppModule {}

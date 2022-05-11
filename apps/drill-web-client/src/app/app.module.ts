import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import {
	BoardPageComponent,
	RotateDirective,
	ScrewedCardComponent,
} from './pages/board-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { UnauthorizedPageComponent } from './pages/unauthorized-page.component';
import { AuthGuard } from './services/auth.guard';
import { HttpTokenInterceptor } from './services/auth.interceptor';

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

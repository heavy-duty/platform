import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { AppComponent } from './app.component';
import {
	AssociatedTokenPlugin,
	PluginModule,
	SystemPlugin,
	TokenPlugin,
} from './plugins';
import { FormlyFieldStepperComponent } from './sections';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		RouterModule.forRoot([
			{
				path: '',
				pathMatch: 'full',
				loadComponent: () =>
					import('./shell.component').then((m) => m.ShellComponent),
			},
		]),
		FormlyModule.forRoot({
			types: [
				{
					name: 'stepper',
					component: FormlyFieldStepperComponent,
				},
			],
		}),
		FormlyMaterialModule,
		HdWalletAdapterModule.forRoot({
			autoConnect: true,
		}),
		PluginModule.forRoot([
			new SystemPlugin(),
			new TokenPlugin(),
			new AssociatedTokenPlugin(),
		]),
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

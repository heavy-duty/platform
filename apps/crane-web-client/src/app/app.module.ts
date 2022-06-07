import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { AppComponent } from './app.component';
import { ScrewedCardComponent } from './components';
import {
	AssociatedTokenPlugin,
	PluginModule,
	SystemPlugin,
	TokenPlugin,
} from './plugins';
import {
	BlockhashStatusSectionComponent,
	ConfirmTransactionButtonComponent,
	CreateTransactionSectionComponent,
	FormlyFieldStepperComponent,
	SendTransactionButtonComponent,
	SignTransactionSectionComponent,
} from './sections';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatSidenavModule,
		MatSnackBarModule,
		ReactiveComponentModule,
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
		CreateTransactionSectionComponent,
		SignTransactionSectionComponent,
		SendTransactionButtonComponent,
		ConfirmTransactionButtonComponent,
		BlockhashStatusSectionComponent,
		ScrewedCardComponent,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HdWalletAdapterModule } from '@heavy-duty/wallet-adapter';
import { ReactiveComponentModule } from '@ngrx/component';
import { FormlyModule } from '@ngx-formly/core';
import { FormlyMaterialModule } from '@ngx-formly/material';
import { AppComponent } from './app.component';
import { BlockhashStatusSectionModule } from './blockhash-status-section';
import { ConfirmTransactionButtonModule } from './confirm-transaction-button';
import { CreateTransactionSectionModule } from './create-transaction-section';
import { PluginModule, SystemPlugin, TokenPlugin } from './plugins';
import { SendTransactionButtonModule } from './send-transaction-button';
import { SignTransactionSectionModule } from './sign-transaction-section';

@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		MatButtonModule,
		ReactiveComponentModule,
		FormlyModule.forRoot(),
		FormlyMaterialModule,
		HdWalletAdapterModule.forRoot({
			autoConnect: true,
		}),
		PluginModule.forRoot([new SystemPlugin(), new TokenPlugin()]),
		CreateTransactionSectionModule,
		SignTransactionSectionModule,
		SendTransactionButtonModule,
		ConfirmTransactionButtonModule,
		BlockhashStatusSectionModule,
	],
	bootstrap: [AppComponent],
})
export class AppModule {}

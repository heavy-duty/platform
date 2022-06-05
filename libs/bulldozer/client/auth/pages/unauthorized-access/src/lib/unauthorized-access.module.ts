import { DialogModule } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HdWalletAdapterBlueprintModule } from '@heavy-duty/wallet-adapter-blueprint';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { UnauthorizedAccessComponent } from './unauthorized-access.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([
			{ path: '', pathMatch: 'full', component: UnauthorizedAccessComponent },
		]),
		HdWalletAdapterBlueprintModule,
		HdWalletAdapterCdkModule,
		DialogModule,
	],
	declarations: [UnauthorizedAccessComponent],
	exports: [UnauthorizedAccessComponent],
})
export class UnauthorizedAccessModule {}

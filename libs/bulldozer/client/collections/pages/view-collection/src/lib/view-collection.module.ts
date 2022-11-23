import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { EditCollectionModule } from '@bulldozer-client/edit-collection';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { HdBroadcasterCdkModule } from '@heavy-duty/broadcaster-cdk';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewCollectionComponent } from './view-collection.component';
@NgModule({
	declarations: [ViewCollectionComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: ViewCollectionComponent,
				children: [
					{
						path: 'attributes',
						loadChildren: () =>
							import('@bulldozer-client/view-collection-attributes').then(
								(m) => m.ViewCollectionAttributesModule
							),
					},
					{
						path: 'code-viewer',
						loadChildren: () =>
							import('@bulldozer-client/view-collection-code-viewer').then(
								(m) => m.ViewCollectionCodeModule
							),
					},
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'attributes',
					},
				],
			},
		]),
		MatButtonModule,
		ProgressSpinnerModule,
		MatSnackBarModule,
		MatTooltipModule,
		ReactiveComponentModule,
		ItemUpdatingModule,
		EditCollectionModule,
		HdWalletAdapterCdkModule,
		HdBroadcasterCdkModule,
	],
})
export class ViewCollectionModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditInstructionModule } from '@bulldozer-client/edit-instruction';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { HdBroadcasterCdkModule } from '@heavy-duty/broadcaster-cdk';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewInstructionComponent } from './view-instruction.component';
@NgModule({
	declarations: [ViewInstructionComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: ViewInstructionComponent,
				children: [
					{
						path: 'arguments',
						loadChildren: () =>
							import('@bulldozer-client/view-instruction-arguments').then(
								(m) => m.ViewInstructionArgumentsModule
							),
					},
					{
						path: 'documents',
						loadChildren: () =>
							import('@bulldozer-client/view-instruction-documents').then(
								(m) => m.ViewInstructionDocumentsModule
							),
					},
					{
						path: 'signers',
						loadChildren: () =>
							import('@bulldozer-client/view-instruction-signers').then(
								(m) => m.ViewInstructionSignersModule
							),
					},
					{
						path: 'code-editor',
						loadChildren: () =>
							import('@bulldozer-client/view-instruction-code-editor').then(
								(m) => m.ViewInstructionCodeEditorModule
							),
					},
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'arguments',
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
		EditInstructionModule,
		HdWalletAdapterCdkModule,
		HdBroadcasterCdkModule,
	],
})
export class ViewInstructionModule {}

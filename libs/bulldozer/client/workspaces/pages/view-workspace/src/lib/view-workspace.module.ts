import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { EditWorkspaceModule } from '@bulldozer-client/edit-workspace';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceComponent } from './view-workspace.component';
@NgModule({
	declarations: [ViewWorkspaceComponent],
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				component: ViewWorkspaceComponent,
				children: [
					{
						path: 'budget',
						loadChildren: () =>
							import('@bulldozer-client/view-workspace-budget').then(
								(m) => m.ViewWorkspaceBudgetModule
							),
					},
					{
						path: 'collaborators',
						loadChildren: () =>
							import('@bulldozer-client/view-workspace-collaborators').then(
								(m) => m.ViewWorkspaceCollaboratorsModule
							),
					},
					{
						path: 'instructions',
						loadChildren: () =>
							import('@bulldozer-client/view-workspace-instructions').then(
								(m) => m.ViewWorkspaceInstructionsModule
							),
					},
					{
						path: '',
						pathMatch: 'full',
						redirectTo: 'budget',
					},
				],
			},
		]),
		MatButtonModule,
		ProgressSpinnerModule,
		MatTooltipModule,
		MatListModule,
		ReactiveComponentModule,
		ItemUpdatingModule,
		EditWorkspaceModule,
		HdWalletAdapterCdkModule,
	],
})
export class ViewWorkspaceModule {}

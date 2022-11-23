import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { AddInstructionAccountModule } from '@bulldozer-client/add-instruction-account';
import { CardModule } from '@bulldozer-client/bd-card';
import { EditInstructionAccountConstraintModule } from '@bulldozer-client/edit-instruction-account-constraint';
import { EditInstructionDocumentModule } from '@bulldozer-client/edit-instruction-document';
import { EditInstructionDocumentDerivationModule } from '@bulldozer-client/edit-instruction-document-derivation';
import { EditInstructionMintModule } from '@bulldozer-client/edit-instruction-mint';
import { EditInstructionRelationModule } from '@bulldozer-client/edit-instruction-relation';
import { EditInstructionTokenModule } from '@bulldozer-client/edit-instruction-token';
import { EditInstructionUncheckedModule } from '@bulldozer-client/edit-instruction-unchecked';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { RemoveByIdPipe } from './remove-by-id.pipe';
import { ViewInstructionDocumentsComponent } from './view-instruction-documents.component';

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forChild([
			{
				path: '',
				pathMatch: 'full',
				component: ViewInstructionDocumentsComponent,
			},
		]),
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		MatListModule,
		MatMenuModule,
		ProgressSpinnerModule,
		MatTooltipModule,
		ReactiveComponentModule,
		HdWalletAdapterCdkModule,
		ItemUpdatingModule,
		EditInstructionDocumentModule,
		EditInstructionTokenModule,
		EditInstructionMintModule,
		EditInstructionUncheckedModule,
		EditInstructionDocumentDerivationModule,
		EditInstructionAccountConstraintModule,
		EditInstructionRelationModule,
		AddInstructionAccountModule,
		ObscureAddressModule,
		CardModule,
	],
	declarations: [RemoveByIdPipe, ViewInstructionDocumentsComponent],
})
export class ViewInstructionDocumentsModule {}

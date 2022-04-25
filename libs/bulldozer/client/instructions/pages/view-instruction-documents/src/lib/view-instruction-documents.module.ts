import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CardModule } from '@bulldozer-client/bd-card';
import { EditInstructionDocumentModule } from '@bulldozer-client/edit-instruction-document';
import { EditInstructionRelationModule } from '@bulldozer-client/edit-instruction-relation';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    HdWalletAdapterCdkModule,
    ItemUpdatingModule,
    EditInstructionDocumentModule,
    EditInstructionRelationModule,
    ObscureAddressModule,
    CardModule,
  ],
  declarations: [RemoveByIdPipe, ViewInstructionDocumentsComponent],
})
export class ViewInstructionDocumentsModule {}

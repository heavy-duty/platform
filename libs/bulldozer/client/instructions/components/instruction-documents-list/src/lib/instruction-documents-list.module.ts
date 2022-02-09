import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { EditInstructionDocumentModule } from '@bulldozer-client/edit-instruction-document';
import { EditInstructionRelationModule } from '@bulldozer-client/edit-instruction-relation';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionDocumentsListComponent } from './instruction-documents-list.component';

@NgModule({
  declarations: [InstructionDocumentsListComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    SectionHeaderModule,
    ObscureAddressModule,
    EditInstructionDocumentModule,
    EditInstructionRelationModule,
  ],
  exports: [InstructionDocumentsListComponent],
})
export class InstructionDocumentsListModule {}

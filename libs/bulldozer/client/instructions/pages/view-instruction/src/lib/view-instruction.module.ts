import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@bulldozer-client/code-editor';
import { InstructionArgumentsListModule } from '@bulldozer-client/instruction-arguments-list';
import { InstructionDocumentsListModule } from '@bulldozer-client/instruction-documents-list';
import { InstructionSignersListModule } from '@bulldozer-client/instruction-signers-list';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewInstructionComponent } from './view-instruction.component';

@NgModule({
  declarations: [ViewInstructionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewInstructionComponent },
    ]),
    MatButtonModule,
    MatSnackBarModule,
    ReactiveComponentModule,
    PageHeaderModule,
    CodeEditorModule,
    InstructionArgumentsListModule,
    InstructionSignersListModule,
    InstructionDocumentsListModule,
  ],
})
export class ViewInstructionModule {}

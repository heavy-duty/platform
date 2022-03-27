import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@bulldozer-client/code-editor';
import { InstructionArgumentsListModule } from '@bulldozer-client/instruction-arguments-list';
import { InstructionDocumentsListModule } from '@bulldozer-client/instruction-documents-list';
import { InstructionSignersListModule } from '@bulldozer-client/instruction-signers-list';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    ReactiveComponentModule,
    PageHeaderModule,
    CodeEditorModule,
    InstructionArgumentsListModule,
    InstructionSignersListModule,
    InstructionDocumentsListModule,
    ItemUpdatingModule,
  ],
})
export class ViewInstructionModule {}

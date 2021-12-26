import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@heavy-duty/bulldozer/application/features/code-editor';
import { PageHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/page-header';
import { SectionHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/section-header';
import { ObscureAddressModule } from '@heavy-duty/bulldozer/application/utils/pipes/obscure-address';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionMenuComponent } from './instruction-menu.component';
import { ListArgumentsComponent } from './list-arguments.component';
import { ListDocumentsComponent } from './list-documents.component';
import { ListSignersComponent } from './list-signers.component';
import { ViewInstructionComponent } from './view-instruction.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        component: ViewInstructionComponent,
        pathMatch: 'full',
      },
    ]),
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    ObscureAddressModule,
    PageHeaderModule,
    SectionHeaderModule,
    CodeEditorModule,
  ],
  declarations: [
    ViewInstructionComponent,
    ListArgumentsComponent,
    ListDocumentsComponent,
    ListSignersComponent,
    InstructionMenuComponent,
  ],
})
export class ViewInstructionModule {}

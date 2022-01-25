import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { EditArgumentModule } from '@heavy-duty/bulldozer/application/features/edit-argument';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionArgumentsListComponent } from './instruction-arguments-list.component';

@NgModule({
  declarations: [InstructionArgumentsListComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    SectionHeaderModule,
    EditArgumentModule,
  ],
  exports: [InstructionArgumentsListComponent],
})
export class InstructionArgumentsListModule {}

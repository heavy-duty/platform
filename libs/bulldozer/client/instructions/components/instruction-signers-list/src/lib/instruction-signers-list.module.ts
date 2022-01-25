import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { EditSignerModule } from '@heavy-duty/bulldozer/application/features/edit-signer';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionSignersListComponent } from './instruction-signers-list.component';

@NgModule({
  declarations: [InstructionSignersListComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    SectionHeaderModule,
    EditSignerModule,
  ],
  exports: [InstructionSignersListComponent],
})
export class InstructionSignersListModule {}

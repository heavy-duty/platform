import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditInstructionSignerModule } from '@bulldozer-client/edit-instruction-signer';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewInstructionSignersComponent } from './view-instruction-signers.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewInstructionSignersComponent,
      },
    ]),
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    ItemUpdatingModule,
    EditInstructionSignerModule,
  ],
  declarations: [ViewInstructionSignersComponent],
})
export class ViewInstructionSignersModule {}

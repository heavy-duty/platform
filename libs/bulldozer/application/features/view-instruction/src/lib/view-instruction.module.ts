import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/page-header';
import { ObscureAddressModule } from '@heavy-duty/bulldozer/application/utils/pipes/obscure-address';
import { ReactiveComponentModule } from '@ngrx/component';

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
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    ReactiveComponentModule,
    ObscureAddressModule,
    PageHeaderModule,
  ],
  declarations: [ViewInstructionComponent],
})
export class ViewInstructionModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditInstructionArgumentModule } from '@bulldozer-client/edit-instruction-argument';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewInstructionArgumentsComponent } from './view-instruction-arguments.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewInstructionArgumentsComponent,
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
    EditInstructionArgumentModule,
  ],
  declarations: [ViewInstructionArgumentsComponent],
})
export class ViewInstructionArgumentsModule {}

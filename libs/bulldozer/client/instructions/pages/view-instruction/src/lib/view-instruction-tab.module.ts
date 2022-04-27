import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewInstructionTabComponent } from './view-instruction-tab.component';
@NgModule({
  declarations: [ViewInstructionTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    ItemUpdatingModule,
  ],
  exports: [ViewInstructionTabComponent],
})
export class ViewInstructionTabModule {}

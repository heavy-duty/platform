import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CollectionExplorerModule } from '@bulldozer-client/collection-explorer';
import { EditApplicationModule } from '@bulldozer-client/edit-application';
import { InstructionExplorerModule } from '@bulldozer-client/instruction-explorer';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { ReactiveComponentModule } from '@ngrx/component';
import { ApplicationExplorerComponent } from './application-explorer.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    CollectionExplorerModule,
    InstructionExplorerModule,
    StopPropagationModule,
    EditApplicationModule,
    ItemUpdatingModule,
  ],
  declarations: [ApplicationExplorerComponent],
  exports: [ApplicationExplorerComponent],
})
export class ApplicationExplorerModule {}

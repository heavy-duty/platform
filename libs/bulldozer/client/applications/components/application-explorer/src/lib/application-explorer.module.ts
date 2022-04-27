import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CollectionExplorerModule } from '@bulldozer-client/collection-explorer';
import { EditApplicationModule } from '@bulldozer-client/edit-application';
import { InstructionExplorerModule } from '@bulldozer-client/instruction-explorer';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
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
    ProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    CollectionExplorerModule,
    InstructionExplorerModule,
    StopPropagationModule,
    EditApplicationModule,
    ItemUpdatingModule,
    HdWalletAdapterCdkModule,
  ],
  declarations: [ApplicationExplorerComponent],
  exports: [ApplicationExplorerComponent],
})
export class ApplicationExplorerModule {}

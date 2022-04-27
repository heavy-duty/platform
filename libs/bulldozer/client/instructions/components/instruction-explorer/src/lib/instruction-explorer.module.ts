import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditInstructionModule } from '@bulldozer-client/edit-instruction';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { InstructionExplorerComponent } from './instruction-explorer.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    HdWalletAdapterCdkModule,
    StopPropagationModule,
    EditInstructionModule,
    ItemUpdatingModule,
  ],
  declarations: [InstructionExplorerComponent],
  exports: [InstructionExplorerComponent],
})
export class InstructionExplorerModule {}

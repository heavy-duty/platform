import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CardModule } from '@bulldozer-client/bd-card';
import { EditInstructionSignerModule } from '@bulldozer-client/edit-instruction-signer';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
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
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    HdWalletAdapterCdkModule,
    ItemUpdatingModule,
    EditInstructionSignerModule,
    CardModule,
  ],
  declarations: [ViewInstructionSignersComponent],
})
export class ViewInstructionSignersModule {}

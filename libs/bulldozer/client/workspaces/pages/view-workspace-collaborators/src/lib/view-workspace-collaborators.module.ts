import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceCollaboratorsComponent } from './view-workspace-collaborators.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewWorkspaceCollaboratorsComponent,
      },
    ]),
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    ReactiveComponentModule,
    HdWalletAdapterCdkModule,
    ItemUpdatingModule,
  ],
  declarations: [ViewWorkspaceCollaboratorsComponent],
})
export class ViewWorkspaceCollaboratorsModule {}

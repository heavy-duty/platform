import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { AddWorkspaceModule } from '@bulldozer-client/add-workspace';
import { ApplicationExplorerModule } from '@bulldozer-client/application-explorer';
import { EditApplicationModule } from '@bulldozer-client/edit-application';
import { EditUserModule } from '@bulldozer-client/edit-user';
import { EditWorkspaceModule } from '@bulldozer-client/edit-workspace';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { HdWalletAdapterCdkModule } from '@heavy-duty/wallet-adapter-cdk';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceExplorerComponent } from './workspace-explorer.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    ReactiveComponentModule,
    ApplicationExplorerModule,
    ObscureAddressModule,
    EditWorkspaceModule,
    EditApplicationModule,
    AddWorkspaceModule,
    EditUserModule,
    ItemUpdatingModule,
    HdWalletAdapterCdkModule,
  ],
  declarations: [WorkspaceExplorerComponent],
  exports: [WorkspaceExplorerComponent],
})
export class WorkspaceExplorerModule {}

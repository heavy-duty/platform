import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ApplicationExplorerModule } from '@bulldozer-client/application-explorer';
import { EditApplicationModule } from '@bulldozer-client/edit-application';
import { EditWorkspaceModule } from '@bulldozer-client/edit-workspace';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
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
    ReactiveComponentModule,
    ApplicationExplorerModule,
    ObscureAddressModule,
    EditWorkspaceModule,
    EditApplicationModule,
  ],
  declarations: [WorkspaceExplorerComponent],
  exports: [WorkspaceExplorerComponent],
})
export class WorkspaceExplorerModule {}

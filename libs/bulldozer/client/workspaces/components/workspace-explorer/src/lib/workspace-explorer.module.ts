import { ClipboardModule } from '@angular/cdk/clipboard';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ApplicationExplorerModule } from '@bulldozer-client/application-explorer';
import { ObscureAddressModule } from '@bulldozer-client/obscure-address';
import { WorkspaceSelectorModule } from '@bulldozer-client/workspace-selector';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceExplorerComponent } from './workspace-explorer.component';
@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ReactiveComponentModule,
    ApplicationExplorerModule,
    WorkspaceSelectorModule,
    MatTooltipModule,
    MatExpansionModule,
    MatIconModule,
    ClipboardModule,
    ObscureAddressModule,
  ],
  declarations: [WorkspaceExplorerComponent],
  exports: [WorkspaceExplorerComponent],
})
export class WorkspaceExplorerModule {}

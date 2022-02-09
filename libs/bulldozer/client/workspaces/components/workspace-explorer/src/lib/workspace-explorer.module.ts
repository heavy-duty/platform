import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ApplicationExplorerModule } from '@bulldozer-client/application-explorer';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceExplorerComponent } from './workspace-explorer.component';

@NgModule({
  imports: [CommonModule, ReactiveComponentModule, ApplicationExplorerModule],
  declarations: [WorkspaceExplorerComponent],
  exports: [WorkspaceExplorerComponent],
})
export class WorkspaceExplorerModule {}

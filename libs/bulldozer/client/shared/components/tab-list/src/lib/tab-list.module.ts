import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApplicationTabModule } from '@bulldozer-client/application-tab';
import { CollectionTabModule } from '@bulldozer-client/collection-tab';
import { ProfileTabModule } from '@bulldozer-client/profile-tab';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { ViewInstructionTabModule } from '@bulldozer-client/view-instruction';
import { WorkspaceTabModule } from '@bulldozer-client/workspace-tab';
import { TabListComponent } from './tab-list.component';

@NgModule({
  declarations: [TabListComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    WorkspaceTabModule,
    ApplicationTabModule,
    CollectionTabModule,
    ProfileTabModule,
    StopPropagationModule,
    ViewInstructionTabModule,
  ],
  exports: [TabListComponent],
})
export class TabListModule {}

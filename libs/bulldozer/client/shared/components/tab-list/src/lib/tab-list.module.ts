import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApplicationTabModule } from '@bulldozer-client/application-tab';
import { CollectionTabModule } from '@bulldozer-client/collection-tab';
import { InstructionTabModule } from '@bulldozer-client/instruction-tab';
import { ProfileTabModule } from '@bulldozer-client/profile-tab';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
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
    InstructionTabModule,
    ProfileTabModule,
    StopPropagationModule,
  ],
  exports: [TabListComponent],
})
export class TabListModule {}

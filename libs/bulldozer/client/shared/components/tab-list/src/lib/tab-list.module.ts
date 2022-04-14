import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { ApplicationTabModule } from '@bulldozer-client/application-tab';
import { CollectionTabModule } from '@bulldozer-client/collection-tab';
import { StopPropagationModule } from '@bulldozer-client/stop-propagation';
import { ViewInstructionTabModule } from '@bulldozer-client/view-instruction';
import { ViewProfileTabModule } from '@bulldozer-client/view-profile';
import { ViewWorkspaceTabModule } from '@bulldozer-client/view-workspace';
import { TabListComponent } from './tab-list.component';

@NgModule({
  declarations: [TabListComponent],
  imports: [
    CommonModule,
    MatTabsModule,
    ApplicationTabModule,
    CollectionTabModule,
    StopPropagationModule,
    ViewInstructionTabModule,
    ViewProfileTabModule,
    ViewWorkspaceTabModule,
  ],
  exports: [TabListComponent],
})
export class TabListModule {}

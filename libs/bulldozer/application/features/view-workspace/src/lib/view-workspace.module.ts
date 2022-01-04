import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { NavigationModule } from '@heavy-duty/bulldozer/application/features/navigation';
import { PageHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/page-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { ApplicationSelectorComponent } from './application-selector.component';
import { CollectionSelectorComponent } from './collection-selector.component';
import { InstructionSelectorComponent } from './instruction-selector.component';
import { ViewWorkspaceComponent } from './view-workspace.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewWorkspaceComponent,
      },
    ]),
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatSidenavModule,
    MatTabsModule,
    MatTooltipModule,
    LayoutModule,
    ReactiveComponentModule,
    NavigationModule,
    PageHeaderModule,
  ],
  declarations: [
    ViewWorkspaceComponent,
    ApplicationSelectorComponent,
    CollectionSelectorComponent,
    InstructionSelectorComponent,
  ],
  exports: [ViewWorkspaceComponent],
})
export class ViewWorkspaceModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { RouterModule } from '@angular/router';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewApplicationComponent } from './view-application.component';
@NgModule({
  declarations: [ViewApplicationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewApplicationComponent },
    ]),
    ProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    PageHeaderModule,
    ItemUpdatingModule,
  ],
})
export class ViewApplicationModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewApplicationComponent } from './view-application.component';

@NgModule({
  declarations: [ViewApplicationComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewApplicationComponent },
    ]),
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    PageHeaderModule,
    ItemUpdatingModule,
  ],
})
export class ViewApplicationModule {}

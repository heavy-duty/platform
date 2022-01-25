import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
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
    ReactiveComponentModule,
    PageHeaderModule,
  ],
})
export class ViewApplicationModule {}

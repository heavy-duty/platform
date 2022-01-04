import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/page-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewApplicationComponent } from './view-application.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewApplicationComponent,
      },
    ]),
    ReactiveComponentModule,
    PageHeaderModule,
  ],
  declarations: [ViewApplicationComponent],
})
export class ViewApplicationModule {}

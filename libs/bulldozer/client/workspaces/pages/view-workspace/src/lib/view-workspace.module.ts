import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewWorkspaceComponent } from './view-workspace.component';

@NgModule({
  declarations: [ViewWorkspaceComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewWorkspaceComponent },
    ]),
    ReactiveComponentModule,
  ],
})
export class ViewWorkspaceModule {}

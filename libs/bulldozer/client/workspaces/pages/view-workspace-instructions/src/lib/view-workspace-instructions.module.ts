import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { RelativeTimePipe } from './relative-time.pipe';
import { ViewWorkspaceInstructionsComponent } from './view-workspace-instructions.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewWorkspaceInstructionsComponent,
      },
    ]),
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    ReactiveComponentModule,
  ],
  declarations: [ViewWorkspaceInstructionsComponent, RelativeTimePipe],
})
export class ViewWorkspaceInstructionsModule {}

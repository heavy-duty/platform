import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
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
    ProgressSpinnerModule,
    ReactiveComponentModule,
  ],
  declarations: [ViewWorkspaceInstructionsComponent, RelativeTimePipe],
})
export class ViewWorkspaceInstructionsModule {}

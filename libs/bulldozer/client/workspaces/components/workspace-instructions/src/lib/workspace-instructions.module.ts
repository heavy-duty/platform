import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceInstructionsComponent } from './workspace-instructions.component';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,
    MatProgressSpinnerModule,
    ReactiveComponentModule,
    SectionHeaderModule,
  ],
  declarations: [WorkspaceInstructionsComponent],
  exports: [WorkspaceInstructionsComponent],
})
export class WorkspaceInstructionsModule {}

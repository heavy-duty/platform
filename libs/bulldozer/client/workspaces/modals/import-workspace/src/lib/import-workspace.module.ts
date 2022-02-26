import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ImportWorkspaceTriggerDirective } from './import-workspace-trigger.directive';
import { ImportWorkspaceComponent } from './import-workspace.component';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  declarations: [ImportWorkspaceComponent, ImportWorkspaceTriggerDirective],
  exports: [ImportWorkspaceTriggerDirective],
})
export class ImportWorkspaceComponentModule {}

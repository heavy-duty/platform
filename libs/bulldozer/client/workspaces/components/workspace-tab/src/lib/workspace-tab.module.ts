import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { HdSolanaMaterialModule } from '@heavy-duty/ngx-solana-material';
import { ReactiveComponentModule } from '@ngrx/component';
import { WorkspaceTabComponent } from './workspace-tab.component';

@NgModule({
  declarations: [WorkspaceTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ReactiveComponentModule,
    HdSolanaMaterialModule,
  ],
  exports: [WorkspaceTabComponent],
})
export class WorkspaceTabModule {}

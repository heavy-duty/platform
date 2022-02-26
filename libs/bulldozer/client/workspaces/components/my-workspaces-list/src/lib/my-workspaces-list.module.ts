import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { MyWorkspacesListComponent } from './my-workspaces-list.component';

@NgModule({
  declarations: [MyWorkspacesListComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    SectionHeaderModule,
  ],
  exports: [MyWorkspacesListComponent],
})
export class MyWorkspacesListModule {}

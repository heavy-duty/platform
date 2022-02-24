import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { CollaboratorsListComponent } from './collaborators-list.component';

@NgModule({
  declarations: [CollaboratorsListComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    SectionHeaderModule,
  ],
  exports: [CollaboratorsListComponent],
})
export class CollaboratorsListModule {}

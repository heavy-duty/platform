import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/page-header';
import { ReactiveComponentModule } from '@ngrx/component';

import { ViewCollectionComponent } from './view-collection.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewCollectionComponent },
    ]),
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatMenuModule,
    MatSelectModule,
    ReactiveComponentModule,
    PageHeaderModule,
  ],
  declarations: [ViewCollectionComponent],
})
export class ViewCollectionModule {}

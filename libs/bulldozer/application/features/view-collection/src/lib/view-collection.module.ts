import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { RouterModule } from '@angular/router';
import { PageHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/page-header';
import { SectionHeaderModule } from '@heavy-duty/bulldozer/application/ui/directives/section-header';
import { ReactiveComponentModule } from '@ngrx/component';

import { CollectionMenuComponent } from './collection-menu.component';
import { ListAttributesComponent } from './list-attributes.component';
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
    MatIconModule,
    MatListModule,
    MatMenuModule,
    ReactiveComponentModule,
    PageHeaderModule,
    SectionHeaderModule,
  ],
  declarations: [
    ViewCollectionComponent,
    ListAttributesComponent,
    CollectionMenuComponent,
  ],
})
export class ViewCollectionModule {}

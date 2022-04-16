import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { EditCollectionAttributeModule } from '@bulldozer-client/edit-collection-attribute';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewCollectionAttributesComponent } from './view-collection-attributes.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewCollectionAttributesComponent,
      },
    ]),
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    ItemUpdatingModule,
    EditCollectionAttributeModule,
  ],
  declarations: [ViewCollectionAttributesComponent],
})
export class ViewCollectionAttributesModule {}

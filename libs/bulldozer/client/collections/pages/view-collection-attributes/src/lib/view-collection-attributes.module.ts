import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CollectionAttributesListModule } from '@bulldozer-client/collection-attributes-list';
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
    ReactiveComponentModule,
    CollectionAttributesListModule,
  ],
  declarations: [ViewCollectionAttributesComponent],
})
export class ViewCollectionAttributesModule {}

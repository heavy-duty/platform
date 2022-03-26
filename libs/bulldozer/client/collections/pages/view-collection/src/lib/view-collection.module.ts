import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@bulldozer-client/code-editor';
import { CollectionAttributesListModule } from '@bulldozer-client/collection-attributes-list';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { PageHeaderModule } from '@bulldozer-client/page-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewCollectionComponent } from './view-collection.component';

@NgModule({
  declarations: [ViewCollectionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', pathMatch: 'full', component: ViewCollectionComponent },
    ]),
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    PageHeaderModule,
    CodeEditorModule,
    CollectionAttributesListModule,
    ItemUpdatingModule,
  ],
})
export class ViewCollectionModule {}

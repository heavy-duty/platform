import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@bulldozer-client/code-editor';
import { CollectionAttributesListModule } from '@bulldozer-client/collection-attributes-list';
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
    ReactiveComponentModule,
    PageHeaderModule,
    CodeEditorModule,
    CollectionAttributesListModule,
  ],
})
export class ViewCollectionModule {}

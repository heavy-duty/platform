import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CodeEditorModule } from '@bulldozer-client/code-editor';
import { ReactiveComponentModule } from '@ngrx/component';
import { ViewCollectionCodeComponent } from './view-collection-code.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        pathMatch: 'full',
        component: ViewCollectionCodeComponent,
      },
    ]),
    ReactiveComponentModule,
    CodeEditorModule,
  ],
  declarations: [ViewCollectionCodeComponent],
})
export class ViewCollectionCodeModule {}

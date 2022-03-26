import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { EditCollectionAttributeModule } from '@bulldozer-client/edit-collection-attribute';
import { ItemUpdatingModule } from '@bulldozer-client/item-updating';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { ReactiveComponentModule } from '@ngrx/component';
import { CollectionAttributesListComponent } from './collection-attributes-list.component';

@NgModule({
  declarations: [CollectionAttributesListComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
    SectionHeaderModule,
    EditCollectionAttributeModule,
    ItemUpdatingModule,
  ],
  exports: [CollectionAttributesListComponent],
})
export class CollectionAttributesListModule {}

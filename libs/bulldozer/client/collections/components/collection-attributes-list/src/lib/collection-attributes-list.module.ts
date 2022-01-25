import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { SectionHeaderModule } from '@bulldozer-client/section-header';
import { EditAttributeModule } from '@heavy-duty/bulldozer/application/features/edit-attribute';
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
    ReactiveComponentModule,
    SectionHeaderModule,
    EditAttributeModule,
  ],
  exports: [CollectionAttributesListComponent],
})
export class CollectionAttributesListModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { ReactiveComponentModule } from '@ngrx/component';
import { CollectionTabComponent } from './collection-tab.component';

@NgModule({
  declarations: [CollectionTabComponent],
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    ReactiveComponentModule,
  ],
  exports: [CollectionTabComponent],
})
export class CollectionTabModule {}

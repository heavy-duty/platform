import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ItemChangingPipe } from './item-changing.pipe';
import { ItemShowSpinnerPipe } from './item-show-spinner.pipe';
import { ItemUpdatingMessagePipe } from './item-updating-message.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [
    ItemUpdatingMessagePipe,
    ItemShowSpinnerPipe,
    ItemChangingPipe,
  ],
  exports: [ItemUpdatingMessagePipe, ItemShowSpinnerPipe, ItemChangingPipe],
})
export class ItemUpdatingModule {}

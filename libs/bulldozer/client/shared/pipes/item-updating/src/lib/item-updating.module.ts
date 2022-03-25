import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ItemShowSpinnerPipe } from './item-show-spinner.pipe';
import { ItemUpdatingMessagePipe } from './item-updating-message.pipe';

@NgModule({
  imports: [CommonModule],
  declarations: [ItemUpdatingMessagePipe, ItemShowSpinnerPipe],
  exports: [ItemUpdatingMessagePipe, ItemShowSpinnerPipe],
})
export class ItemUpdatingModule {}

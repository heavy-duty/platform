import { Pipe, PipeTransform } from '@angular/core';

interface ItemStats {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

@Pipe({
  name: 'bdItemShowSpinner',
})
export class ItemShowSpinnerPipe implements PipeTransform {
  transform(item: ItemStats): boolean {
    return item.isCreating || item.isUpdating || item.isDeleting;
  }
}

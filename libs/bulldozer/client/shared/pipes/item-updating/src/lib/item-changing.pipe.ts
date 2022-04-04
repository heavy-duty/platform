import { Pipe, PipeTransform } from '@angular/core';

interface ItemStats {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

@Pipe({
  name: 'bdItemChanging',
  pure: true,
})
export class ItemChangingPipe implements PipeTransform {
  transform(item: ItemStats): boolean {
    return item.isCreating || item.isUpdating || item.isDeleting;
  }
}

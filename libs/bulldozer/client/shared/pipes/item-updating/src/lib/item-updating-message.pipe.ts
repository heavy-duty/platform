import { Pipe, PipeTransform } from '@angular/core';

interface ItemStats {
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

@Pipe({
  name: 'bdItemUpdatingMessage',
})
export class ItemUpdatingMessagePipe implements PipeTransform {
  transform(title: string, stats: ItemStats, label: string): string {
    const message = `${label} "${title}"`;

    if (stats.isCreating) {
      return `${message} being created...`;
    } else if (stats.isUpdating) {
      return `${message} being updated...`;
    } else if (stats.isDeleting) {
      return `${message} being deleted...`;
    }

    return `${message}.`;
  }
}

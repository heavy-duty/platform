import { Component, Input } from '@angular/core';

@Component({
  selector: 'hd-edpoints-list-item',
  template: `
    <div class="flex items-center m-0 text-sm text-opacity-50" *ngIf="endpoint">
      <span class="font-bold mr-2">{{ label }}:</span>
      <span
        class="font-thin flex-shrink overflow-ellipsis whitespace-nowrap overflow-hidden"
        [matTooltip]="endpoint"
        matTooltipShowDelay="500"
      >
        {{ endpoint }}
      </span>
      <button
        mat-icon-button
        [cdkCopyToClipboard]="endpoint"
        aria-label="Copy API endpoint"
      >
        <mat-icon>content_copy</mat-icon>
      </button>
    </div>
  `,
})
export class HdEndpointsListItemComponent {
  @Input() label!: string;
  @Input() endpoint!: string;
}

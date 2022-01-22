import { Component, Input } from '@angular/core';

@Component({
  selector: 'hd-wallet-expand',
  template: `
    <p>{{ expanded ? collapseText : expandText }}</p>
    <mat-icon [ngClass]="{ expanded: expanded }">expand_more</mat-icon>
  `,
  styles: [
    `
      :host {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      p {
        margin: 0;
      }

      mat-icon {
        transition: 500ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      mat-icon.expanded {
        transform: rotate(180deg);
      }
    `,
  ],
})
export class WalletExpandComponent {
  @Input() expanded: boolean | null = null;
  @Input() expandText = 'More options';
  @Input() collapseText = 'Less options';
}

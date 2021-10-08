import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'bd-collection-menu',
  template: `
    <button
      class="fixed z-20 mat-elevation-z8 bottom-8 right-8"
      color="primary"
      mat-fab
      aria-label="Collection menu"
      [matMenuTriggerFor]="collectionMenu"
    >
      <mat-icon>add</mat-icon>
    </button>

    <mat-menu #collectionMenu="matMenu">
      <button
        mat-menu-item
        (click)="onCreateAttribute()"
        [disabled]="!connected"
      >
        <mat-icon>add</mat-icon>
        <span>Add attribute</span>
      </button>
    </mat-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionMenuComponent {
  @Input() connected: boolean | null = null;
  @Output() createAttribute = new EventEmitter();

  onCreateAttribute() {
    this.createAttribute.emit();
  }
}

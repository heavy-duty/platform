import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { CollectionTabStore } from './collection-tab.store';

@Component({
  selector: 'bd-collection-tab',
  template: `
    <div
      *ngIf="collection$ | ngrxPush as collection"
      class="flex items-center justify-between p-0"
    >
      <a
        [routerLink]="[
          '/workspaces',
          collection.data.workspace,
          'applications',
          collection.data.application,
          'collections',
          collection.id
        ]"
      >
        {{ collection.name }}
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + collection.name + ' tab'"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [CollectionTabStore],
})
export class CollectionTabComponent {
  @HostBinding('class') class = 'block w-full';
  @Input() set collectionId(value: string | null) {
    this._collectionTabStore.setCollectionId(value);
  }
  @Output() closeTab = new EventEmitter();
  readonly collection$ = this._collectionTabStore.collection$;

  constructor(private readonly _collectionTabStore: CollectionTabStore) {}

  onCloseTab() {
    this.closeTab.emit();
  }
}

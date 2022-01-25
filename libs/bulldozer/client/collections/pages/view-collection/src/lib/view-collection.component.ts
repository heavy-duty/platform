import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { ViewCollectionStore } from './view-collection.store';

@Component({
  selector: 'bd-view-collection',
  template: `
    <div class="flex" *ngIf="collection$ | ngrxPush as collection">
      <div class="p-4 w-1/2 bd-custom-height-layout overflow-auto">
        <header bdPageHeader>
          <h1>
            {{ collection.name }}
          </h1>
          <p>Visualize all the details about this collection.</p>
        </header>

        <main>
          <bd-collection-attributes-list class="block mb-16">
          </bd-collection-attributes-list>
        </main>
      </div>
      <div class="w-1/2 bd-custom-height-layout overflow-hidden">
        <bd-code-editor
          [customClass]="'bd-custom-monaco-editor'"
          [template]="rustCodeCollection$ | ngrxPush"
          [options]="editorOptions$ | ngrxPush"
        ></bd-code-editor>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ViewCollectionStore],
})
export class ViewCollectionComponent {
  @HostBinding('class') class = 'block';
  readonly connected$ = this._viewCollectionStore.connected$;
  readonly collection$ = this._viewCollectionStore.collection$;
  readonly rustCodeCollection$ = this._viewCollectionStore.rustCode$;
  readonly editorOptions$ = this._viewCollectionStore.editorOptions$;

  constructor(private readonly _viewCollectionStore: ViewCollectionStore) {}
}

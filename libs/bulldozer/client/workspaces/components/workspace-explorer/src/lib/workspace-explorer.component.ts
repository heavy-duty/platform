import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WorkspaceExplorerStore } from './workspace-explorer.store';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <div class="h-full flex flex-col">
      <div class="flex-grow overflow-auto">
        <figure class="pt-4 pb-4 w-full flex justify-center bg-white">
          <img src="assets/images/logo.png" class="w-4/6" />
        </figure>
        <h2 class="mt-4 text-center">BULLDOZER</h2>
        <bd-application-explorer
          [workspaceId]="workspaceId$ | ngrxPush"
        ></bd-application-explorer>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [WorkspaceExplorerStore],
})
export class WorkspaceExplorerComponent {
  readonly workspaceId$ = this._workspaceExplorerStore.workspaceId$;

  constructor(
    private readonly _workspaceExplorerStore: WorkspaceExplorerStore
  ) {}
}

import { Component } from '@angular/core';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';

@Component({
  selector: 'bd-workspace-details-explorer-instructions',
  template: `
    <div>
      <bd-workspace-instructions
        [instructionStatuses]="(instructionStatuses$ | ngrxPush) ?? null"
      ></bd-workspace-instructions>
    </div>
  `,
  styles: [],
})
export class WorkspaceDetailsExplorerInstructionsComponent {
  readonly instructionStatuses$ =
    this._workspaceInstructionsStore.instructionStatuses$;

  constructor(
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {}
}

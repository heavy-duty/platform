import { Component } from '@angular/core';
import { WorkspaceInstructionsStore } from '@bulldozer-client/workspaces-data-access';

@Component({
  selector: 'bd-view-workspace-instructions',
  template: `
    <bd-workspace-instructions
      [instructionStatuses]="(instructionStatuses$ | ngrxPush) ?? null"
    ></bd-workspace-instructions>
  `,
  styles: [],
})
export class ViewWorkspaceInstructionsComponent {
  readonly instructionStatuses$ =
    this._workspaceInstructionsStore.instructionStatuses$;

  constructor(
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {}
}

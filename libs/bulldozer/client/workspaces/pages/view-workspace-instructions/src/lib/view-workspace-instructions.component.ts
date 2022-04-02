import { Component, HostBinding } from '@angular/core';
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
  @HostBinding('class') class = 'bg-white bg-opacity-5 block h-full';
  readonly instructionStatuses$ =
    this._workspaceInstructionsStore.instructionStatuses$;

  constructor(
    private readonly _workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {}
}

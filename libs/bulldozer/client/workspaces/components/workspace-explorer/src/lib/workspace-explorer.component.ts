import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <div class="h-full flex flex-col">
      <div class="flex-grow overflow-auto">
        <bd-application-explorer
          *ngIf="workspaceId !== null"
          [connected]="connected"
          [workspaceId]="workspaceId"
        ></bd-application-explorer>
      </div>
    </div>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspaceExplorerComponent {
  @Input() connected = false;
  @Input() workspaceId: string | null = null;
}

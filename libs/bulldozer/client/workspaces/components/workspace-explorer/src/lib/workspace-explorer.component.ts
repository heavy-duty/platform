import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'bd-workspace-explorer',
  template: `
    <div class="h-full flex flex-col">
      <div class="flex-grow overflow-auto bd-custom-height-sidebar">
        <div class="flex flex-col items-center pt-3 bd-custom-background">
          <bd-workspace-selector
            class="mb-3"
            [connected]="connected"
          ></bd-workspace-selector>
        </div>
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

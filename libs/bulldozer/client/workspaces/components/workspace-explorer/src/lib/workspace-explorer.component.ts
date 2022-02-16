import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

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

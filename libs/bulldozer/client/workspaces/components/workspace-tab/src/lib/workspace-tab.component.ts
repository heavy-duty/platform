import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { filter, first, pairwise } from 'rxjs';
import { WorkspaceTabStore } from './workspace-tab.store';

@Component({
  selector: 'bd-workspace-tab',
  template: `
    <div
      *ngIf="workspace$ | ngrxPush as workspace"
      class="flex items-stretch p-0"
    >
      <a
        [routerLink]="['/workspaces', workspace.id]"
        class="flex items-center pl-4 flex-grow"
      >
        <span>
          {{ workspace.name }}
        </span>
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + workspace.name + ' tab'"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [WorkspaceTabStore],
})
export class WorkspaceTabComponent implements OnInit {
  @HostBinding('class') class = 'block w-full';
  @Input() set workspaceId(value: string | null) {
    this._workspaceTabStore.setWorkspaceId(value);
  }
  @Output() closeTab = new EventEmitter();
  readonly workspace$ = this._workspaceTabStore.workspace$;

  constructor(private readonly _workspaceTabStore: WorkspaceTabStore) {}

  ngOnInit() {
    this.workspace$
      .pipe(
        pairwise(),
        filter(([, workspace]) => workspace === null),
        first()
      )
      .subscribe(() => this.onCloseTab());
  }

  onCloseTab() {
    this.closeTab.emit();
  }
}

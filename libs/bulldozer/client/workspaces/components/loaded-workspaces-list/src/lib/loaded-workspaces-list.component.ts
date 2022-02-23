import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Document, Workspace } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-loaded-workspaces-list',
  template: `
    <section>
      <mat-card>
        <header bdSectionHeader>
          <h2>Loaded Workspaces</h2>
          <p>Visualize all your loaded workspaces.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="workspaces && workspaces.length > 0; else emptyList"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let workspace of workspaces; let i = index"
            class="h-20 bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ workspace.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Workspace ID:
                  {{ workspace.id }}
                </p>
                <a
                  class="text-xs underline text-primary"
                  [routerLink]="['/workspaces', workspace.id]"
                >
                  View details
                </a>
              </div>
              <button
                mat-mini-fab
                aria-label="Remove workspace"
                color="warn"
                (click)="onRemoveWorkspace(workspace.id)"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">
            You don't have loaded workspaces.
          </p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadedWorkspacesListComponent {
  @Input() workspaces: Document<Workspace>[] | null = null;
  @Output() removeWorkspace = new EventEmitter<string>();

  onRemoveWorkspace(workspaceId: string) {
    this.removeWorkspace.emit(workspaceId);
  }
}

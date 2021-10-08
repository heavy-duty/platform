import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { InstructionArgument } from '@heavy-duty/bulldozer/data-access';

@Component({
  selector: 'bd-list-arguments',
  template: `
    <section>
      <mat-card class="mb-4">
        <header bdSectionHeader>
          <h2>Arguments</h2>
          <p>Visualize the list of arguments and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="arguments && arguments.length > 0; else emptyList"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let argument of arguments; let i = index"
            class="h-20 bg-black bg-opacity-10 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ argument.data.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Type:
                  <ng-container *ngIf="argument.data.modifier.name !== 'none'">
                    {{ argument.data.modifier.name }}
                    <ng-container
                      *ngIf="argument.data.modifier.name === 'array'"
                    >
                      ({{ argument.data.modifier.size }})
                    </ng-container>
                    of
                  </ng-container>
                  {{ argument.data.kind.name }}.
                </p>
              </div>
              <button
                mat-mini-fab
                color="primary"
                aria-label="Argument menu"
                [matMenuTriggerFor]="argumentMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #argumentMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateInstructionArgument(argument)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update argument</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteInstructionArgument(argument.id)"
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete argument</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no arguments yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListArgumentsComponent {
  @Input() connected: boolean | null = null;
  @Input() arguments: InstructionArgument[] | null = null;
  @Output() updateArgument = new EventEmitter<InstructionArgument>();
  @Output() deleteArgument = new EventEmitter<string>();

  onUpdateInstructionArgument(argument: InstructionArgument) {
    this.updateArgument.emit(argument);
  }

  onDeleteInstructionArgument(argumentId: string) {
    this.deleteArgument.emit(argumentId);
  }
}

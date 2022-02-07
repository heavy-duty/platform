import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  Document,
  InstructionArgument,
  InstructionArgumentDto,
} from '@heavy-duty/bulldozer-devkit';
import { InstructionArgumentsListStore } from './instruction-arguments-list.store';

@Component({
  selector: 'bd-instruction-arguments-list',
  template: `
    <section>
      <mat-card>
        <header bdSectionHeader>
          <h2>
            Arguments
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction argument"
              bdEditInstructionArgumentTrigger
              (editInstructionArgument)="onCreateInstructionArgument($event)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of arguments and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="
            instructionArguments && instructionArguments.length > 0;
            else emptyList
          "
        >
          <mat-list-item
            role="listitem"
            *ngFor="
              let instructionArgument of instructionArguments;
              let i = index
            "
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
                  {{ instructionArgument.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Type:

                  <ng-container *ngIf="instructionArgument.data.modifier">
                    {{ instructionArgument.data.modifier.name }}
                    <ng-container
                      *ngIf="instructionArgument.data.modifier.name === 'array'"
                    >
                      ({{ instructionArgument.data.modifier?.size }})
                    </ng-container>
                    of
                  </ng-container>

                  {{ instructionArgument.data.kind.name }}.
                </p>
              </div>
              <button
                mat-mini-fab
                color="primary"
                aria-label="Arguments menu"
                [matMenuTriggerFor]="instructionArgumentMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #instructionArgumentMenu="matMenu">
                <button
                  mat-menu-item
                  bdEditInstructionArgumentTrigger
                  [instructionArgument]="instructionArgument"
                  (editInstructionArgument)="
                    onUpdateInstructionArgument(instructionArgument.id, $event)
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update argument</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteInstructionArgument(instructionArgument.id)"
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
  providers: [InstructionArgumentsListStore],
})
export class InstructionArgumentsListComponent {
  @Input() connected = false;
  @Input() instructionArguments: Document<InstructionArgument>[] | null = null;
  @Output() createInstructionArgument =
    new EventEmitter<InstructionArgumentDto>();
  @Output() updateInstructionArgument = new EventEmitter<{
    instructionArgumentId: string;
    instructionArgumentDto: InstructionArgumentDto;
  }>();
  @Output() deleteInstructionArgument = new EventEmitter<string>();

  onCreateInstructionArgument(instructionArgumentDto: InstructionArgumentDto) {
    this.createInstructionArgument.emit(instructionArgumentDto);
  }

  onUpdateInstructionArgument(
    instructionArgumentId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this.updateInstructionArgument.emit({
      instructionArgumentId,
      instructionArgumentDto,
    });
  }

  onDeleteInstructionArgument(instructionArgumentId: string) {
    this.deleteInstructionArgument.emit(instructionArgumentId);
  }
}

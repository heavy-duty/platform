import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-list-arguments',
  template: `
    <section>
      <mat-card>
        <header bdSectionHeader>
          <h2>Arguments</h2>
          <p>Manage arguments of the instruction.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="arguments && arguments.length > 0; else emptyList"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let argument of arguments; let i = index"
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
                  {{ argument.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Type:

                  <ng-container *ngIf="argument.data.modifier">
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
                  (click)="onUpdateArgument(argument)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update argument</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteArgument(argument)"
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
  @Input() connected?: boolean | null = null;
  @Input() arguments?: Document<InstructionArgument>[] | null = null;
  @Output() updateArgument = new EventEmitter<Document<InstructionArgument>>();
  @Output() deleteArgument = new EventEmitter<Document<InstructionArgument>>();

  onUpdateArgument(argument: Document<InstructionArgument>) {
    this.updateArgument.emit(argument);
  }

  onDeleteArgument(argument: Document<InstructionArgument>) {
    this.deleteArgument.emit(argument);
  }
}

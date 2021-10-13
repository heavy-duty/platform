import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'bd-instruction-menu',
  template: `
    <button
      class="fixed z-20 mat-elevation-z8 bottom-8 right-8"
      color="primary"
      mat-fab
      aria-label="Instruction menu"
      [matMenuTriggerFor]="instructionMenu"
    >
      <mat-icon>add</mat-icon>
    </button>

    <mat-menu #instructionMenu="matMenu">
      <button
        mat-menu-item
        (click)="onCreateArgument()"
        [disabled]="!connected"
      >
        <mat-icon>add</mat-icon>
        <span>Add argument</span>
      </button>
      <button mat-menu-item [matMenuTriggerFor]="addAccountMenu">
        Add account
      </button>
      <button
        mat-menu-item
        (click)="onCreateRelation()"
        [disabled]="!connected"
      >
        <mat-icon>add</mat-icon>
        <span>Add relation</span>
      </button>
    </mat-menu>

    <mat-menu #addAccountMenu="matMenu">
      <button
        mat-menu-item
        (click)="onCreateBasicAccount()"
        [disabled]="!connected"
      >
        <mat-icon>description</mat-icon>
        <span>Basic account</span>
      </button>
      <button
        mat-menu-item
        (click)="onCreateSignerAccount()"
        [disabled]="!connected"
      >
        <mat-icon>rate_review</mat-icon>
        <span>Signer account</span>
      </button>
      <button
        mat-menu-item
        (click)="onCreateProgramAccount()"
        [disabled]="!connected"
      >
        <mat-icon>group_work</mat-icon>
        <span>Program account</span>
      </button>
    </mat-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionMenuComponent {
  @Input() connected: boolean | null = null;
  @Output() createArgument = new EventEmitter();
  @Output() createBasicAccount = new EventEmitter();
  @Output() createSignerAccount = new EventEmitter();
  @Output() createProgramAccount = new EventEmitter();
  @Output() createRelation = new EventEmitter();

  onCreateArgument() {
    this.createArgument.emit();
  }

  onCreateBasicAccount() {
    this.createBasicAccount.emit();
  }

  onCreateSignerAccount() {
    this.createSignerAccount.emit();
  }

  onCreateProgramAccount() {
    this.createProgramAccount.emit();
  }

  onCreateRelation() {
    this.createRelation.emit();
  }
}

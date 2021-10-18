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
      <button
        mat-menu-item
        (click)="onCreateDocument()"
        [disabled]="!connected"
      >
        <mat-icon>add</mat-icon>
        <span>Add document</span>
      </button>
      <button mat-menu-item (click)="onCreateSigner()" [disabled]="!connected">
        <mat-icon>add</mat-icon>
        <span>Add signer</span>
      </button>
    </mat-menu>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionMenuComponent {
  @Input() connected: boolean | null = null;
  @Output() createArgument = new EventEmitter();
  @Output() createDocument = new EventEmitter();
  @Output() createSigner = new EventEmitter();
  @Output() createProgramAccount = new EventEmitter();
  @Output() createRelation = new EventEmitter();

  onCreateArgument() {
    this.createArgument.emit();
  }

  onCreateDocument() {
    this.createDocument.emit();
  }

  onCreateSigner() {
    this.createSigner.emit();
  }

  onCreateProgramAccount() {
    this.createProgramAccount.emit();
  }

  onCreateRelation() {
    this.createRelation.emit();
  }
}

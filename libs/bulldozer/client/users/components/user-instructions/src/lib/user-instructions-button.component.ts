import { Component, Input } from '@angular/core';

@Component({
  selector: 'bd-user-instructions-button',
  template: `
    <ng-container
      *bdUserInstructions="let instructionsInProcess = instructionsInProcess"
    >
      <button
        *ngIf="
          instructionsInProcess !== null &&
          (showEmpty || instructionsInProcess > 0)
        "
        type="button"
        mat-raised-button
        bdUserInstructionsTrigger
      >
        <div class="flex justify-between items-center gap-2">
          <span> Instructions in Process ({{ instructionsInProcess }}) </span>
          <mat-progress-spinner
            diameter="16"
            mode="indeterminate"
            [color]="color"
          >
          </mat-progress-spinner>
        </div>
      </button>
    </ng-container>
  `,
})
export class UserInstructionsButtonComponent {
  @Input() color = 'primary';
  @Input() showEmpty = false;
}

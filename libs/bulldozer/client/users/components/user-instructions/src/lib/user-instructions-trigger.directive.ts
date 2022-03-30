import { Directive, HostListener } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UserInstructionsComponent } from './user-instructions.component';

@Directive({ selector: 'button[bdUserInstructions]' })
export class UserInstructionsDirective {
  @HostListener('click') onClick() {
    this._matBottomSheet.open(UserInstructionsComponent, {});
  }

  constructor(private readonly _matBottomSheet: MatBottomSheet) {}
}

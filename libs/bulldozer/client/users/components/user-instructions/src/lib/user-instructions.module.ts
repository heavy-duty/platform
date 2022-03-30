import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserInstructionsButtonComponent } from './user-instructions-button.component';
import { UserInstructionsComponent } from './user-instructions.component';
import { UserInstructionsDirective } from './user-instructions.directive';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatListModule,
    MatProgressSpinnerModule,
  ],
  declarations: [
    UserInstructionsComponent,
    UserInstructionsDirective,
    UserInstructionsButtonComponent,
    UserInstructionsDirective,
  ],
  exports: [
    UserInstructionsDirective,
    UserInstructionsButtonComponent,
    UserInstructionsDirective,
  ],
})
export class UserInstructionsModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReactiveComponentModule } from '@ngrx/component';
import { RelativeTimePipe } from './relative-time.pipe';
import { UserInstructionsButtonComponent } from './user-instructions-button.component';
import { UserInstructionsStoreDirective } from './user-instructions-store.directive';
import { UserInstructionsComponent } from './user-instructions.component';
import { UserInstructionsDirective } from './user-instructions.directive';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    ReactiveComponentModule,
  ],
  declarations: [
    RelativeTimePipe,
    UserInstructionsComponent,
    UserInstructionsDirective,
    UserInstructionsButtonComponent,
    UserInstructionsStoreDirective,
  ],
  exports: [
    UserInstructionsDirective,
    UserInstructionsButtonComponent,
    UserInstructionsStoreDirective,
  ],
})
export class UserInstructionsModule {}

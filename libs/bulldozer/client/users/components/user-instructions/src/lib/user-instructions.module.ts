import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { ProgressPingModule } from '@heavy-duty/ui/progress-ping';
import { ProgressSpinnerModule } from '@heavy-duty/ui/progress-spinner';
import { ReactiveComponentModule } from '@ngrx/component';
import { RelativeTimePipe } from './relative-time.pipe';
import { UserInstructionsBottomSheetComponent } from './user-instructions-bottom-sheet.component';
import { UserInstructionsBottomSheetDirective } from './user-instructions-bottom-sheet.directive';
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
    ProgressSpinnerModule,
    ProgressPingModule,
    MatTooltipModule,
    ReactiveComponentModule,
  ],
  declarations: [
    RelativeTimePipe,
    UserInstructionsComponent,
    UserInstructionsDirective,
    UserInstructionsBottomSheetComponent,
    UserInstructionsBottomSheetDirective,
    UserInstructionsButtonComponent,
    UserInstructionsStoreDirective,
    UserInstructionsBottomSheetComponent,
  ],
  exports: [
    UserInstructionsDirective,
    UserInstructionsBottomSheetDirective,
    UserInstructionsButtonComponent,
    UserInstructionsStoreDirective,
  ],
})
export class UserInstructionsModule {}

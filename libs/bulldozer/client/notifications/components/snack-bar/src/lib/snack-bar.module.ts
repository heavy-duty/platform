import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import {
  SnackBarClassPipe,
  SnackBarComponent,
  SnackBarPoleComponent,
} from './snack-bar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [SnackBarPoleComponent, SnackBarClassPipe, SnackBarComponent],
  exports: [SnackBarComponent],
})
export class SnackBarModule {}

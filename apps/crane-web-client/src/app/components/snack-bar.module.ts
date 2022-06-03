import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
	SnackBarClassPipe,
	SnackBarComponent,
	SnackBarPoleComponent,
} from './snack-bar.component';

@NgModule({
	imports: [CommonModule, MatSnackBarModule],
	exports: [SnackBarComponent],
	declarations: [SnackBarPoleComponent, SnackBarClassPipe, SnackBarComponent],
})
export class SnackBarModule {}

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RotateDirective } from './rotate.directive';

@NgModule({
	imports: [CommonModule],
	declarations: [RotateDirective],
	exports: [RotateDirective],
})
export class RotateModule {}

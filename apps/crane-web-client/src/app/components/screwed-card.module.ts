import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RotateModule } from '../directives/rotate.module';
import { ScrewedCardComponent } from './screwed-card.component';

@NgModule({
	imports: [CommonModule, RotateModule],
	exports: [ScrewedCardComponent],
	declarations: [ScrewedCardComponent],
})
export class ScrewedCardModule {}

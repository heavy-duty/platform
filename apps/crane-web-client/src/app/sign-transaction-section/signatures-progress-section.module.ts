import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrewedCardModule } from '../components/screwed-card.module';
import { SignaturesProgressSectionComponent } from './signatures-progress-section.component';

@NgModule({
	imports: [CommonModule, MatProgressBarModule, ScrewedCardModule],
	exports: [SignaturesProgressSectionComponent],
	declarations: [SignaturesProgressSectionComponent],
})
export class SignaturesProgressSectionModule {}

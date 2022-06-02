import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveComponentModule } from '@ngrx/component';
import { ScrewedCardModule } from '../components/screwed-card.module';
import { BlockhashStatusSectionComponent } from './blockhash-status-section.component';

@NgModule({
	imports: [
		CommonModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
		ReactiveComponentModule,
		ScrewedCardModule,
	],
	exports: [BlockhashStatusSectionComponent],
	declarations: [BlockhashStatusSectionComponent],
	providers: [],
})
export class BlockhashStatusSectionModule {}

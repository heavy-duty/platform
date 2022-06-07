import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrewedCardComponent } from '../../components';
import { Option } from '../../utils';

@Component({
	selector: 'crane-signatures-progress-section',
	template: `
		<crane-screwed-card
			*ngIf="signaturesDone !== null && signaturesRequired !== null"
			class="bg-black bg-bp-metal-2 px-6 py-4 rounded block"
		>
			<p>Signatures required:</p>

			<mat-progress-bar
				class="example-margin"
				[value]="signaturesProgress"
				color="primary"
				mode="determinate"
			>
			</mat-progress-bar>

			<span>{{ signaturesDone }}</span
			>/<span>{{ signaturesRequired }}</span>
		</crane-screwed-card>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	standalone: true,
	imports: [CommonModule, MatProgressBarModule, ScrewedCardComponent],
})
export class SignaturesProgressSectionComponent {
	signaturesProgress: Option<number> = null;

	private _signaturesDone: Option<number> = null;

	@Input() set signaturesDone(value: Option<number>) {
		this._signaturesDone = value;
		this.updateProgress();
	}

	get signaturesDone() {
		return this._signaturesDone;
	}

	private _signaturesRequired: Option<number> = null;

	@Input() set signaturesRequired(value: Option<number>) {
		this._signaturesRequired = value;
		this.updateProgress();
	}

	get signaturesRequired() {
		return this._signaturesRequired;
	}

	private updateProgress() {
		if (this.signaturesDone !== null && this.signaturesRequired !== null) {
			this.signaturesProgress =
				(this.signaturesDone * 100) / this.signaturesRequired;
		}
	}
}

import { Component, Input } from '@angular/core';
import { Option } from '../utils';

@Component({
  selector: 'crane-signatures-progress',
  template: `
    <div *ngIf="signaturesDone !== null && signaturesRequired !== null">
      <p>Signatures required:</p>

      <mat-progress-bar
        class="example-margin"
        color="primary"
        mode="determinate"
        [value]="signaturesProgress"
      >
      </mat-progress-bar>

      <span>{{ signaturesDone }}</span
      >/<span>{{ signaturesRequired }}</span>
    </div>
  `,
})
export class SignaturesProgressComponent {
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

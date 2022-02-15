import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpEndpoint, WebSocketEndpoint } from '@heavy-duty/ngx-solana';
import { httpEndpoint } from './http-endpoint.validator';
import { webSocketEndpoint } from './web-socket-endpoint.validator';

@Component({
  selector: 'hd-edit-endpoints-modal',
  template: `
    <header>
      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Close edit endpoints modal"
      >
        <mat-icon>close</mat-icon>
      </button>
      <h2>Edit Endpoints</h2>
    </header>

    <form
      class="flex flex-col gap-4 w-80 mx-4 mb-4"
      [formGroup]="form"
      (ngSubmit)="onEditEndpoints()"
    >
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>API Endpoint</mat-label>
        <input matInput formControlName="apiEndpoint" />
        <mat-error
          *ngIf="submitted && form.get('apiEndpoint')?.hasError('required')"
        >
          The API endpoint is mandatory.
        </mat-error>
        <mat-error
          *ngIf="submitted && form.get('apiEndpoint')?.hasError('httpEndpoint')"
        >
          The API endpoint format is incorrect.
        </mat-error>
      </mat-form-field>
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>WebSocket Endpoint</mat-label>
        <input matInput formControlName="webSocketEndpoint" />
        <mat-error
          *ngIf="
            submitted && form.get('webSocketEndpoint')?.hasError('required')
          "
        >
          The WebSocket endpoint is mandatory.
        </mat-error>
        <mat-error
          *ngIf="
            submitted &&
            form.get('webSocketEndpoint')?.hasError('webSocketEndpoint')
          "
        >
          The WebSocket endpoint format is incorrect.
        </mat-error>
      </mat-form-field>

      <button type="submit" mat-raised-button color="primary">
        Submit Changes
      </button>
    </form>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .mat-dialog-title {
        margin: 0;
      }

      header {
        margin-bottom: 2.5rem;
      }

      header h2 {
        font-size: 1.5rem;
        text-align: center;
        padding: 0 3rem;
        font-weight: bold;
      }

      header button {
        display: block;
        margin-left: auto;
        margin-right: 1rem;
        margin-top: 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HdEditEndpointsComponent {
  submitted = false;
  form: FormGroup;

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly _matDialogRef: MatDialogRef<
      HdEditEndpointsComponent,
      {
        apiEndpoint: HttpEndpoint;
        webSocketEndpoint: WebSocketEndpoint;
      }
    >,
    @Inject(MAT_DIALOG_DATA)
    data: {
      apiEndpoint: HttpEndpoint;
      webSocketEndpoint: WebSocketEndpoint;
    }
  ) {
    this.form = this._formBuilder.group({
      apiEndpoint: [
        data.apiEndpoint,
        {
          validators: [Validators.required, httpEndpoint()],
        },
      ],
      webSocketEndpoint: [
        data.webSocketEndpoint,
        {
          validators: [Validators.required, webSocketEndpoint()],
        },
      ],
    });
  }

  onEditEndpoints() {
    this.submitted = true;

    if (this.form.valid) {
      this._matDialogRef.close(this.form.value);
    }
  }
}

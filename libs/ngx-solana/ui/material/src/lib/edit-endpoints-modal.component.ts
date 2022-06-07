import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Inject,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HttpEndpoint } from '@heavy-duty/ngx-solana';
import { httpEndpoint, webSocketEndpoint } from '@heavy-duty/ngx-solana-cdk';
import { WebSocketEndpoint } from '@heavy-duty/ngx-websocket';

@Component({
  selector: 'hd-edit-endpoints-modal',
  template: `
    <header class="mb-10">
      <button
        mat-icon-button
        mat-dialog-close
        aria-label="Close edit endpoints modal"
        class="block ml-auto mr-4 mt-4"
      >
        <mat-icon>close</mat-icon>
      </button>
      <h2 class="text-2xl text-center px-12 py-0 font-bold">Edit Endpoints</h2>
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
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HdEditEndpointsComponent {
  @HostBinding('class') class = 'block';
  submitted = false;
  form: UntypedFormGroup;

  constructor(
    private readonly _formBuilder: UntypedFormBuilder,
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

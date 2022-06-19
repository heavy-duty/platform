import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'bd-edit-account',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>Select Type</h2>

		<div>
			<bd-card class="flex flex-col">
				<div class="flex-1 flex">
					<button class="bp-button flex-1" (click)="onUncheckedSelected()">
						Unchecked
					</button>
					<button class="bp-button flex-1" (click)="onDocumentSelected()">
						Document
					</button>
				</div>
				<div class="flex-1 flex">
					<button class="bp-button flex-1" (click)="onMintSelected()">
						Mint
					</button>
					<button class="bp-button flex-1" (click)="onTokenSelected()">
						Token
					</button>
				</div>
			</bd-card>
		</div>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddInstructionAccountComponent {
	@HostBinding('class') class = 'block w-72 relative';

	constructor(
		private readonly _matDialogRef: MatDialogRef<AddInstructionAccountComponent>
	) {}

	onUncheckedSelected() {
		this._matDialogRef.close('unchecked');
	}

	onDocumentSelected() {
		this._matDialogRef.close('document');
	}

	onMintSelected() {
		this._matDialogRef.close('mint');
	}

	onTokenSelected() {
		this._matDialogRef.close('token');
	}
}

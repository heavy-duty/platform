import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
	selector: 'bd-add-workspace',
	template: `
		<h2 class="mat-primary bp-font" mat-dialog-title>Add workspace</h2>

		<div
			class="w-full py-4 px-7 h-16 flex justify-center items-center m-auto bg-bp-metal-2 bg-black shadow relative"
		>
			<button class="bp-button flex-1" mat-dialog-close>Cancel</button>
			<button class="bp-button flex-1" (click)="onNewWorkspace()">
				Create
			</button>
			<button class="bp-button flex-1" (click)="onImportWorkspace()">
				Import
			</button>

			<div
				class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 left-2"
			>
				<div class="w-full h-px bg-gray-600 rotate-45"></div>
			</div>
			<div
				class="w-2 h-2 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-7 right-2"
			>
				<div class="w-full h-px bg-gray-600"></div>
			</div>
		</div>
	`,
	styles: [],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWorkspaceComponent {
	@HostBinding('class') class = 'block w-72 relative';

	constructor(
		private readonly _matDialogRef: MatDialogRef<AddWorkspaceComponent>
	) {}

	onNewWorkspace() {
		this._matDialogRef.close('new');
	}

	onImportWorkspace() {
		this._matDialogRef.close('import');
	}
}

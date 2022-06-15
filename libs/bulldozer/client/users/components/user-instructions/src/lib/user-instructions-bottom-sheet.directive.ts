import { Directive, HostListener } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { UserInstructionsStore2 } from '@bulldozer-client/users-data-access';
import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { Observable } from 'rxjs';
import { UserInstructionsBottomSheetComponent } from './user-instructions-bottom-sheet.component';

@Directive({ selector: 'button[bdUserInstructionsBottomSheet]' })
export class UserInstructionsBottomSheetDirective {
	@HostListener('click') onClick() {
		this._matBottomSheet.open<
			UserInstructionsBottomSheetComponent,
			Observable<List<InstructionStatus> | null>
		>(UserInstructionsBottomSheetComponent, {
			data: this._userInstructionsStore.groupedInstructionStatuses$,
			panelClass: ['bg-bp-wood', 'bg-bp-brown'],
		});
	}

	constructor(
		private readonly _matBottomSheet: MatBottomSheet,
		private readonly _userInstructionsStore: UserInstructionsStore2
	) {}
}
